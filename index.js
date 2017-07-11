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
   baseURL: "https://globalinput.co.uk",
   socketBaseUrl:function(){
     return this.baseURL;
   },
   serviceURL: function(){
     return this.baseURL+"/global-input";
   },
   qrURL: function(session,client){
       return this.serviceURL()+"/qr-code/"+session+"/"+client+"/simple";
   },
   messageURL:function(session,client){
       return this.serviceURL()+"/messages/"+session+"/"+client;
   },
   apiHeader: function(){
         return {'Accept': 'application/json',
                 'Content-Type':'application/json' }
   },
   getApi: function(url){
      return fetch(url,{method:"GET", headers:this.apiHeader()}).then(response => {
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
                   ).then(response => {
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

   },
   sendData:function(session,client,data){
      const posturl=this.messageURL(session,client);
      return this.postApi(posturl,data);
   }
 };



 class GlobalInputMessageConnector{
    constructor(){
        this.session=createGUID();
        this.client=createGUID();
        this.socket=null;
        this.qrAttributes=[];
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
    connect(onMessageReceived){
      if(this.socket && this.connectedSession && this.connectedSession === this.qrcode.session){
        console.log("already connected to the session");
        return;
      }
      const that=this;
      this.disconnect();
      var socketURL=api.socketBaseUrl();

      this.socket=SocketIOClient(socketURL);
        this.connectedSession=this.session;
        this.socket.on(this.session, function(data){
              console.log("message received:"+data);
              const message=JSON.parse(data);
              if(message.client===that.client){
                  console.log("client is the same:"+message.client);
              }
              else{
                    onMessageReceived(message.data);
              }
        });

        console.log("connected:"+this.session+" with:"+socketURL);
    }
    joinSession(session,onMessageReceived){
      this.session=session;
      this.connect(onMessageReceived);
    }

   send(data){
      if(!this.isConnected()){
           console.log("not connected yet");
           return;
      }
      const message={
        session:this.session,
        data:data
      };
      const content=JSON.stringify(message);
      console.log("emiting to:"+this.session+" content:"+content);
      this.socket.emit('sendToSession', content);
   }


   onBarCodeRead(barcodedata,onReceiveClientMessage){
     if(barcodedata.se){
        console.log("joing the session:"+JSON.stringify(barcodedata));
        this.joinSession(barcodedata.se, onReceiveClientMessage);
     }
     else{
        console.error("session id is null:");
     }

   }
   qrcodeURL(){
     return api.qrURL(this.session,this.client);
   }
   addQRAttribute(attr){
     this.qrAttributes.push({
       na:attr.name,
       at:attr.type,
       va:attr.value
     })

   }
   genererateQrContent(){
     const qr={se:this.session,
               at:this.qrAttributes
             };
    return JSON.stringify(qr);
  }
}


 export function createGlobalInputMessageConnector(){
   return new GlobalInputMessageConnector();
 }
 export function changeBaseURL(baseurl){
     api.baseURL=baseurl;
 }
