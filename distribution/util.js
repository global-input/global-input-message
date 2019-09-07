"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generatateRandomString = generatateRandomString;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.basicGetURL = basicGetURL;

var _cryptoJs = _interopRequireDefault(require("crypto-js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generatateRandomString() {
  let length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
  var randPassword = Array(length).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@£$&*:;").map(function (x) {
    var indexString = _cryptoJs.default.enc.Hex.stringify(_cryptoJs.default.lib.WordArray.random(1));

    var indexValue = parseInt(indexString, 16);
    return x[indexValue % x.length];
  }).join('');
  return randPassword;
}

function encrypt(content, password) {
  return escape(_cryptoJs.default.AES.encrypt(content, password).toString());
}

function decrypt(content, password) {
  return _cryptoJs.default.AES.decrypt(unescape(content), password).toString(_cryptoJs.default.enc.Utf8);
}

function basicGetURL(url, onSuccess, onError) {
  var request = new XMLHttpRequest();

  request.ontimeout = e => {
    console.warn("requesting socket server url timeout");
    onError();
  };

  request.onreadystatechange = e => {
    if (e) {
      var cache = [];
      console.log(JSON.stringify(e, (key, value) => {
        if (typeof value === 'object' && value != null) {
          if (cache.indexOf(value) != -1) {
            return;
          }

          cache.push(value);
        }

        return value;
      }));
    }

    if (request.readyState !== 4) {
      return;
    }

    if (request.status === 200) {
      onSuccess(JSON.parse(request.responseText));
    } else {
      onError();
    }
  };

  request.open('GET', url, true);
  request.send();
}