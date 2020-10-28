import GlobalInputMessageConnector from "./GlobalInputMessageConnector";
import { generateRandomString, encrypt, decrypt } from "./util";


const createMessageConnector = function () {
  return new GlobalInputMessageConnector();
}


export { generateRandomString, encrypt, decrypt, createMessageConnector };





