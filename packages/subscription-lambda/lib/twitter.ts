const crypto = require('crypto')
const OAuth = require('oauth-1.0a')
const axios = require('axios')

export class Twitter {
  public baseUrl: string
  public token: { key?:string, secret?:string }

  constructor (consumerKey : string, consumerSecret : string) {
    this.baseUrl = 'https://api.twitter.com/'
    this.token = {}
    let oauth = OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function (baseString : string, key : string) {
        return crypto.createHmac('sha1', key).update(baseString).digest('base64')
      }
    })
    axios.interceptors.request.use((config: any) => {
      config.headers = oauth.toHeader(oauth.authorize({
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        data: config.data
      }, this.token))
      return config
    })
    axios.defaults.baseURL = this.baseUrl
  }
  get = async (api: string) => axios.get(api)
  post = async (api: string, data: any) => axios.post(api, data)
  delete = async (api: string) => axios.delete(api)
}