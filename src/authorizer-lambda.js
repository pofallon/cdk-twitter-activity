const AWS = require('aws-sdk')
const crypto = require('crypto')

let secret

const getSecret = async () => {
  const ssm = new AWS.SSM()
  const response = await ssm.getParameter({
    Name: process.env.SECRET_PARAMETER_NAME,
    WithDecryption: true
  }).promise()
  return response.Parameter.Value
}

let policy = {
  "principalId": "twitter",
  "policyDocument": {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Deny",
        "Resource": ""
      }
    ]
  }
}

module.exports.handler = async (event) => {
  secret = secret || await getSecret()

  console.log(event)

  const signature = event.headers['X-Twitter-Webhooks-Signature'].split('=')[1]
  console.log(`Evaluating signature '${signature}'`)
  const digest = crypto.createHmac('sha256', secret).update(JSON.stringify(event.body)).digest('base64')

  console.log(`Comparing to digest '${digest}'`)
  if (signature === digest) {
    policy.Statement[0].Effect = 'Allow'
    policy.Statement[0].Resource = event.methodArn
  }

  return(policy)
}