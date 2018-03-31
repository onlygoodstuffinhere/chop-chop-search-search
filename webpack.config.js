const path = require('path');
const copyWebpack = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'ezsrc.js'
  },
  plugins: [
        new copyWebpack([
            { from: 'ui/*.js' },
	    { from: 'ui/*.css'},
	    { from: 'ui/*.html'},
	    { from: 'manifest.json'},
	    { from: 'pics/*'}
        ])
    ]
  
};

