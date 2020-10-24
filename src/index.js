import GlobalInputMessageConnector from "./GlobalInputMessageConnector";
import {generateRandomString,encrypt,decrypt} from "./util";


 const createMessageConnector=function(){
   return new GlobalInputMessageConnector();
 }
 const generatateRandomString=generateRandomString; //will be removed in the future

 export {generateRandomString,generatateRandomString,encrypt,decrypt,createMessageConnector};

 

 const createPromise=target=>{
  target.promise=new Promise((resolve, reject)=>{
      target.resolve=resolve;
      target.reject=reject;            
  });
};

export const createWaitForInputMessage = (target) => {    
  const input={};                
  createPromise(input);    
  target.onInput = (message) => {            
          input.resolve(message);
          createPromise(input);
  };        
  input.get =  () => input.promise;
      
  return input;      
};



export const createWaitForFieldMessage = (fields) => {    
  return fields.map(field => {
      field.operations={};
      return createWaitForInputMessage(field.operations)}
      );    
};