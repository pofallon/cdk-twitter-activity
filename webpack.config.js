var path = require('path');

module.exports = {
  entry: {
    'subscription-lambda': './src/subscription-lambda.js',
    'webhook-lambda': './src/webhook-lambda.js'
  },
  mode: 'production',
  externals: {
    'aws-sdk': 'commonjs2 aws-sdk'
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'lambda-dist'),
    filename: '[name]/index.js',
    libraryTarget: 'umd'
  }
}