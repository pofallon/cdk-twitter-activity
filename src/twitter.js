const crypto = require('crypto')
const OAuth = require('oauth-1.0a')
const axios = require('axios')

export class Twitter {

  constructor (consumerKey, consumerSecret) {
    this.baseUrl = 'https://api.twitter.com/'
    this.token = {}
    let oauth = OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function (baseString, key) {
        return crypto.createHmac('sha1', key).update(baseString).digest('base64')
      }
    })
    axios.interceptors.request.use((config) => {
      config.headers = oauth.toHeader(oauth.authorize({
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        data: config.data
      }, this.token))
      return config
    })
    axios.defaults.baseURL = this.baseUrl
  }

  async get(api) { return axios.get(api) }
  async post(api, data = {}) { return axios.post(api, data) }
  async delete(api) { return axios.delete(api) }

}