import SocketIOClient from "socket.io-client";
import {encrypt,decrypt} from "./aes";



 class GlobalInputMessageConnector{
    log(message){
      console.log(this.client+":"+message);
    }
    generatateRandomString(length=10){
      var randPassword = Array(length).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
      return randPassword;
    }

    constructor(){
        this.apikey="k7jc3QcMPKEXGW5UC";
        this.sessionGroup="1CNbWCFpsbmRQuKdd";
        this.codeAES="LNJGw0x5lqnXpnVY8";
        this.session=this.generatateRandomString(17);
        this.client=this.generatateRandomString(17);
        this.aes=this.generatateRandomString(17);
        this.socket=null;
        this.connectedInputSenders=new Map();
        this.url="https://globalinput.co.uk";
        this.actor="receiver";
    }

    isConnected(){
      return this.socket!=null;
    }
    disconnect(){
        if(this.socket){
          this.socket.disconnect();
          this.socket=null;
        }
        this.targetSession=null;
    }
    setCodeAES(codeAES){
      this.codeAES=codeAES;
    }
    connect(options={}){
        this.disconnect();

         if(options.apikey){
              this.apikey=options.apikey;
         }
         if(options.sessionGroup){
           this.sessionGroup=options.sessionGroup;
         }
         if(options.client){
           this.client=options.client;
         }

          if(options.url){
            this.url=options.url;
          }
          if(options.actor){
            this.actor=options.actor;
          }
          this.log("connecting to:"+this.url);
          this.socket=SocketIOClient(this.url);
          const that=this;
          this.socket.on("registerPermission", function(data){
                 that.log("registerPermission message is received:"+data);
                  that.onRegisterPermission(JSON.parse(data), options);
          });
          this.log("connection process complete, will for permisstion to register");
    }
    onRegisterPermission(registerPermistion, options){
         if(registerPermistion.result==="ok"){
                 var that=this;
                 this.socket.on("registered", function(data){
                         that.log("received the registered message:"+data);
                         var registeredMessage=JSON.parse(data);
                         if(options.onRegistered){
                            options.onRegistered(function(){
                                that.onRegistered(registeredMessage,options);
                            },registeredMessage,options);
                         }
                         else{
                              that.onRegistered(registeredMessage,options);
                         }
                 });
                 const registerMessage={
                       sessionGroup:this.sessionGroup,
                       session:this.session,
                       client:this.client,
                       apikey:this.apikey
                 };
                 this.log("sending register message");
                 this.socket.emit("register", JSON.stringify(registerMessage));
         }
         else{
                this.log("failed to get register permission");
         }


    }


    onRegistered(registeredMessage, options){
            var that=this;
            this.socket.on(this.session+"/inputPermission", function(data){
                that.log("inputPermission message is received:"+data);
                const inputPermissionMessage=JSON.parse(data);
                if(options.onInputPermission){
                    options.onInputPermission(function(){
                        inputPermissionMessage.allow=true;
                        that.onInputPermission(inputPermissionMessage,options);
                    },function(){
                      inputPermissionMessage.allow=false;
                      that.onInputPermission(inputPermissionMessage,options);
                    },inputPermissionMessage,options);
                }
                else{
                    inputPermissionMessage.allow=true;
                    that.onInputPermission(inputPermissionMessage,options);
                }
            });
            if(options.connectSession){
                    that.socket.on(options.connectSession+"/inputPermissionResult", function(data){
                    that.log("inputPermissionResult is received "+data);
                    that.onInputPermissionResult(JSON.parse(data),options);
                    });
                    const requestInputPermissionMessage={
                          sessionGroup:that.sessionGroup,
                          session:that.session,
                          client:that.client,
                          connectSession:options.connectSession
                    };
                    const data=JSON.stringify(requestInputPermissionMessage)
                    this.log("sending the requestInputPermissionMessage:"+data);
                    this.socket.emit("inputPermision",data);
            }

    }

    onInputPermission(inputPermissionMessage,options){
            var that=this;
            const inputSender=this.buildInputSender(inputPermissionMessage,options);
            this.connectedInputSenders.set(inputPermissionMessage.client,inputSender);
            if(options.onSendedJoin){
                      options.onSendedJoin(inputSender);
            }
            this.socket.on(that.session+"/input", inputSender.onInput);
            this.socket.on(that.session+"/leave",inputSender.onLeave);
            var inputPermissionResult=Object.assign({},inputPermissionMessage);
            if(options.metadata){
                    inputPermissionResult.metadata=options.metadata;
                    if(this.aes){
                        inputPermissionResult.metadata=encrypt(JSON.stringify(options.metadata),this.aes);
                    }
            }
            var data=JSON.stringify(inputPermissionResult)
            this.log("sending the inputPermissionResult  message:"+data);
            this.socket.emit(this.session+"/inputPermissionResult",data);
    }

    onInputPermissionResult(inputPermissionResultMessage, options){
            this.connectSession=options.connectSession;
            this.inputAES=options.aes;
            if(this.inputAES && inputPermissionResultMessage.metadata && typeof inputPermissionResultMessage.metadata ==="string"){
                   const descryptedMetadata=decrypt(inputPermissionResultMessage.metadata,this.inputAES);
                   this.log("decrypted metadata:"+descryptedMetadata);
                  inputPermissionResultMessage.metadata=JSON.parse(descryptedMetadata);
            }
            else{
                  this.log("received metadata is not encrypted");
            }


            if(options.onInputPermissionResult){
              options.onInputPermissionResult(inputPermissionResultMessage);
            }
    }

    buildInputSender(inputPermissionMessage,options){
      var that=this;
      var inputSender={
        client:inputPermissionMessage.client,
        session:inputPermissionMessage.session,
        onInput:function(data){
            that.log("input message received:"+data);
            if(options.onInput){
                const inputMessage=JSON.parse(data);
                if(inputMessage.client===that.client){
                    that.log("input message is coming from itself:"+data);
                  }
                else{

                    if(that.aes && inputMessage.data && typeof inputMessage.data ==="string"){
                          var dataDecrypted=decrypt(inputMessage.data,that.aes);
                          that.log("decrypted inputdata :"+dataDecrypted);
                          inputMessage.data=JSON.parse(dataDecrypted);
                    }
                    else{
                      that.log("received input data is not encrypted");
                    }

                    options.onInput(inputMessage);
                  }

              }

         },
         onLeave:function(data){
             that.log("leave request is received:"+data);
             const leaveMessage=JSON.parse(data);
             const inputSenderToLeave=that.connectedInputSenders.get(leaveMessage.client);
             if(inputSenderToLeave){
                 that.socket.removeListener(this.session+"/input",inputSenderToLeave.onInput);
                 that.socket.removeListener(this.session+"/leave",inputSenderToLeave.onLeave);
                 that.connectedInputSenders.delete(leaveMessage.client);
                 that.log("sender is removed:"+that.connectedInputSenders.size);
                 if(options.onLeave){
                     options.onLeave(inputSenderToLeave);
                 }
               }
         }
      };
      return inputSender;
    }





   sendInputMessage(data){
      if(!this.isConnected()){
           this.log("not connected yet");
           return;
      }

      var message={
          client:this.client,
          session:this.session,
          connectSession:this.connectSession,
          data
      }
      if(this.inputAES){
          const contentToEncrypt=JSON.stringify(message.data);
          this.log("content to be encrypted:"+contentToEncrypt);
          const contentEcrypted=encrypt(contentToEncrypt,this.inputAES);
          this.log("content encrypted:"+contentEcrypted);
          message.data=contentEcrypted;
      }

       const content=JSON.stringify(message);
       this.log("sending input message  to:"+this.connectSession+" content:"+content);
       this.socket.emit(this.connectSession+'/input', content);


   }
   sendMetadata(metadata){
     if(!this.isConnected()){
          this.log("not connected yet");
          return;
     }
     var message={
         client:this.client,
         connectSession:this.connectSession,
         metadata
     }
     const content=JSON.stringify(message);
     this.log("sending metdata message  to:"+this.connectSession+" content:"+content);
     this.socket.emit(this.connectSession+'/metadata', content);
   }


   buildInputCodeData(data={}){
       var codedata=Object.assign({},data,{
                   url:this.url,
                   session:this.session,
                   action:"input",
                   aes:this.aes
       });
       if(this.codeAES){
          return "A"+encrypt("J"+JSON.stringify(codedata),this.codeAES);
       }
       else{
          return "NJ"+JSON.stringify(codedata);
       }

   }
   buildAPIKeyCodeData(data={}){
     var codedata=Object.assign({},data,{
                 apikey:this.apikey,
                 action:"settings"
     });
     if(this.codeAES){
            return "A"+encrypt("J"+JSON.stringify(codedata),this.codeAES);
     }
     else{
            return "NJ"+JSON.stringify(codedata);
     }

   }
   buildSessionGroupCodeData(data={}){
     var codedata=Object.assign({},data,{
                 sessionGroup:this.sessionGroup,
                 action:"settings"
     });
     if(this.codeAES){
        return "A"+encrypt("J"+JSON.stringify(codedata),this.codeAES);
     }
     else{
         return "NJ"+JSON.stringify(codedata),this.codeAES;
     }

   }
   buildCodeAESCodeData(data={}){
     var codedata=Object.assign({},data,{
                 codeAES:this.codeAES,
                 action:"settings"
     });
     return "C"+encrypt("J"+JSON.stringify(codedata),"LNJGw0x5lqnXpnVY8");
   }

   processCodeData(opts={},encryptedcodedata){
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
              decryptedContent=decrypt(encryptedContent,this.codeAES);
            }
       catch(error){
         console.error(error+" failed to decrypted:"+encryptedContent+" with:"+this.codeAES);
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
            console.log("calling the onInputCodeData");
            var that=this;
            if(opts.onSettings){
              opts.onInputCodeData(codedata, function(){
                    that.onInputCodeData(opts,codedata);
              });
            }
            else{
              this.onInputCodeData(opts,codedata);
            }
      }
      if(codedata.action=='settings'){
            console.log("calling the onSettingsCodeData");
            var that=this;
            if(opts.onSettingsCodeData){
              opts.onSettingsCodeData(codedata, function(){
                    that.onSettingsCodeData(opts,codedata);
              });
            }
            else{
              this.onSettingsCodeData(opts,codedata);
            }
      }
   }
   onInputCodeData(opts, codedata){
     const options=Object.assign({},opts);
     options.connectSession=codedata.session;
     options.url=codedata.url;
     options.aes=codedata.aes;
     options.actor="input";
     console.log("calling the connect from processCodeData");
     this.connect(options);
   }
   onSettingsCodeData(opts,codedata){

        if(codedata.apikey){
           this.apikey=codedata.apikey;
        }
        if(codedata.sessionGroup){
          this.sessionGroup=codedata.sessionGroup;
        }
        if(codedata.codeAES){
          this.codeAES=codedata.codeAES;
        }

   }

}


 export function createMessageConnector(){
   return new GlobalInputMessageConnector();
 }
