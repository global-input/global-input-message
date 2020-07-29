import GlobalInputMessageConnector from "./GlobalInputMessageConnector";
import {generateRandomString,encrypt,decrypt} from "./util";
export * from './messageUtil';

 const createMessageConnector=function(){
   return new GlobalInputMessageConnector();
 }
 const generatateRandomString=generateRandomString; //will be removed in the future

 export {generateRandomString,generatateRandomString,encrypt,decrypt,createMessageConnector};

 

