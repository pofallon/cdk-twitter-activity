import { handler } from '../lib/webhook.lambda'

test('foo', () => {
  handler({
    requestContext: {
      http: {
        sourceIp: '0.0.0.0'
      }
    }
  }).then(response => {
    expect(response).toHaveProperty('statusCode', 403)
  })
})