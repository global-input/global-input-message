const path = require('path')
var webpackconfig={
    entry: './src/index.js',
    mode:'development',
    output: {      
      filename: 'globalinputmessage.js',
      path: __dirname + '/distribution'
      
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: path.resolve(__dirname, 'src'),
            exclude: /(node_modules|bower_components|build)/,
            use: {
                loader: 'babel-loader',
                options: {
                presets: ['@babel/env']
            }
        }
        }]
    }
  };
module.exports = webpackconfig;

  console.log("----**----:"+webpackconfig.output.path+":****"+__dirname);