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
      url:'https://globalinput.co.uk',
      onInput:function(message){
            console.log("receiver received input message:"+JSON.stringify(message));
            expect(message.data.value.content).toBe(inputData.content);
            sender.disconnect();
            receiver.disconnect();
            done();
      },
      apikey:"k7jc3QcMPKEXGW5UC",
      onInputPermission:function(next){
          next();
      },
      onRegistered:function(next){
          console.log("receiver registered");
          next();
          connectSender();
      },
      initData
  }
  receiver.connect(receiverOptions);


});
