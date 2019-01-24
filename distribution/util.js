"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.generatateRandomString = generatateRandomString;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.basicGetURL = basicGetURL;

var _cryptoJs = require("crypto-js");

var _cryptoJs2 = _interopRequireDefault(_cryptoJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generatateRandomString() {
  var length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

  var randPassword = Array(length).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) {
    return x[Math.floor(Math.random() * x.length)];
  }).join('');
  return randPassword;
}
function encrypt(content, password) {
  return escape(_cryptoJs2.default.AES.encrypt(content, password).toString());
}
function decrypt(content, password) {
  return _cryptoJs2.default.AES.decrypt(unescape(content), password).toString(_cryptoJs2.default.enc.Utf8);
}
function basicGetURL(url, onSuccess, onError) {
  var request = new XMLHttpRequest();
  request.ontimeout = function (e) {
    console.warn("requesting socket server url timeout");
    onError();
  };
  request.onreadystatechange = function (e) {
    if (e) {
      var cache = [];
      console.log(JSON.stringify(e, function (key, value) {
        if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object' && value != null) {
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