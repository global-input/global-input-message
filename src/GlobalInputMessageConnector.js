import SocketIOClient from "socket.io-client";
import {encrypt,decrypt,generatateRandomString} from "./util";
import {codedataUtil} from "./codedataUtil";


 export default class GlobalInputMessageConnector{
    log(message){
      console.log(this.client+":"+message);
    }
    constructor(){
        this.apikey="k7jc3QcMPKEXGW5UC";
        this.sessionGroup="1CNbWCFpsbmRQuKdd";
        this.codeAES="LNJGw0x5lqnXpnVY8";
        this.session=generatateRandomString(17);
        this.client=generatateRandomString(17);
        this.aes=generatateRandomString(17);
        this.socket=null;
        this.connectedDevices=new Map();
        this.url="https://globalinput.co.uk";
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
            this.connectedDevices.set(inputPermissionMessage.client,inputSender);
            if(options.onSenderConnected){
                      options.onSenderConnected(inputSender, this.connectedDevices);
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
             const inputSenderToLeave=that.connectedDevices.get(leaveMessage.client);
             if(inputSenderToLeave){
                 that.socket.removeListener(this.session+"/input",inputSenderToLeave.onInput);
                 that.socket.removeListener(this.session+"/leave",inputSenderToLeave.onLeave);
                 that.connectedDevices.delete(leaveMessage.client);
                 that.log("sender is removed:"+that.connectedDevices.size);
                 if(options.onSenderDisconnected){
                     options.onSenderDisconnected(inputSenderToLeave, that.connectedDevices);
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
     if(metadata && this.aes){
         metadata=encrypt(JSON.stringify(metadata),this.aes);
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


   sendGlobalInputFieldData(globalInputdata,index, value){
      if(!globalInputdata){
           console.log("ignored:"+index+":"+value+" because globalInputdata is empty");
           return globalInputdata;
      }
      if(globalInputdata.length<=index){
        console.error("reeived the data index is bigger that that of metadata");
        return globalInputdata;
      }
       var globalInputdata=globalInputdata.slice(0);
       console.log("setting index:"+index+"value:"+value);
       globalInputdata[index].value=value;
       var message={
            id:generatateRandomString(10),
            value,
            index
          };
      this.sendInputMessage(message);
      return globalInputdata;
  }
  onReiceveGlobalInputFieldData(inputMessage, metadata){
      console.log("received the input message:"+inputMessage);
      console.log("received the input message:"+inputMessage);
      if(metadata.fields){
          if(inputMessage.data.index<metadata.fields.length){
                metadata.fields[inputMessage.data.index].onInput(inputMessage.data.value);
          }
          else{
            console.error("the index of the data in the input message is bigger than the fields in the medata");
            return;
          }
      }
      else {
          consoler.error("the medata should have fields data");
      }
  }

  buildOptionsFromInputCodedata(codedata, options){
        return codedataUtil.buildOptionsFromInputCodedata(this,codedata,options);
  }
  buildInputCodeData(data={}){
        return codedataUtil.buildInputCodeData(this,data);
  }
  buildAPIKeyCodeData(data={}){
        return codedataUtil.buildAPIKeyCodeData(this,data);
  }
  buildSessionGroupCodeData(data={}){
      return codedataUtil.buildSessionGroupCodeData(this,data);
  }
  buildCodeAESCodeData(data={}){
      return codedataUtil.buildCodeAESCodeData(this,data)
  }
  processCodeData(encryptedcodedata, options){
      return codedataUtil.processCodeData(this,encryptedcodedata,options);
  }

}
