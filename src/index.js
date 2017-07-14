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
const api={
   application:"global-input-general",
   baseURL: "https://globalinput.co.uk",
   socketBaseUrl:function(){
     return this.baseURL;
   },
   serviceURL: function(){
     return this.baseURL+"/global-input";
   },

   apiHeader: function(){
         return {'Accept': 'application/json',
                 'Content-Type':'application/json' }
   },
   getApi: function(url){
      return fetch(url,{method:"GET", headers:this.apiHeader()}).then(function(response) {
        if(response.status===401){
              throw new Error(401);
         }
         else if(response.status!==200){
                throw new Error(response.status);
         }
         else {
              return response.json()
        }
      });
   },
   postApi: function(url,data){
       console.log("sending to:"+url+" data:"+JSON.stringify(data));
      return fetch(url,{method:"POST", headers: this.apiHeader(),
                       body: JSON.stringify(data)}
                   ).then(function(response){
                     if(response.status===401){
                          return  Promise.reject("error code:"+401);
                      }
                      else if(response.status!==200){
                            return Promise.reject("error code:"+response.status);
                      }
                      else {
                           return response.json()
                     }
                   });

   }

 };



 class GlobalInputMessageConnector{
    constructor(){
        this.session=createGUID();
        this.client=createGUID();
        this.socket=null;
        this.encryptKey="none";
        this.connectedClients=new Map();
    }
    isConnected(){
      return this.socket!=null;
    }
    disconnect(){
        if(this.socket){
          this.socket.disconnect();
          this.socket=null;
        }
    }

    getConnectionData(data){
        return {
                    url:api.baseURL,
                    session:this.session,
                    key:this.encryptKey,
                    data
        };
    }
    connect(options={}){
           if(options.url){
             console.log("connecting to:"+options.url);
             setMessageConnectorURL(options.url);
           }
           if(this.socket && this.connectedSession && this.connectedSession === this.options.session){
             console.log("already connected to the session");
             return false;
          }
          const that=this;
          this.disconnect();
          var socketURL=api.socketBaseUrl();
          this.socket=SocketIOClient(socketURL);
          this.connectedSession=this.session;
          this.socket.on("register", function(data){
                that.sendRegisterMessage();
                that.sendJoinSessionMessage(options);
          });

          this.socket.on(this.session+"/join", function(joinMessage){
            console.log("joinMessage is received:"+joinMessage);
              that.processJoinMessage(JSON.parse(joinMessage),options);
          });
          return true;
    }
    sendRegisterMessage(){
      const registerMessage={
            application:api.application,
            session:this.session,
            client:this.client
      };
      console.log("sending register message");
      this.socket.emit("register", JSON.stringify(registerMessage));
    }
    sendJoinSessionMessage(options){
      if(options.session){
        const joinMessage={
              application:api.application,
              session:options.session,
              client:this.client
        };
        this.socket.emit("requestToJoin",JSON.stringify(joinMessage));
      }
    }
    processJoinMessage(joinMessage,options){
           joinMessage.allow=true;
            var clientRegister={
              client:joinMessage.client
            };
            if(options.joinMessageProcessor){
                  if(!options.joinMessageProcessor(joinMessage)){
                    joinMessage.allow=false;
                  }
            }

            clientRegister.inputMessageListener=function(inputMessage){
                  console.log("input message received:"+inputMessage);
                  if(options.onMessageReceived){
                      options.onMessageReceived(JSON.parse(inputMessage));
                  }
            }
            clientRegister.leavelistener=function(leaveRequest){
                console.log("leave request is received:"+leaveRequest.client);
                const leaveClientRegister=this.connectedClients.get(leaveRequest.client);
                if(leaveClientRegister){
                    this.socket.removeListener(targetClient.session+"/input",leaveClientRegister.inputMessageListener);
                    this.socket.removeListener(targetClient.session+"/leave",leaveClientRegister.leavelistener);
                    this.connectedClients.delete(leaveRequest.client);
                }
            };

            if(joinResult.allow){
              this.connectedClients.set(joinMessage.client,clientRegister);
              this.socket.on(targetClient.session+"/input", clientRegister.inputMessageListener);
              this.socket.on(targetClient.session+"/leave",clientRegister.leavelistener);
              this.socket.emit("joinMessageResponse", JSON.stringify(joinMessage));
            }
    }
   sendInputMessage(data){
      if(!this.isConnected()){
           console.log("not connected yet");
           return;
      }
      const message={
        session:this.session,
        client:this.client,
        data
      };
      const content=JSON.stringify(message);
      console.log("emiting to:"+this.session+" content:"+content);
      this.socket.emit('inputMessage', content);
   }






}


 export function createMessageConnector(){
   return new GlobalInputMessageConnector();
 }
 export function setMessageConnectorURL(baseurl){
     api.baseURL=baseurl;
 }
 export function setMessageApplication(application){
     api.application=application;
 }
