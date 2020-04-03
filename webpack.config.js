var path = require('path');

module.exports = {
  entry: {
    'crc-lambda': './src/crc-lambda.js',
    'subscription-lambda': './src/subscription-lambda.js'
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
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/index.js',
    libraryTarget: 'umd'
  }
}