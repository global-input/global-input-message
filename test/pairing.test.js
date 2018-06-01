import {createMessageConnector} from "../src";

test('receiver sender should pairing', (done) => {

  const receiver=createMessageConnector();
  const sender=createMessageConnector();

  receiver.client="recever";
  sender.client="sender";



  var codedata=null;
  console.log("receiver session:"+receiver.session);
  console.log("receiver client:"+receiver.client);
  console.log("sender session:"+sender.session);
  console.log("sender client:"+sender.client);
  var initData={
    action:"input",
    form:{
           title:"Login",
              fields:[{
            name:"Email address",
            value:"some value"
            },{
             name:"Password",
             type:"secret"
            },{
             name:"Login",
             type:"action"
           }]
      }
};
  var inputData={content:"dilshat"};

  var senderConnectOptions={
    onInputPermissionResult: function(message){
      if(message.allow){
        console.log("***:"+JSON.stringify(message));
       expect(message.initData.form.fields[0].name).toBe(initData.form.fields[0].name);
       expect(message.initData.form.fields[0].value).toBe(initData.form.fields[0].value);
       expect(message.initData.form.fields[1].name).toBe(initData.form.fields[1].name);
        console.log("sender sending the input message:"+JSON.stringify(inputData));
        sender.sendInputMessage(inputData, 0);
      }
      else{
        console.log(" permission denied:"+message.reason);
      }

    }
  };

  var senderCodeOptions={
    onInputCodeData:function(codedata){
      console.log("********* onInputCodeData*****:"+JSON.stringify(codedata));

      var options=sender.buildOptionsFromInputCodedata(codedata);
      options.securityGroup=this.securityGroup;
      var opts=Object.assign(options,senderConnectOptions);
      console.log("********** sender connection options:"+JSON.stringify(opts));
      console.log("****sender securityGroup:"+sender.securityGroup);
      sender.connect(opts);
    },
    onPairing:function(codedata){
      console.log("Pairing data is received:"+JSON.stringify(codedata));
      senderCodeOptions.securityGroup=codedata.securityGroup;
      senderCodeOptions.codeAES=codedata.codeAES;
      var codedata=receiver.buildInputCodeData();

      console.log("code data*****:"+codedata);
      sender.processCodeData(codedata,senderCodeOptions);
    }
  };



  var pairingSender = function(){

      var pairingData=receiver.buildPairingData();


      sender.processCodeData(pairingData,senderCodeOptions);
  };
  var receiverOptions={
      url:'http://192.168.0.5:1337',
      securityGroup:"KqfMZzevq2jCbQUg+W8i750",

      codeAES:"YFd9o8glRNIvM0C2yU8p4",
      onInput:function(message){
            console.log("receiver received input message:"+JSON.stringify(message));
            expect(message.data.value.content).toBe(inputData.content);
            sender.disconnect();
            receiver.disconnect();
            done();
      },
      apikey:"AME6hDRWzGLfCfZbs",
      onInputPermission:function(next){
          next();
      },
      onRegistered:function(next){
          console.log("receiver registered");
          next();
          pairingSender();
      },
      initData
  }
  receiver.connect(receiverOptions);


});
