const AWS = require('aws-sdk')
const crypto = require('crypto')
const IPCIDR = require('ip-cidr')

const eventbridge = new AWS.EventBridge()

const cidr1 = new IPCIDR('199.59.148.0/22')
const cidr2 = new IPCIDR('199.16.156.0/22')

let secret

const getSecret = async () => {
  let ssm = new AWS.SSM()
  let response = await ssm.getParameter({Name: '/twitter/consumer_api_secret_key', WithDecryption: true}).promise()
  return response.Parameter.Value
}

module.exports.handler = async (event) => {

  console.log(event)

  const ip = event.requestContext.http.sourceIp
  if (!cidr1.contains(ip) && !cidr2.contains(ip)) {
    return { statusCode: 403 }
  }

  secret = secret || await getSecret()

  if (event.requestContext.http.method === 'GET') {
      
    const responseBody = {
      response_token: 'sha256=' + crypto.createHmac('sha256', secret).update(event.queryStringParameters.crc_token).digest('base64')
    }

    return { 
      statusCode: 200,
      body: JSON.stringify(responseBody)
    };

  } else {

    const signature = event.headers['x-twitter-webhooks-signature'].substring(7)
    const digest = crypto.createHmac('sha256', secret).update(event.body).digest('base64')
    if (signature !== digest) {
      return { statusCode: 400 }
    }

    const parsedBody = JSON.parse(event.body)
    const DetailType = Object.keys(parsedBody).find(k => k.endsWith('_events'))

    let results = await eventbridge.putEvents({
      Entries: [
        {
            Detail: event.body,
            EventBusName: process.env.EVENTBUS_NAME,
            Source: process.env.EVENT_SOURCE,
            DetailType
        }
      ]
    }).promise()

    if (results.FailedEntryCount > 0) {
      console.log(results)
    }

    return { statusCode: 200 }

  }

};