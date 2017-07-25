
import {encrypt,decrypt} from "./util";



 export const codedataUtil={

   buildOptionsFromInputCodedata:function(connector,codedata){
        return {
          connectSession:codedata.session,
          url:codedata.url,
          aes:codedata.aes,
          actor:"input"
        }
   },
   buildInputCodeData:function(connector,data={}){
       var codedata=Object.assign({},data,{
                   url:connector.url,
                   session:connector.session,
                   action:"input",
                   aes:connector.aes
       });

        console.log("the input data being used for codedata:"+JSON.stringify(codedata));
       if(connector.codeAES){
          return "A"+encrypt("J"+JSON.stringify(codedata),connector.codeAES);
       }
       else{
          return "NJ"+JSON.stringify(codedata);
       }
   },
   buildAPIKeyCodeData(connector,data={}){
     var codedata=Object.assign({},data,{
                 apikey:connector.apikey,
                 action:"settings"
     });
     if(connector.codeAES){
            return "A"+encrypt("J"+JSON.stringify(codedata),connector.codeAES);
     }
     else{
            return "NJ"+JSON.stringify(codedata);
     }

   },
   buildSessionGroupCodeData(connector,data={}){
     var codedata=Object.assign({},data,{
                 sessionGroup:connector.sessionGroup,
                 action:"settings"
     });
     if(connector.codeAES){
        return "A"+encrypt("J"+JSON.stringify(codedata),connector.codeAES);
     }
     else{
         return "NJ"+JSON.stringify(codedata),connector.codeAES;
     }

   },
   buildCodeAESCodeData(connector,data={}){
     var codedata=Object.assign({},data,{
                 codeAES:connector.codeAES,
                 action:"settings"
     });
     return "C"+encrypt("J"+JSON.stringify(codedata),"LNJGw0x5lqnXpnVY8");
   },

   processCodeData(connector,encryptedcodedata, options){
     if(!encryptedcodedata){
       console.log("empty codedata");
       return;
     }


     var encryptionType=encryptedcodedata.substring(0,1);
     var encryptedContent=encryptedcodedata.substring(1);
     var decryptedContent=null;
     if(encryptionType==="C"){
          console.log("It is a code secret");
          try{
            decryptedContent=decrypt(encryptedContent,"LNJGw0x5lqnXpnVY8");
          }
          catch(error){
            console.error(error+" while decrupting the codedata");
            return;
          }
     }
     else if(encryptionType==="A"){
       console.log("decrypting with codeAES:"+encryptedContent);
       try{
              decryptedContent=decrypt(encryptedContent,connector.codeAES);
            }
       catch(error){
         console.error(error+" failed to decrypted:"+encryptedContent+" with:"+connector.codeAES);
       }
     }
     else if(encryptionType==="N"){
        decryptedContent=encryptedContent;
        console.log("it is not encrypted:"+decryptedContent);
     }
     else{
       console.log("unrecognized format");
       return;
     }

      if(!decryptedContent){
        console.error("unable to descrypt the codedata:"+encryptedContent);
        return;
      }
      var dataFormat=decryptedContent.substring(0,1);
      var dataContent=decryptedContent.substring(1);
      var codedata=null;

      if(dataFormat==="J"){
          try{
                codedata=JSON.parse(dataContent);
            }
            catch(error){
              console.error(error+" parse json is failed:"+codedatastring);
              return;
            }
      }
      else{
        console.log("decrypted content is not recognized:"+decryptedContent);
        return;
      }
      if(codedata.action=='input'){
            console.log("codedata action is input");
            if(options.onInputCodeData){
                options.onInputCodeData(codedata);
            }
      }
      else if(codedata.action=='settings'){
            console.log("calling the onSettingsCodeData");
            if(options.onSettingsCodeData){
                options.onSettingsCodeData(codedata);
            }
      }
   }

}
