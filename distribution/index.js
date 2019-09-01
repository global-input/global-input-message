"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "generatateRandomString", {
  enumerable: true,
  get: function get() {
    return _util.generatateRandomString;
  }
});
Object.defineProperty(exports, "encrypt", {
  enumerable: true,
  get: function get() {
    return _util.encrypt;
  }
});
Object.defineProperty(exports, "decrypt", {
  enumerable: true,
  get: function get() {
    return _util.decrypt;
  }
});
exports.createMessageConnector = void 0;

var _GlobalInputMessageConnector = _interopRequireDefault(require("./GlobalInputMessageConnector"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createMessageConnector = function createMessageConnector() {
  return new _GlobalInputMessageConnector.default();
};

exports.createMessageConnector = createMessageConnector;