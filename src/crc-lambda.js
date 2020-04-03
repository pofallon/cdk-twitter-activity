import * as AWS from 'aws-sdk'
import * as crypto from 'crypto'

let secret

const getSecret = async () => {
  let ssm = new AWS.SSM()
  let response = await ssm.getParameter({Name: process.env.SECRET_PARAMETER_NAME, WithDecryption: true}).promise()
  return response.Parameter.Value
}

export const handler = async (event) => {

  console.log(event)

  secret = secret || await getSecret()
  console.log(`Validating CRC token '${event.queryStringParameters.crc_token}'`)
  let responseBody = {
    response_token: 'sha256=' + crypto.createHmac('sha256', secret).update(event.queryStringParameters.crc_token).digest('base64')
  }
  console.log(`Responding with response_token: '${responseBody.response_token}'`)

  return { 
    statusCode: 200,
    body: JSON.stringify(responseBody)
  };
};