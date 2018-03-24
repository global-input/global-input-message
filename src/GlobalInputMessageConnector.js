import SocketIOClient from "socket.io-client";
import {encrypt,decrypt,generatateRandomString,basicGetURL} from "./util";
import {codedataUtil} from "./codedataUtil";


 export default class GlobalInputMessageConnector{
    logError(message, error){
      if(error){
          console.warn(this.client+":"+message+":"+error);
          console.warn(error.stack);
      }
      else{
          console.warn(this.client+":"+message);
      }

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
          if(options.connectSession){
            this._connectToSocket(options);
          }
          else{
            var url=this.url+"/global-input/request-socket-url?apikey="+this.apikey;
            var that=this;
            basicGetURL(url,function(application){
                that.url=application.url;
                that._connectToSocket(options);
            }, function(){
                console.warn("failed to get the socket server url");
            });
          }



    }
    _connectToSocket(options){
          console.log("Copyright © 2017-2022 by Dilshat Hewzulla");
          this.socket=SocketIOClient(this.url);
          const that=this;
          this.socket.on("registerPermission", function(data){
                  that.onRegisterPermission(JSON.parse(data), options);
          });
    }
    onRegisterPermission(registerPermistion, options){
         if(registerPermistion.result==="ok"){
                 var that=this;
                 this.socket.on("registered", function(data){
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
                             options.onRegisterFailed(registeredMessage);
                           }
                         }

                 });
                 const registerMessage={
                       securityGroup:this.securityGroup,
                       session:this.session,
                       client:this.client,
                       apikey:this.apikey
                 };

                 this.socket.emit("register", JSON.stringify(registerMessage));
         }
         else{
                this.logError("failed to get register permission");
         }


    }


    onRegistered(registeredMessage, options){
            var that=this;
            this.socket.on(this.session+"/inputPermission", function(data){


                that.processInputPermission(JSON.parse(data), options);
            });
            if(options.connectSession){
                    that.socket.on(options.connectSession+"/inputPermissionResult", function(data){
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
              this.sendInputPermissionDeniedMessage(inputPermissionMessage,"failed to decrypt");
              return;
            }
          if(!inputPermissionMessage.data){
            this.logError(" failed to decrypt the data in the permission request");
            this.sendInputPermissionDeniedMessage(inputPermissionMessage,"failed to decrypt");
            return;
          }
          try{
                inputPermissionMessage.data=JSON.parse(inputPermissionMessage.data);
          }
          catch(error){
              this.logError(error+" while parsing the json data in the permisson request");
              this.sendInputPermissionDeniedMessage(inputPermissionMessage,"data format error in the permisson request");
              return;
          }
          if(inputPermissionMessage.data.client!==inputPermissionMessage.client){
            this.logError("***the client id mis match in the permission");
            this.sendInputPermissionDeniedMessage(inputPermissionMessage,"client id mismatch");
            return;
          }
          var that=this;

          if(options.onInputPermission){
              options.onInputPermission(function(){
                  delete inputPermissionMessage.data;
                  that.grantInputPermission(inputPermissionMessage,options);
              },function(){
                that.sendInputPermissionDeniedMessage(inputPermissionMessage,"application denied to give permission");
              },inputPermissionMessage,options);
          }
          else{
              delete inputPermissionMessage.data;
              this.grantInputPermission(inputPermissionMessage,options);
          }

    }
    grantInputPermission(inputPermissionMessage,options){
          if(this.grantPermissionQueue){
              this.grantPermissionQueue=this.grantPermissionQueue.filter(s=>s.inputPermissionMessage.client!==inputPermissionMessage.client);
              this.grantPermissionQueue.push({inputPermissionMessage,options});
              this.grantPermissionQueueLastModified=new Date();
              return;
          }
          var existingSameSenders=this.connectedSenders.filter(s=>s.client===inputPermissionMessage.client);
          if(existingSameSenders.length>0){
              existingSameSenders.forEach(s=>{
                  console.log("Disconnect from the same client");
                  this.disconnectSender(s);
              });
              console.log("the client is  connected previously");
              this.grantPermissionQueue=[];
              this.grantPermissionQueue.push({inputPermissionMessage,options});
              this.grantPermissionQueueLastModified=new Date();
              setTimeout(this.processGrantInputPermissionQueue.bind(this),300);
          }
          else{
            this._grantInputPermission(inputPermissionMessage,options);
          }
    }
    processGrantInputPermissionQueue(){
          var currentTime=new Date();
          if((currentTime.getTime()-this.grantPermissionQueueLastModified.getTime())<200){
              setTimeout(this.processGrantInputPermissionQueue.bind(this),300);
          }
          else{
              var grantPermissionQueue=this.grantPermissionQueue;
              this.grantPermissionQueue=null;
              grantPermissionQueue.forEach(queitem=>{
                  this._grantInputPermission(queitem.inputPermissionMessage,queitem.options);
              });
          }
    }

    _grantInputPermission(inputPermissionMessage,options){
      const inputSender=this.buildInputSender(inputPermissionMessage,options);
      this.connectedSenders.push(inputSender);
      console.log(":::connectedSenders:"+this.connectedSenders.length);
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
              var inputPermissionResultInString=JSON.stringify(inputPermissionResult.initData);
              if(this.aes){
                  inputPermissionResult.initData=encrypt(inputPermissionResultInString,this.aes);
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
      this.socket.emit(this.session+"/inputPermissionResult",data);
    }

    onInputPermissionResult(inputPermissionResultMessage, options){
            this.connectSession=options.connectSession;
            this.inputAES=options.aes;
            if(this.inputAES && inputPermissionResultMessage.initData && typeof inputPermissionResultMessage.initData ==="string"){
                   const descryptedInitData=decrypt(inputPermissionResultMessage.initData,this.inputAES);

                  inputPermissionResultMessage.initData=JSON.parse(descryptedInitData);
            }
            else{
                  console.log("received initData is not encrypted");
            }

            if(this.socket){
                var receveiverDisconnected=function(){

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
          if(options.onOutputMessageReceived){
                var message=JSON.parse(messagedata);
                var aes=this.aes;
                if(this.inputAES){
                    aes=this.inputAES;
                }
                if(aes && message.data){
                      message.data=decrypt(message.data,aes);
                 }
                 options.onOutputMessageReceived(message);
           }
           else{
             console.log("output message is ignored");
           }
    }
    sendOutputMessage(outputMessage){
      if(!this.isConnected()){
           console.log("not connected yet");
           return;
      }
      var encryptedMessagedata=encrypt(JSON.stringify(outputMessage), this.aes);
      var outputMessage={
          client:this.client,
          data:encryptedMessagedata
      }
      var messageToSent=JSON.stringify(outputMessage)
      this.socket.emit(this.session+"/output",messageToSent);
    }
    buildInputSender(inputPermissionMessage,options){
      var that=this;
      var inputSender={
        client:inputPermissionMessage.client,
        session:inputPermissionMessage.session,
        onInput:function(data){

            try{
                const inputMessage=JSON.parse(data);
                if(inputMessage.client===that.client){
                    return;
                }
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
                          that.logError(error+", failed to decrypt the input content");
                          return;
                      }
                      if(!dataDecrypted){
                        that.logError("failed to decrypt the content");
                        return;
                      }


                      try{
                          inputMessage.data=JSON.parse(dataDecrypted);
                      }
                      catch(error){
                        that.logError(error+"failed to parse the decrypted input content")
                      }
                }
                else if(inputMessage.initData){
                      var dataDecrypted=null;
                      try{
                            dataDecrypted=decrypt(inputMessage.initData,aes);
                      }
                      catch(error){
                          that.logError(error+", failed to decrypt the initData content");
                          return;
                        }
                        if(!dataDecrypted){
                              that.logError("failed to decrypt the content");
                              return;
                        }
                        try{
                            inputMessage.initData=JSON.parse(dataDecrypted);
                          }
                          catch(error){
                                that.logError(error+"failed to parse the decrypted initData content")
                          }
                }
                else{
                  that.logError("received input data is not encrypted");
                }
                if(options.onInput){
                      options.onInput(inputMessage);
                      return;
                }
                else{
                    that._onInput(inputMessage,options);
                }

            }
            catch(error){
              that.logError("error when processing the input message.",error);
            }

         },
         onLeave:function(data){
            console.log("On leavbe message is received:"+data);
             const leaveMessage=JSON.parse(data);
             const matchedSenders=that.connectedSenders.filter(s =>s.client===leaveMessage.client);
             if(matchedSenders.length>0){
               const inputSenderToLeave=matchedSenders[0];
               that.disconnectSender(inputSenderToLeave);

               if(options.onSenderDisconnected){
                       options.onSenderDisconnected(inputSenderToLeave, that.connectedSenders);
               }

             }
         }

      };
      return inputSender;
    }
    disconnectSender(inputSender){
      try{
      this.socket.removeListener(this.session+"/input",inputSender.onInput);
      this.socket.removeListener(this.session+"/leave",inputSender.onLeave);
       }
       catch(error){
         console.error(error);
       }
      this.connectedSenders=this.connectedSenders.filter(s =>s.client!==inputSender.client);
      console.log("client disconnected:"+inputSender.client);
    }
    _onInput(inputMessage,options){
                if(inputMessage.initData){
                    console.log("initData is received");
                    if(options.initData && options.initData.operations && options.initData.operations.onInitData){
                          options.initData.operations.onInitData(inputMessage);
                    }
                    return;
                }

                if(typeof inputMessage.data =="undefined"){
                  console.log("data field is missing in the input message");
                  return;
                }
                if(typeof inputMessage.data.index =="undefined"){
                  console.log("index should be set in the data field of the input message");
                  return;
                }

                var initData=options.initData
                if(this.activeInitData){
                  initData=this.activeInitData;
                }
                if((!initData.form) || (!initData.form.fields)){
                  console.log("field is missing in the initData");
                  return;
                }
                if(initData.form.fields.length<=inputMessage.data.index){
                    console.log("index data is too big in the input message");
                    return;
                }
                if(initData.form.fields[inputMessage.data.index].operations &&   initData.form.fields[inputMessage.data.index].operations.onInput){
                    initData.form.fields[inputMessage.data.index].operations.onInput(inputMessage.data.value);
                }
                else{
                  console.log("onInput operations is not defined in the initData index:"+inputMessage.data.index);
                }
    }

   sendInitData(initData){
     if(!this.isConnected()){
          console.log("not connected yet");
          return;
     }
       var aes=this.aes;
       if(this.inputAES){
           aes=this.inputAES;
       }
       const contentToEncrypt=JSON.stringify(initData);
       const contentEcrypted=encrypt(contentToEncrypt,aes);

       var message={
           client:this.client,
           initData:contentEcrypted
       }
      const content=JSON.stringify(message);
      var session=this.session;
      if(this.connectSession){
        session=this.connectSession;
      }
      this.socket.emit(session+'/input', content);
      this.activeInitData=initData;
   }

   sendInputMessage(value, index){
      if(!this.isConnected()){
           console.log("not connected yet");
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
        const contentEcrypted=encrypt(contentToEncrypt,aes);
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
       this.socket.emit(session+'/input', content);
   }
   changeGlobalInputFieldData(globalInputdata,index, value){
     if(!globalInputdata){
          console.log("ignored:"+index+":"+value+" because globalInputdata is empty");
          return globalInputdata;
     }
     if(globalInputdata.length<=index){
       console.warn("receied the data index is bigger that that of initData");
       return globalInputdata;
     }
      var globalInputdata=globalInputdata.slice(0);

      globalInputdata[index].value=value;
      return globalInputdata;

   }



  buildOptionsFromInputCodedata(codedata, options){
        return codedataUtil.buildOptionsFromInputCodedata(this,codedata,options);
  }
  buildInputCodeData(data={}){
        return codedataUtil.buildInputCodeData(this,data);
  }

  buildPairingData(data={}){
      return codedataUtil.buildPairingData(this,data);
  }

  processCodeData(encryptedcodedata, options){
      return codedataUtil.processCodeData(this,encryptedcodedata,options);
  }

}
