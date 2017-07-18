import {createMessageConnector} from "../src/index";

var sum=function(x,y){return (x+y)};
test('receiver sender should send input message', (done) => {
  const receiver=createMessageConnector();
  const sender=createMessageConnector();
  var codeData=null;
  console.log("receiver session:"+receiver.session);
  console.log("receiver client:"+receiver.client);
  console.log("sender session:"+sender.session);
  console.log("sender client:"+sender.client);
  var metadata=[
    {
    name:"Email address",
    value:"some value"
   },{
     name:"Password",
     type:"secret"
   },
   {
     name:"Login",
     type:"action"
   }
];
  var inputData={content:"dilshat"};
 var connectSender=function(){
    var senderOptions={
        url:'http://192.168.0.5:1337',
        onComplete:function(message){
            console.log("sender connection complete"+JSON.stringify(message));
       },
       join:{session:receiver.session},
       onRegistered:function(message){
         console.log("sender Join Complete:"+JSON.stringify(message));
           expect(message.metadata[0].name).toBe(metadata[0].name);
           expect(message.metadata[0].value).toBe(metadata[0].value);
           expect(message.metadata[1].name).toBe(metadata[1].name);
         console.log("sender sending the input message:"+JSON.stringify(inputData));
         sender.sendInputMessage(inputData);


       }
   }
   console.log("now connecting the sender::::");
   sender.processCodeData(senderOptions,codeData);
 }
  var receiverOptions={
      url:'http://192.168.0.5:1337',
      onInput:function(message){
            console.log("receiver received input message:"+JSON.stringify(message));
            expect(message.data.content).toBe(inputData.content);
            sender.disconnect();
            receiver.disconnect();
            done();
      },
      onInputPermission:function(done){
          done();
      },
      onRegistered:function(done){
          connectSender();
      },
      metadata
  }
  receiver.connect(receiverOptions);
  codeData=receiver.buildCodeData();







});
