
import {encrypt,decrypt} from "./util";

const sharedKey="50SUB39ctEKzd6Uv2a84lFK";

export const buildOptionsFromInputCodedata = (connector,codedata, options) => {
        const {session,url,aes,apikey,securityGroup}=codedata;
        return {
          connectSession:session,
          url,aes,apikey,securityGroup,
          ...options
        };
   };

export const buildInputCodeData = (connector,data={}) => {
       const {url,session,apikey,aes,codeAES}=connector;
       const codedata={...data,url, session,apikey, aes, action:'input'};
       if(codeAES){
          return "A"+encrypt("J"+JSON.stringify(codedata),codeAES);
       }
       else{
          return "NJ"+JSON.stringify(codedata);
       }
};


export  const buildPairingData = (connector,data={}) => {
     const {securityGroup,codeAES}=connector;
     const codedata={securityGroup,codeAES,action:'pairing',...data};     
     return "C"+encrypt("J"+JSON.stringify(codedata),sharedKey);
};

const onError = (options,message, error) => {
       if(options.onError){
          options.onError(message);
       }
       else{
          console.warn(message);
       }
       if(error){
         console.warn(error);
       }
};

export const processCodeData = (connector,encryptedCodedata, options) => {
     if(!encryptedCodedata){
       console.log("empty codedata");
       return;
     }
     const encryptionType=encryptedCodedata.substring(0,1);
     const encryptedContent=encryptedCodedata.substring(1);
     let decryptedContent=null;
     switch(encryptionType){
              case 'C':
                    try{
                      decryptedContent=decrypt(encryptedContent,sharedKey);
                      break;
                    }
                    catch(error){
                      onError(options,"May not ne a global Input code (C) ",error);
                      return;
                    }
             case 'A':                    
                    try{
                          decryptedContent=decrypt(encryptedContent,options.codeAES?options.codeAES:connector.codeAES);
                          break;
                        }
                    catch(error){
                      onError(options,"May not be global input code (A)",error);
                      return;
                    }
          case 'N':
                    decryptedContent=encryptedContent;
                    break;
          default:
                    onError(options,"Not a Global Input code (N)  ");
                    return;
     }     
      if(!decryptedContent){
            onError(options,"Not a global Input code (E)");
            return;
      }
      const dataFormat=decryptedContent.substring(0,1);
      const dataContent=decryptedContent.substring(1);
      let codedata=null;

      if(dataFormat==="J"){
          try{
                codedata=JSON.parse(dataContent);
            }
            catch(error){
              onError(options," incorrect format decrypted",error);
              return;
            }
      }
      else{
          onError(options,"unrecognized format decrypted");
          return;
      }
      if(codedata.action=='input'){
            if(options.onInputCodeData){
                options.onInputCodeData(codedata);
            }
      }
      else if(codedata.action=='pairing'){
            if(options.onPairing){
                options.onPairing(codedata);
            }
      }
};
