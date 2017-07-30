import SocketIOClient from "socket.io-client";
import {encrypt,decrypt,generatateRandomString} from "./util";
import {codedataUtil} from "./codedataUtil";


 export default class GlobalInputMessageConnector{
    log(message){
      console.log(this.client+":"+message);
    }
    logError(message){
      console.error(this.client+":"+message);
    }
    constructor(){
        this.apikey="k7jc3QcMPKEXGW5UC";
        this.securityGroup="1CNbWCFpsbmRQuKdd";
        this.codeAES="LNJGw0x5lqnXpnVY8";
        this.session=generatateRandomString(17);
        this.client=generatateRandomString(17);
        this.aes=generatateRandomString(17);
        this.socket=null;
        this.connectedSenders=[];
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
         if(options.securityGroup){
           this.securityGroup=options.securityGroup;
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
                         if(registeredMessage.result==="ok"){
                               if(options.onRegistered){
                                  options.onRegistered(function(){
                                      that.onRegistered(registeredMessage,options);
                                  },registeredMessage,options);
                               }
                               else{
                                    that.onRegistered(registeredMessage,options);
                               }
                         }
                         else{
                           if(options.onRegisterFailed){
                             options.onRegisterFailed();
                           }
                         }

                 });
                 const registerMessage={
                       securityGroup:this.securityGroup,
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

                that.processInputPermission(JSON.parse(data), options);
            });
            if(options.connectSession){
                    that.socket.on(options.connectSession+"/inputPermissionResult", function(data){
                    that.log("inputPermissionResult is received "+data);
                    that.onInputPermissionResult(JSON.parse(data),options);
                    });
                    const requestInputPermissionMessage={
                          securityGroup:that.securityGroup,
                          session:that.session,
                          client:that.client,
                          connectSession:options.connectSession
                    };
                    requestInputPermissionMessage.data={
                        client:that.client,
                        time:(new Date()).getTime()
                    };
                    requestInputPermissionMessage.data=JSON.stringify(requestInputPermissionMessage.data);
                    if(options.aes){
                           requestInputPermissionMessage.data=encrypt(requestInputPermissionMessage.data,options.aes);
                    }


                    const data=JSON.stringify(requestInputPermissionMessage)
                    this.log("sending the requestInputPermissionMessage:"+data);
                    this.socket.emit("inputPermision",data);
            }

    }
    processInputPermission(inputPermissionMessage,options){
            if(!inputPermissionMessage.data){
              this.sendInputPermissionDeniedMessage(inputPermissionMessage,"data is missing in the permision request");
              return;
          }
          try{
                inputPermissionMessage.data=decrypt(inputPermissionMessage.data,this.aes);
            }
            catch(error){
              this.log(error+" while decrypting the data in the permission request:"+inputPermissionMessage.data);
              this.sendInputPermissionDeniedMessage(inputPermissionResult,"failed to decrypt");
              return;
            }
          if(!inputPermissionMessage.data){
            this.log(" failed to decrypt the data in the permission request");
            this.sendInputPermissionDeniedMessage(inputPermissionMessage,"failed to decrypt");
            return;
          }
          try{
                inputPermissionMessage.data=JSON.parse(inputPermissionMessage.data);
          }
          catch(error){
              this.log(error+" while parsing the json data in the permisson request");
              this.sendInputPermissionDeniedMessage(inputPermissionMessage,"data format error in the permisson request");
              return;
          }
          if(inputPermissionMessage.data.client!==inputPermissionMessage.client){
            this.log("***the client id mis match in the permission");
            this.sendInputPermissionDeniedMessage(inputPermissionMessage,"client id mismatch");
            return;
          }
          var that=this;
          if(options.onInputPermission){
              options.onInputPermission(function(){
                  that.grantInputPermission(inputPermissionMessage,options);
              },function(){
                that.sendInputPermissionDeniedMessage(inputPermissionResult,"application denied to give permission");
              },inputPermissionMessage,options);
          }
          else{
              this.grantInputPermission(inputPermissionMessage,options);
          }

    }


    grantInputPermission(inputPermissionMessage,options){
      var existingSameSenders=this.connectedSenders.filter(s=>s.client===inputPermissionMessage.client);
      if(existingSameSenders.length>0){
          this.log("the client is already connected");
          return;
      }
      const inputSender=this.buildInputSender(inputPermissionMessage,options);
      this.connectedSenders.push(inputSender);
      if(options.onSenderConnected){
                      options.onSenderConnected(inputSender, this.connectedSenders);
      }
      this.socket.on(this.session+"/input", inputSender.onInput);
      this.socket.on(this.session+"/leave",inputSender.onLeave);
      this.sendInputPermissionGrantedMessage(inputPermissionMessage, options);
    }
    sendInputPermissionGrantedMessage(inputPermissionMessage,options){

      var inputPermissionResult=Object.assign({},inputPermissionMessage);
      if(options.initData){
              inputPermissionResult.initData=options.initData;
              if(this.aes){
                  inputPermissionResult.initData=encrypt(JSON.stringify(options.initData),this.aes);
              }
      }
      inputPermissionResult.allow=true;
      this.sendInputPermissionResult(inputPermissionResult);
    }
    sendInputPermissionDeniedMessage(inputPermissionMessage,reason){
      inputPermissionMessage.allow=false;
      inputPermissionMessage.reason=reason;
      this.sendInputPermissionResult(inputPermissionMessage);
    }
    sendInputPermissionResult(inputPermissionResult){
      var data=JSON.stringify(inputPermissionResult);
      this.log("sending the inputPermissionResult  message:"+data);
      this.socket.emit(this.session+"/inputPermissionResult",data);
    }

    onInputPermissionResult(inputPermissionResultMessage, options){
            this.connectSession=options.connectSession;
            this.inputAES=options.aes;
            if(this.inputAES && inputPermissionResultMessage.initData && typeof inputPermissionResultMessage.initData ==="string"){
                   const descryptedInitData=decrypt(inputPermissionResultMessage.initData,this.inputAES);
                   this.log("decrypted initData:"+descryptedInitData);
                  inputPermissionResultMessage.initData=JSON.parse(descryptedInitData);
            }
            else{
                  this.log("received initData is not encrypted");
            }

            if(this.socket){
                var receveiverDisconnected=function(){
                     console.log("the receiver disconnected");
                     if(options.onReceiverDisconnected){
                       options.onReceiverDisconnected();
                     }
                }
                this.socket.on(options.connectSession+"/leave",receveiverDisconnected);
                var inputSender=this.buildInputSender(inputPermissionResultMessage,options);
                this.socket.on(options.connectSession+"/input",inputSender.onInput);
                var that=this;
                this.socket.on(options.connectSession+"/output",function(outputmessage){
                  that.onOutputMessageReceived(outputmessage,options);
                });
            }
            if(options.onInputPermissionResult){
              options.onInputPermissionResult(inputPermissionResultMessage);
            }

    }
    onOutputMessageReceived(messagedata, options){
          if(options.onOutputMessageReceived && options.inputAES){
              var outputMessageString=decrypt(messagedata.data,options.inputAES);
              if(!outputMessageString){
                thus.logError("error in descrupting the output message:"+messagedata);
              }
              options.onOutputMessageReceived(JSON.parse(outputMessageString));
          }
    }
    sendOutputMessage(outputMessage){
      if(!this.isConnected()){
           this.log("not connected yet");
           return;
      }
      var encryptedMessagedata=encrypt(JSON.stringify(outputMessage), this.aes);
      var outputMessage={
          client:this.client,
          data:encryptedMessagedata
      }
      var messageToSent=JSON.stringify(outputMessage)
      this.log("sending output message  to:"+this.session+" :"+messageToSent);
      this.socket.emit(this.session+"/output",messageToSent);
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
                    var aes=that.aes;
                    if(that.inputAES){
                      aes=that.inputAES;
                    }
                    if(inputMessage.data){
                          var dataDecrypted=null;
                          try{
                            dataDecrypted=decrypt(inputMessage.data,aes);
                          }
                          catch(error){
                              that.logError(error+", failed to decrypt the input content with:"+that.aes);
                              return;
                          }
                          if(!dataDecrypted){
                            that.logError("failed to decrypt the content with:"+that.aes);
                            return;
                          }

                          that.log("decrypted inputdata is:"+dataDecrypted);
                          try{
                              inputMessage.data=JSON.parse(dataDecrypted);
                          }
                          catch(error){
                            that.logError(error+"failed to parse the decrypted input content:"+dataDecrypted)
                          }

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
             const matchedSenders=that.connectedSenders.filter(s =>s.client===leaveMessage.client);
             if(matchedSenders.length>0){
               const inputSenderToLeave=matchedSenders[0];
               that.socket.removeListener(that.session+"/input",inputSenderToLeave.onInput);
               that.socket.removeListener(that.session+"/leave",inputSenderToLeave.onLeave);
               that.connectedSenders=that.connectedSenders.filter(s =>s.client!==leaveMessage.client);
               that.log("sender is removed:"+that.connectedSenders.size);
               if(options.onSenderDisconnected){
                       options.onSenderDisconnected(inputSenderToLeave, that.connectedSenders);
               }

             }

         }
      };
      return inputSender;
    }





   sendInputMessage(value, index){
      if(!this.isConnected()){
           this.log("not connected yet");
           return;
      }
      var data={
          id:generatateRandomString(10),
          value,
          index
        };
        var aes=this.aes;
        if(this.inputAES){
            aes=this.inputAES;
        }
        const contentToEncrypt=JSON.stringify(data);
        this.log("content to be encrypted:"+contentToEncrypt);
        const contentEcrypted=encrypt(contentToEncrypt,aes);
        this.log("content encrypted:"+contentEcrypted);
        data=contentEcrypted;
        var message={
            client:this.client,
            data
        }
       const content=JSON.stringify(message);
       var session=this.session;
       if(this.connectSession){
         session=this.connectSession;
       }
       this.log("sending input message  to:"+session+" content:"+content);
       this.socket.emit(session+'/input', content);
   }
   changeGlobalInputFieldData(globalInputdata,index, value){
     if(!globalInputdata){
          console.log("ignored:"+index+":"+value+" because globalInputdata is empty");
          return globalInputdata;
     }
     if(globalInputdata.length<=index){
       console.error("receied the data index is bigger that that of initData");
       return globalInputdata;
     }
      var globalInputdata=globalInputdata.slice(0);
      console.log("setting index:"+index+"value:"+value);
      globalInputdata[index].value=value;
      return globalInputdata;

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
  buildSecurityGroupCodeData(data={}){
      return codedataUtil.buildSecurityGroupCodeData(this,data);
  }
  buildCodeAESCodeData(data={}){
      return codedataUtil.buildCodeAESCodeData(this,data)
  }
  processCodeData(encryptedcodedata, options){
      return codedataUtil.processCodeData(this,encryptedcodedata,options);
  }

}
