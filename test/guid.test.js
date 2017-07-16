import {createMessageConnector} from "../src/index";

var sum=function(x,y){return (x+y)};
test('receiver sender should communicate', (done) => {
  const receiver=createMessageConnector();
  const sender=createMessageConnector();
  console.log("receiver session:"+receiver.session);
  console.log("receiver client:"+receiver.client);
  console.log("sender session:"+sender.session);
  console.log("sender client:"+sender.client);
  var inputData={content:"dilshat"};
 var connectSender=function(){
    var senderOptions={
        url:'http://192.168.0.5:1337',
        onComplete:function(message){
            console.log("sender connection complete"+JSON.stringify(message));
       },
       join:{session:receiver.session},
       onJoinComplete:function(message){
         console.log("sender Join Complete:"+JSON.stringify(message));
         console.log("sender sending the input message:"+JSON.stringify(inputData));
         sender.sendInputMessage(inputData);


       }
   }
   console.log("now connecting the sender::::");
   sender.connect(senderOptions);
 }
  var receiverOptions={
      url:'http://192.168.0.5:1337',
      onInputMessageReceived:function(message){
            console.log("receiver received input message:"+JSON.stringify(message));
            expect(message.data.content).toBe(inputData.content);
            sender.disconnect();
            receiver.disconnect();
            done();
      },
      canJoin:function(message){
          console.log(" The reeiver received onJoin:"+JSON.stringify(message));
          return false;
      },
      onConnectionComplete:function(message){
        console.log("receiver connection  complete:"+JSON.stringify(message));
        expect(message.action).toBe("join");
        expect(message.randomkey).toBeDefined();
        connectSender();
      },
      medata:[
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
    ]
  }

  receiver.connect(receiverOptions);






});
