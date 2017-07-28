import {createMessageConnector} from "../src";

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

  var senderConnectOptions={
    onInputPermissionResult: function(message){
      if(message.allow){
        console.log("***:"+JSON.stringify(message));
       expect(message.metadata[0].name).toBe(metadata[0].name);
       expect(message.metadata[0].value).toBe(metadata[0].value);
       expect(message.metadata[1].name).toBe(metadata[1].name);
        console.log("sender sending the input message:"+JSON.stringify(inputData));
        sender.sendInputMessage(inputData);
      }
      else{
        console.log(" permission denied:"+message.reason);
      }

    }
  };

  var senderCodeOptions={
    onInputCodeData:function(codedata){
      var options=sender.buildOptionsFromInputCodedata(codedata);
      var opts=Object.assign(options,senderConnectOptions);
      console.log("********** sender connection options:"+JSON.stringify(opts));
      sender.connect(opts);
    }
  };

  var connectSender=function(){
      var codedata=receiver.buildInputCodeData();
      console.log("code data*****:"+codedata);
      sender.processCodeData(codedata,senderCodeOptions);

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
      onInputPermission:function(next){
          next();
      },
      onRegistered:function(next){
          next();
          connectSender();
      },
      metadata
  }
  receiver.connect(receiverOptions);


});
