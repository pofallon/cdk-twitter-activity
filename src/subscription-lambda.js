import * as AWS from 'aws-sdk'
const { TwitterClient } = require('twttr')

const environment = process.env.ENVIRONMENT_NAME
let twitter

const getTwitter = async () => {
  let ssm = new AWS.SSM()
  let response = await ssm.getParameters({Names: [
    process.env.KEY_PARAMETER_NAME, 
    process.env.SECRET_PARAMETER_NAME, 
    process.env.ACCESS_TOKEN_NAME, 
    process.env.ACCESS_TOKEN_SECRET_NAME
  ], WithDecryption: true}).promise()
  let consumerKey = response.Parameters.find(p => p.Name === process.env.KEY_PARAMETER_NAME).Value
  let consumerSecret = response.Parameters.find(p => p.Name === process.env.SECRET_PARAMETER_NAME).Value
  let accessToken = response.Parameters.find(p => p.Name === process.env.ACCESS_TOKEN_NAME).Value
  let accessTokenSecret = response.Parameters.find(p => p.Name === process.env.ACCESS_TOKEN_SECRET_NAME).Value
  let t = new TwitterClient({ consumerKey, consumerSecret, accessToken, accessTokenSecret })
  return(t)
}

const create = async (props, twitter) => {

  let url = `1.1/account_activity/all/${environment}/webhooks.json?url=${encodeURIComponent(props.WebhookUrl)}`
  try {
    var response = await twitter.post(url, {})
  } catch (e) {
    console.log('Error:')
    console.log(e.response.data)
    throw new Error(e)
  }
  return({ 'PhysicalResourceId': response.data.id })

}

const remove = async (id, twitter) => {

  let url = `1.1/account_activity/all/${environment}/webhooks/${id}.json`
  await twitter.delete(url)
  return ({ 'PhysicalResourceId': id })

}

export const handler = async (event) => {

  twitter = twitter || await getTwitter()
  
  switch(event['RequestType']) {
    case 'Create':
      return create(event.ResourceProperties, twitter)
    case 'Update':
      return Promise.resolve({ 'PhysicalResourceId' : event.PhysicalResourceId })
    case 'Delete':
      return remove(event.PhysicalResourceId, twitter)
    default:
      throw new Error(`Invalid request type '${event['RequestType']}'`)
  }

};