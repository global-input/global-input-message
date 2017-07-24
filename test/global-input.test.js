import {createMessageConnector} from "../src/index";

var sum=function(x,y){return (x+y)};
test('receiver sender should send input message', (done) => {

  const receiver=createMessageConnector();
  const sender=createMessageConnector();

  receiver.client="recever";
  sender.client="sender";



  var codedata=null;
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
        onInputPermissionResult: function(message){
          console.log("***:"+JSON.stringify(message));
          expect(message.metadata[0].name).toBe(metadata[0].name);
          expect(message.metadata[0].value).toBe(metadata[0].value);
          expect(message.metadata[1].name).toBe(metadata[1].name);
          console.log("sender sending the input message:"+JSON.stringify(inputData));
          sender.sendInputMessage(inputData);
        },
        onInputCodeData:function(opts,codedata){
          sender.connect(opts);
        }
      };
      var codedata=receiver.buildInputCodeData();
      console.log("code data*****:"+codedata);
      sender.processCodeData(senderOptions,codedata);

  };
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
          done();
          connectSender();
      },
      metadata
  }
  receiver.connect(receiverOptions);


});
