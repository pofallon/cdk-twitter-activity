var path = require('path');

module.exports = {
  entry: './lib/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: { 
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: false
            }
          }
        },
        exclude: /node_modules/
      },
    ],
  },
  mode: 'production',
  externals: {
    'aws-sdk': 'commonjs2 aws-sdk'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd'
  }
}