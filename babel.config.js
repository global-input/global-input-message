const presets = [
    ['@babel/preset-env',{
      "targets": { "browsers": ["last 2 chrome versions"] },
    //  "useBuiltIns": "entry"
    }],
  ];  
  module.exports = { presets};