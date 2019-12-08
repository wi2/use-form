const webpack = require('webpack')
const path = require('path')
const externalReact = require('webpack-external-react')

const ROOT = __dirname
const DESTINATION = path.join(ROOT, '/dist')
const SRC = path.join(ROOT, '/src')
/** wepback resolve */
const RESOLVE = {
  extensions: ['.js', '.jsx'],
}

/** webpack plugins */
const PLUGINS = []
const MODULE = {
  rules: [],
}
const OUTPUT = {
  filename: 'index.js',
  libraryTarget: 'commonjs2',
  library: '@wi2/use-form',
  path: DESTINATION,
}

module.exports = {
  node: {
    fs: 'empty',
  },
  entry: {
    app: ROOT + '/src/index.js',
  },
  externals: [
    externalReact.externals
  ],
  module: {
    noParse: [
      ...externalReact.noParse,
    ],
  },
  context: ROOT,
  resolve: RESOLVE,
  mode: 'production',
  module: MODULE,
  plugins: PLUGINS,
  devtool: 'source-map',
  devServer: {},
  output: OUTPUT,
}
