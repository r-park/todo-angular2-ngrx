const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');


//=========================================================
//  ENVIRONMENT VARS
//---------------------------------------------------------
const NODE_ENV = process.env.NODE_ENV;

const ENV_DEVELOPMENT = NODE_ENV === 'development';
const ENV_PRODUCTION = NODE_ENV === 'production';
const ENV_TEST = NODE_ENV === 'test';

const HOST = 'localhost';
const PORT = 3000;


//=========================================================
//  CONFIG
//---------------------------------------------------------
const config = {};
module.exports = config;


config.resolve = {
  extensions: ['', '.ts', '.js'],
  modulesDirectories: ['node_modules'],
  root: path.resolve('.')
};

config.module = {
  loaders: [
    {test: /\.html$/, loader: 'raw'},
    {test: /\.ts$/, loader: 'ts', exclude: /node_modules/},
    {test: /\.scss$/, loader: 'raw!postcss-loader!sass', exclude: path.resolve('src/views/common/styles'), include: path.resolve('src/views')}
  ],

  noParse: [
    /angular2\/bundles\/.+/
  ]
};

config.plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
  })
];

config.postcss = [
  autoprefixer({ browsers: ['last 3 versions', 'Firefox ESR'] })
];

config.sassLoader = {
  outputStyle: 'compressed',
  precision: 10,
  sourceComments: false
};


//=====================================
//  DEVELOPMENT or PRODUCTION
//-------------------------------------
if (ENV_DEVELOPMENT || ENV_PRODUCTION) {
  config.devtool = 'source-map';

  config.entry = {
    main: [
      './src/main'
    ],
    vendor: [
      'es6-shim',
      'angular2/bundles/angular2-polyfills',
      'angular2/common',
      'angular2/core',
      'angular2/http',
      'angular2/platform/browser',
      'angular2/router',
      'rxjs',
      '@ngrx/store'
    ]
  };

  config.output = {
    filename: '[name].js',
    path: path.resolve('./target'),
    publicPath: '/'
  };

  config.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor', filename: 'vendor.js', minChunks: Infinity
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      hash: true,
      inject: 'body',
      template: './src/index.html'
    })
  );
}


//=====================================
//  DEVELOPMENT
//-------------------------------------
if (ENV_DEVELOPMENT) {
  config.entry.main.unshift(`webpack-dev-server/client?http://${HOST}:${PORT}`);

  config.module.loaders.push(
    {test: /\.scss$/, loader: 'style!css!postcss-loader!sass', include: path.resolve('src/views/common/styles')}
  );

  config.devServer = {
    contentBase: './src',
    historyApiFallback: true,
    host: HOST,
    port: PORT,
    publicPath: config.output.publicPath,
    stats: {
      cached: true,
      cachedAssets: true,
      chunks: true,
      chunkModules: false,
      colors: true,
      hash: false,
      reasons: true,
      timings: true,
      version: false
    }
  };
}


//=====================================
//  PRODUCTION
//-------------------------------------
if (ENV_PRODUCTION) {
  config.module.loaders.push(
    {test: /\.scss$/, loader: ExtractTextPlugin.extract('css!postcss-loader!sass'), include: path.resolve('src/views/common/styles')}
  );

  config.plugins.push(
    new ExtractTextPlugin('styles.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      compress: {
        dead_code: true, // eslint-disable-line camelcase
        screw_ie8: true, // eslint-disable-line camelcase
        unused: true,
        warnings: false
      }
    })
  );
}


//=====================================
//  TEST
//-------------------------------------
if (ENV_TEST) {
  config.devtool = 'inline-source-map';

  config.module.loaders.push(
    {test: /\.scss$/, loader: 'style!css!postcss-loader!sass', include: path.resolve('src/views/common/styles')}
  );
}
