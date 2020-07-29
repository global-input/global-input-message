import SocketIOClient from "socket.io-client";
import {encrypt,decrypt,generateRandomString,basicGetURL} from "./util";
import * as codedataUtil from "./codedataUtil";


 export default class GlobalInputMessageConnector{
    logError(message, error){
      if(error){              
          console.warn("[[[["+this.client+":"+message+":"+error+":"+error.stack+"]");
      }
      else{
          console.warn(this.client+":"+message);
      }
    }
    constructor(){
      // cSpell:disable
        this.apikey="k7jc3QcMPKEXGW5UC";      
        this.securityGroup="1CNbWCFpsbmRQuKdd";
        // cSpell:enable      
        this.codeAES="LNJGw0x5lqnXpnVY8";
        this.session=generateRandomString(17);
        this.client=generateRandomString(17);
        this.aes=generateRandomString(17);
        this.socket=null;
        this.connectedSenders=[];
        this.url="https://globalinput.co.uk";
    }

    isConnected(){
      return this.socket!=null;
    }
    disconnect(){
        if(this.socket){
          this.disconnectSenders(this.connectedSenders);              
          this.socket.disconnect();
          this.socket=null;
          this.activeInitData=null;          
          this.connectedSenders=[];
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
            let url=this.url+"/global-input/request-socket-url?apikey="+this.apikey;
            let that=this;
            basicGetURL(url,function(application){
                that.url=application.url;
                if(application.apikey){
                  that.apikey=application.apikey;
                }
                that._connectToSocket(options);
            }, function(){
                console.warn("failed to get the socket server url");
                if(options.onError){
                    options.onError("failed to get the socket server url");
                }
            });
          }



    }
    _connectToSocket(options){        
          console.log("Copyright © 2017-2022 by Dilshat Hewzulla");
          this.socket=SocketIOClient(this.url);
          let that=this;
          this.socket.on("registerPermission", function(data){
                  that.onRegisterPermission(JSON.parse(data), options);
          });
    }
    onRegisterPermission(registerPermission, options){
         if(registerPermission.result==="ok"){
                 let that=this;
                 this.socket.on("registered", function(data){
                         let registeredMessage=JSON.parse(data);
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
                 let registerMessage={
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
            let that=this;
            this.socket.on(this.session+"/inputPermission", function(data){


                that.processInputPermission(JSON.parse(data), options);
            });
            if(options.connectSession){
                    that.socket.on(options.connectSession+"/inputPermissionResult", function(data){
                    that.onInputPermissionResult(JSON.parse(data),options);
                    });
                    let requestInputPermissionMessage={
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
                    else{
                      throw new Error("AES encryption key is missing, key is required");
                    }


                    let data=JSON.stringify(requestInputPermissionMessage)
                    // cSpell:disable  
                    this.socket.emit("inputPermision",data);
                    // cSpell:enable
            }

    }
    processInputPermission(inputPermissionMessage,options){
            if(!inputPermissionMessage.data){
              this.sendInputPermissionDeniedMessage(inputPermissionMessage,"data is missing in the permission request");
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
              this.logError(error+" while parsing the json data in the permission request");
              this.sendInputPermissionDeniedMessage(inputPermissionMessage,"data format error in the permission request");
              return;
          }
          if(inputPermissionMessage.data.client!==inputPermissionMessage.client){
            this.logError("***the client id mis match in the permission");
            this.sendInputPermissionDeniedMessage(inputPermissionMessage,"client id mismatch");
            return;
          }
          let that=this;

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
    disconnectSenders(sendersToDisconnect){
      if(!sendersToDisconnect || !sendersToDisconnect.length){
        return;
      }
      try{
        sendersToDisconnect.forEach(s=>{
          console.log("Disconnect from the same client");
          this.disconnectSender(s);
        });
      }
      catch(error){
        console.warn("error while disconnecting senders:"+error);
      }
      
    }
    grantInputPermission(inputPermissionMessage,options){
          if(this.grantPermissionQueue){
              this.grantPermissionQueue=this.grantPermissionQueue.filter(s=>s.inputPermissionMessage.client!==inputPermissionMessage.client);
              this.grantPermissionQueue.push({inputPermissionMessage,options});
              this.grantPermissionQueueLastModified=new Date();
              return;
          }
          let existingSameSenders=this.connectedSenders.filter(s=>s.client===inputPermissionMessage.client);
          if(existingSameSenders.length>0){
              this.disconnectSenders(existingSameSenders);              
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
          let currentTime=new Date();
          if((currentTime.getTime()-this.grantPermissionQueueLastModified.getTime())<200){
              setTimeout(this.processGrantInputPermissionQueue.bind(this),300);
          }
          else{
              let grantPermissionQueue=this.grantPermissionQueue;
              this.grantPermissionQueue=null;
              grantPermissionQueue.forEach(queueItem=>{
                  this._grantInputPermission(queueItem.inputPermissionMessage,queueItem.options);
              });
          }
    }

    _grantInputPermission(inputPermissionMessage,options){
      let inputSender=this.buildInputSender(inputPermissionMessage,options);
      this.connectedSenders.push(inputSender);
      console.log("connectedSenders:"+this.connectedSenders.length);
      if(options.onSenderConnected){
                      options.onSenderConnected(inputSender, this.connectedSenders);
      }
      this.socket.on(this.session+"/input", inputSender.onInput);
      this.socket.on(this.session+"/leave",inputSender.onLeave);
      this.sendInputPermissionGrantedMessage(inputPermissionMessage, options);
    }
    sendInputPermissionGrantedMessage(inputPermissionMessage,options){
      let inputPermissionResult=Object.assign({},inputPermissionMessage);
      if(options.initData){
              inputPermissionResult.initData=options.initData;
              let inputPermissionResultInString=JSON.stringify(inputPermissionResult.initData);
              if(this.aes){
                  inputPermissionResult.initData=encrypt(inputPermissionResultInString,this.aes);
              }
              else{
                throw new Error("AES encryption key is missing in grant");
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
      let data=JSON.stringify(inputPermissionResult);
      this.socket.emit(this.session+"/inputPermissionResult",data);
    }

    onInputPermissionResult(inputPermissionResultMessage, options){
            this.connectSession=options.connectSession;
            this.inputAES=options.aes;
            if(this.inputAES && inputPermissionResultMessage.initData && typeof inputPermissionResultMessage.initData ==="string"){
                   let decryptedInitData=decrypt(inputPermissionResultMessage.initData,this.inputAES);
                  if(decryptedInitData){
                      try{
                        inputPermissionResultMessage.initData=JSON.parse(decryptedInitData);
                      }
                      catch(error){
                        console.warn("the service applications responded with invalid data");
                        inputPermissionResultMessage.initData=null;
                      }
                  }
                  else{
                    console.warn("decryption of decryptedInitData  skipped because it is empty");
                  }

            }
            else{
                  console.log("the permission may not be granted by the other party");
                  inputPermissionResultMessage.initData=null;
            }

            if(this.socket){
                let receiverDisconnected=function(){
                     let currentTime=(new Date()).getTime();
                     if((!this.latTimeReceiverDisconnected) || ((currentTime-this.latTimeReceiverDisconnected)<200)){
                       if(options.onReceiverDisconnected){
                         options.onReceiverDisconnected();
                       }
                     }
                     this.latTimeReceiverDisconnected=currentTime;

                }
                this.socket.on(options.connectSession+"/leave",receiverDisconnected);
                let inputSender=this.buildInputSender(inputPermissionResultMessage,options);
                this.socket.on(options.connectSession+"/input",inputSender.onInput);
                let that=this;
                this.socket.on(options.connectSession+"/output",function(outputMessage){
                  that.onOutputMessageReceived(outputMessage,options);
                });
            }
            if(options.onInputPermissionResult){
              options.onInputPermissionResult(inputPermissionResultMessage);
            }

    }
    onOutputMessageReceived(messageData, options){
          if(options.onOutputMessageReceived){
                let message=JSON.parse(messageData);
                let aes=this.aes;
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
      let encryptedMessageData=encrypt(JSON.stringify(outputMessage), this.aes);
      let message={
          client:this.client,
          data:encryptedMessageData
      }
      let messageToSent=JSON.stringify(message)
      this.socket.emit(this.session+"/output",messageToSent);
    }
    buildInputSender(inputPermissionMessage,options){
      let that=this;
      let inputSender={
        client:inputPermissionMessage.client,
        session:inputPermissionMessage.session,
        onInput:function(data){
            try{
                let inputMessage=JSON.parse(data);                
                if(inputMessage.client===that.client){
                    return;
                }
                let aes=that.aes;
                if(that.inputAES){
                  aes=that.inputAES;
                }
                if(inputMessage.data){
                      let dataDecrypted=null;
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
                      let dataDecrypted=null;
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
             let leaveMessage=JSON.parse(data);
             let matchedSenders=that.connectedSenders.filter(s =>s.client===leaveMessage.client);
             if(matchedSenders.length>0){
               let inputSenderToLeave=matchedSenders[0];
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
                let initData=options.initData
                if(this.activeInitData){
                  initData=this.activeInitData;
                }
                if((!initData.form) || (!initData.form.fields)){
                  console.log("field is missing in the initData");
                  return;
                }
                if(typeof inputMessage.data.index !='undefined'){
                        if(inputMessage.data.index<0 || initData.form.fields.length<=inputMessage.data.index){
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
                else if(typeof inputMessage.data.fieldId !='undefined'){
                        const matchedFields=initData.form.fields.filter(f=>f.id===inputMessage.data.fieldId);
                        if(matchedFields.length){
                          let matchedField=matchedFields[0];
                          if(matchedField.operations &&   matchedField.operations.onInput){
                              matchedField.operations.onInput(inputMessage.data.value);
                          }
                          else{
                            console.log("onInput operations is not defined in the initData fieldId:"+inputMessage.data.fieldId);
                          }
                        }
                        else{
                            console.log("received input message is skipped:The field with the matching id does not exists:"+inputMessage.data.fieldId);
                        }
                }
                else{
                    console.log("received input message is skipped because it does not have fieldId or index");
                }

    }

   sendInitData(initData){
     if(!this.isConnected()){
          console.log("not connected yet");
          return;
     }
       let aes=this.aes;
       if(this.inputAES){
           aes=this.inputAES;
       }
       const contentToEncrypt=JSON.stringify(initData);
       const contentEncrypted=encrypt(contentToEncrypt,aes);

       const message={
           client:this.client,
           initData:contentEncrypted
       }
      const content=JSON.stringify(message);
      let session=this.session;
      if(this.connectSession){
        session=this.connectSession;
      }
      this.socket.emit(session+'/input', content);
      this.activeInitData=initData;
   }

   sendInputMessage(value, index,fieldId){
      if(!this.isConnected()){
           console.log("not connected yet");
           return;
      }
      let data={
          id:generateRandomString(10),
          value
        };
    if(fieldId){
      data.fieldId=fieldId;
    }
    else{
        data.index=index;
    }
        let aes=this.aes;
        if(this.inputAES){
            aes=this.inputAES;
        }
        let contentToEncrypt=JSON.stringify(data);
        let contentEncrypted=encrypt(contentToEncrypt,aes);
        data=contentEncrypted;
        let message={
            client:this.client,
            data
        }
       let content=JSON.stringify(message);
       let session=this.session;
       if(this.connectSession){
         session=this.connectSession;
       }
       this.socket.emit(session+'/input', content);
   }
   changeGlobalInputFieldData(globalInputdata,data){
        if(!globalInputdata){
                  console.log(" because globalInputdata is empty");
                  return globalInputdata;
        }
        if(data.fieldId){
            globalInputdata=globalInputdata.map(f=>{
              if(f.id===data.fieldId){
                  f.value=data.value;
              }
              return f;
            });
         }
         else if(typeof data.index !=='undefined' && data.index<globalInputdata.length){
           const globalInputdata=globalInputdata.slice(0);
           globalInputdata[data.index].value=data.value;
        }
        else{
             console.warn("received the data index is bigger that that of initData");
        }
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

  processCodeData(encryptedCodedata, options){
      return codedataUtil.processCodeData(this,encryptedCodedata,options);
  }

}
