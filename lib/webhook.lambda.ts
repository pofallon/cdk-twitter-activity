import * as AWS from 'aws-sdk'
import * as crypto from 'crypto'
import { inRange } from 'range_check'

const eventbridge = new AWS.EventBridge()

let secret: string

const getSecret = async () => {
  const ssm = new AWS.SSM()
  const response = await ssm.getParameter({Name: '/twitter/consumer_api_secret_key', WithDecryption: true}).promise()
  return response.Parameter?.Value ?? ' '
}

const handler = async (event: any) => {

  // console.log(event)

  const ip = event.requestContext.http.sourceIp
  if (!inRange(ip,['199.59.148.0/22','199.16.156.0/22'])) {
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

    const results = await eventbridge.putEvents({
      Entries: [
        {
            Detail: event.body,
            EventBusName: process.env.EVENTBUS_NAME,
            Source: process.env.EVENT_SOURCE,
            DetailType
        }
      ]
    }).promise()

    if (results?.FailedEntryCount) {
      // console.log(results)
    }

    return { statusCode: 200 }

  }

}

export { handler }