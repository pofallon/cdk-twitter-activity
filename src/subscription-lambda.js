const AWS = require('aws-sdk')
const { TwitterClient } = require('twttr')

const environment = process.env.ENVIRONMENT_NAME
let twitter

// https://tech.mybuilder.com/handling-retries-and-back-off-attempts-with-javascript-promises/
const pause = (duration) => new Promise(res => setTimeout(res, duration));
const backoff = (retries, fn, delay = 500) =>
  fn().catch(err => retries > 1
    ? pause(delay).then(() => backoff(retries - 1, fn, delay * 2))
    : Promise.reject(err));

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

  console.log(`Attempting to register webhook ${props.WebhookUrl}`)

  let url = `1.1/account_activity/all/${environment}/webhooks.json?url=${encodeURIComponent(props.WebhookUrl)}`
  try {
    var response = await backoff(5, () => twitter.post(url), 2000)
    await twitter.post(`1.1/account_activity/all/${environment}/subscriptions.json`)
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

module.exports.handler = async (event) => {

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

}