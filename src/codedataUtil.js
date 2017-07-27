
import {encrypt,decrypt} from "./util";



 export const codedataUtil={

   buildOptionsFromInputCodedata:function(connector,codedata, options){
        var buildOptions={
          connectSession:codedata.session,
          url:codedata.url,
          aes:codedata.aes
        }
        if(!options){
            return buildOptions;
        }
        else{
            return Object.assign(buildOptions,options);
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
   onError(options,message, error){
       var errorMessage=null;
       if(error){
         errorMessage=error+" "+message
       }
       else{
         errorMessage=message;
       }

       if(options.onError){
          options.onError(errorMessage);
       }
       else{
         console.error(errorMessage);
       }


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
            this.onError(options,"while decrypting the codedata with common key",error);
            return;
          }
     }
     else if(encryptionType==="A"){
       console.log("decrypting with codeAES:"+encryptedContent);
       try{
              decryptedContent=decrypt(encryptedContent,connector.codeAES);
            }
       catch(error){
         this.onError(options,"failed to decrypt:"+encryptedContent+" with:"+connector.codeAES,error);
         return;
       }
     }
     else if(encryptionType==="N"){
        decryptedContent=encryptedContent;
        console.log("it is not encrypted:"+decryptedContent);
     }
     else{

       this.onError(options,"unrecognized format:encryptionType="+encryptionType+" encryptedcodedata=["+encryptedcodedata+"]");
       return;
     }

      if(!decryptedContent){
        this.onError(options,"failed to decrypt encryptedcodedata=["+encryptedcodedata+"]");
        return;
      }
      console.log("decrypted codedata:"+decryptedContent);
      var dataFormat=decryptedContent.substring(0,1);
      var dataContent=decryptedContent.substring(1);
      var codedata=null;

      if(dataFormat==="J"){
          try{
                codedata=JSON.parse(dataContent);
            }
            catch(error){
              this.onError(options,"codedata is not in the correct json dataContent=["+dataContent+"]",error);
              return;
            }
      }
      else{
          this.onError(options,"decrypted content is not in the recognized format:dataFormat:"+dataFormat+" dataContent:"+dataContent);
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
