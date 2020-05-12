const AWS = require('aws-sdk')
const crypto = require('crypto')

const eventbridge = new AWS.EventBridge()

let secret

const getSecret = async () => {
  let ssm = new AWS.SSM()
  let response = await ssm.getParameter({Name: '/twitter/consumer_api_secret_key', WithDecryption: true}).promise()
  return response.Parameter.Value
}

module.exports.handler = async (event) => {

  console.log(event)
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

    } else {

      const parsedBody = JSON.parse(event.body)

      await eventbridge.putEvents({
        Entries: [
          {
              Detail: event.body,
              EventBusName: process.env.EVENTBUS_NAME
          }
        ]
      }).promise()

      console.log(`Successfully PUT event to ${process.env.EVENTBUS_NAME}`)

      return { statusCode: 200 }

    }

  }

};