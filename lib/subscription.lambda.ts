import * as AWS from 'aws-sdk'
import { TwitterClient } from 'twttr'

const environment = process.env.ENVIRONMENT_NAME
let twitter: TwitterClient

// https://tech.mybuilder.com/handling-retries-and-back-off-attempts-with-javascript-promises/
const pause = (duration: number) => new Promise(res => setTimeout(res, duration));
const backoff = (retries: number, fn: () => any, delay = 500) =>
  fn().catch((err: Error) => retries > 1
    ? pause(delay).then(() => backoff(retries - 1, fn, delay * 2))
    : Promise.reject(err));

const getTwitter = async () => {
  const ssm = new AWS.SSM()
  const response = await ssm.getParameters({Names: [
    '/twitter/consumer_api_key',
    '/twitter/consumer_api_secret_key',
    '/twitter/access_token',
    '/twitter/access_token_secret'
  ], WithDecryption: true}).promise()
  const consumerKey = response.Parameters?.find(p => p.Name === '/twitter/consumer_api_key')?.Value ?? ''
  const consumerSecret = response.Parameters?.find(p => p.Name === '/twitter/consumer_api_secret_key')?.Value ?? ''
  const accessToken = response.Parameters?.find(p => p.Name === '/twitter/access_token')?.Value
  const accessTokenSecret = response.Parameters?.find(p => p.Name === '/twitter/access_token_secret')?.Value
  const t = new TwitterClient({ consumerKey, consumerSecret, accessToken, accessTokenSecret })
  return(t)
}

const create = async (props: any, t: TwitterClient) => {

  // console.log(`Attempting to register webhook ${props.WebhookUrl}`)

  const url = `1.1/account_activity/all/${environment}/webhooks.json?url=${encodeURIComponent(props.WebhookUrl)}`
  let response
  try {
    response = await backoff(5, () => t.post(url), 2000)
    await twitter.post(`1.1/account_activity/all/${environment}/subscriptions.json`)
  } catch (e) {
    // console.log('Error:')
    // console.log(e.response.data)
    throw new Error(e)
  }
  return({ 'PhysicalResourceId': response.data.id })

}

const remove = async (id: string, t: TwitterClient) => {

  const url = `1.1/account_activity/all/${environment}/webhooks/${id}.json`
  await t.delete(url)
  return ({ 'PhysicalResourceId': id })

}

module.exports.handler = async (event: any) => {

  twitter = twitter || await getTwitter()

  switch(event.RequestType) {
    case 'Create':
      return create(event.ResourceProperties, twitter)
    case 'Update':
      return Promise.resolve({ 'PhysicalResourceId' : event.PhysicalResourceId })
    case 'Delete':
      return remove(event.PhysicalResourceId, twitter)
    default:
      throw new Error(`Invalid request type '${event.RequestType}'`)
  }

}