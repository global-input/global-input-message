import GlobalInputMessageConnector from "./GlobalInputMessageConnector";
import {generateRandomString,encrypt,decrypt} from "./util";


 const createMessageConnector=function(){
   return new GlobalInputMessageConnector();
 }
 

 export {generateRandomString,encrypt,decrypt,createMessageConnector};

export const createInputReceivers = (config={})=>{    
    let inputs=null;
    let input=null;
    if(config.initData && config.initData.form && config.initData.form.fields){
        inputs=config.initData.form.fields.map(field => {
            field.operations={};
            return createWaitForInputMessage(field.operations)}
        );
    }
    else {
        input=createWaitForInputMessage(config);
    }    
    return {config,input,inputs};
}

 const createPromise=target=>{
  target.promise=new Promise((resolve, reject)=>{
      target.resolve=resolve;
      target.reject=reject;            
  });
};

const createWaitForInputMessage = (target) => {    
  const input={};                
  createPromise(input);    
  target.onInput = (message) => {            
          input.resolve(message);
          createPromise(input);
  };        
  input.get =  () => input.promise;
      
  return input;      
};




