import SocketIOClient from "socket.io-client";

export function createGUID() {
 function s4() {
   return Math.floor((1 + Math.random()) * 0x10000)
     .toString(16)
     .substring(1);
 }
 return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
   s4() + '-' + s4() + s4() + s4();
}

 class GlobalInputMessageConnector{
    log(message){
      console.log(this.client+":"+message);
    }
    constructor(){
        this.apikey="756ffa56-69ef-11e7-907b-a6006ad3dba0";
        this.sessionGroup="359a15fa-23e7-4a10-89fa-efc12d2ee891";
        this.session=createGUID();
        this.client=createGUID();

        this.socket=null;
        this.encryptKey="none";
        this.connectedInputSenders=new Map();
        this.socketURL="https://globalinput.co.uk";

    }
    isConnected(){
      return this.socket!=null;
    }
    disconnect(){
        if(this.socket){
          this.socket.disconnect();
          this.socket=null;
        }
        this.joiningSession=null;
        this.targetSession=null;
    }
    connect(options={}){
        if(options.join){
            if(this.socket && this.joiningSession===options.join.session){
                this.log("already joined to the target session");
                return;
            }
            else{
              this.log("this.joiningSession::"+this.joiningSession+":::"+options.join.session)
            }
            this.joiningSession=options.join.session;
        }
        else if(this.socket){
            this.log("already connected");
            return;
        }
        this.disconnect();
        this.log("2222");
         if(options.apikey){
              this.apikey=options.apikey;
          }
          this.log("3333");
          if(options.url){
            this.log("connecting to:"+options.url);
            this.socketURL=options.url;
          }
          this.log("4444");
          this.socket=SocketIOClient(this.socketURL);
          const that=this;
          this.log("5555");
          this.socket.on("canRegister", function(data){
                 that.log("canRegister message is received:"+data);
                  that.canRegister(JSON.parse(data), options);
          });

          this.log("complete the connect");
    }
    canRegister(canRegisterMessage, options){
          this.socketid=canRegisterMessage.socketid;
          var that=this;
          this.socket.on("canJoin", function(data){
                  that.log("received the canJoin message:"+data);
                  that.canJoin(JSON.parse(data),options);
          });
          that.sendRegisterMessage(canRegisterMessage,options);
    }

    sendRegisterMessage(options){
      const registerMessage={
            sessionGroup:this.sessionGroup,
            session:this.session,
            apikey:this.apikey
      };
      this.log("sending register message");
      this.socket.emit("register", JSON.stringify(registerMessage));
    }
    canJoin(canJoinMessage, options){
            this.randomkey=canJoinMessage.randomkey;
            var that=this;
            this.socket.on(this.session+"/join", function(joinRequestMessage){
                that.log("joinRequestMessage is received:"+joinRequestMessage);
                that.processJoinRequestMessage(JSON.parse(joinRequestMessage),options);
            });
            if(options.join){
                this.sendJoinRequestMessage(options);
                this.socket.on("joinResponse", function(response){
                  that.log("joinResponse is received "+response);
                  that.joinResponse(JSON.parse(response),options);
                });

            }
            if(options.onConnectionComplete){
                options.onConnectionComplete(canJoinMessage);
            }
    }
    joinResponse(responseMessage, options){
            this.log("***** join reponse reeived:"+JSON.stringify(responseMessage));
            this.targetSession=responseMessage.session;
            if(options.onJoinComplete){
              options.onJoinComplete(responseMessage);
            }
    }
    sendJoinRequestMessage(options){
      if(options.join.session){
        const joinRequestMessage={
              sessionGroup:this.sessionGroup,
              session:options.join.session,
              client:this.client,
              randomkey:this.randomkey
        };
        const data=JSON.stringify(joinRequestMessage)
        this.log("sending the joinRequestMessage:"+data)
        this.socket.emit("joinSession",data);
      }
    }
    processJoinRequestMessage(joinRequestMessage,options){
            var that=this;
            var allow=true;
            var inputSender={
              client:joinRequestMessage.client
            };

            if(options.onJoin){
                  if(!options.canJoin(joinRequestMessage)){
                    allow=false;
                  }
            }
            inputSender.inputMessageListener=function(data){
                  that.log("input message received:"+data);
                  if(options.onInputMessageReceived){
                      const inputMessage=JSON.parse(data);
                      if(inputMessage.client===this.client){
                        console.log("input message is coming from itself:"+data);
                      }
                      else{
                          options.onInputMessageReceived(inputMessage);
                      }

                  }
            }



            inputSender.leavelistener=function(leaveRequest){
                that.log("leave request is received:"+leaveRequest);
                const leaveMessage=JSON.parse(leaveRequest);
                const inputSenderToLeave=that.connectedInputSenders.get(leaveMessage.client);
                if(inputSenderToLeave){
                    that.socket.removeListener(this.session+"/input",inputSenderToLeave.inputMessageListener);
                    that.socket.removeListener(this.session+"/leave",inputSenderToLeave.leavelistener);
                    that.connectedInputSenders.delete(leaveMessage.client);
                    that.log("sender is removed:"+that.connectedInputSenders.size);
                    if(options.onSenderLeave){
                      options.onSenderLeave(inputSenderToLeave);
                    }
                }
            };

            if(allow){
              this.connectedInputSenders.set(joinRequestMessage.client,inputSender);
              if(options.onSendedJoin){
                      options.onSendedJoin(inputSender);
              }
              this.socket.on(that.session+"/input", inputSender.inputMessageListener);
              this.socket.on(that.session+"/leave",inputSender.leavelistener);
            }
            var joinRequestResponse=Object.assign({},joinRequestMessage,{allow});
            if(options.metadata){
                joinRequestResponse.metadata=options.metadata;
            }
            var data=JSON.stringify(joinRequestResponse)
            this.log("sending the join response message:"+data);
            this.socket.emit("joinResponse",data);
    }
   sendInputMessage(data){
      if(!this.isConnected()){
           this.log("not connected yet");
           return;
      }
      var message={
          client:this.client,
          targetSession:this.targetSession,
          data
      }

      const content=JSON.stringify(message);
      this.log("sending input message  to:"+this.targetSession+" content:"+content);
      this.socket.emit(this.targetSession+'/input', content);
   }
   sendMetadata(metadata){
     if(!this.isConnected()){
          this.log("not connected yet");
          return;
     }
     var message={
         client:this.client,
         targetSession:this.targetSession,
         metadata
     }

     const content=JSON.stringify(message);
     this.log("sending input message  to:"+this.targetSession+" content:"+content);
     this.socket.emit(this.targetSession+'/metadata', content);
   }


   getConnectionData(data){
       return {
                   url:this.socketURL,
                   session:this.session,
                   key:this.encryptKey,
                   data
       };
   }


}

 export function createMessageConnector(){
   return new GlobalInputMessageConnector();
 }
