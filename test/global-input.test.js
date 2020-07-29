import { createMessageConnector, setCallbacksOnDeviceConnectOption, setCallbacksOnCodeDataProcessors, setCallbacksOnMobileConnectOption } from "../src";

it('receiver sender should send input message', async () => {


  let initData = {
    action: "input",
    form: {
      title: "Login",
      fields: [{
        label: "Email address",
        value: "some value"
      }, {
        label: "Password",
        type: "secret"
      }, {
        label: "Login",
        type: "action"
      }]
    }
  };


  let deviceConnectOption = {
    url: 'http://localhost:1337',
    // cSpell:disable
    apikey: "k7jc3QcMPKEXGW5UC",
    // cSpell:enable     
    initData
  };


  const deviceMessageReceivers = {};
  setCallbacksOnDeviceConnectOption(deviceConnectOption, deviceMessageReceivers);
  const deviceConnector = createMessageConnector();
  deviceConnector.connect(deviceConnectOption); //device connect
  await deviceMessageReceivers.registered.message();    //device registered

  let codedata = deviceConnector.buildInputCodeData(); //mobile obtains the connection code

  const mobileConnector = createMessageConnector();

  const codeProcessors = {};
  const codeMessageReceivers = {};

  setCallbacksOnCodeDataProcessors(codeProcessors, codeMessageReceivers);

  mobileConnector.processCodeData(codedata, codeProcessors); //decrypt the connection code

  const connectionCode = await codeMessageReceivers.input.code(); //obtains the decrypted connection code

  let mobileConnectOption = mobileConnector.buildOptionsFromInputCodedata(connectionCode);
  const mobileMessageReceivers = {};
  setCallbacksOnMobileConnectOption(mobileConnectOption, mobileMessageReceivers);
  mobileConnector.connect(mobileConnectOption); //mobile connect to device
  const permissionMessage = await mobileMessageReceivers.permission.message(); //mobile receive permission 

  expect(permissionMessage.allow).toBeTruthy();//should allow and should contain form information
  expect(permissionMessage.initData.form.fields[0].label).toBe(initData.form.fields[0].label);
  expect(permissionMessage.initData.form.fields[0].label).toBe(initData.form.fields[0].label);
  expect(permissionMessage.initData.form.fields[1].label).toBe(initData.form.fields[1].label);

  const messageSentByMobile1 = { content: "dilshat" };
  mobileConnector.sendInputMessage(messageSentByMobile1, 0); //mobile  sends the first message, and the device receives it
  const messageReceivedByDevice1 = await deviceMessageReceivers.fields[0].message();
  expect(messageReceivedByDevice1).toEqual(messageSentByMobile1);

  const messageSentByMobile2 = { content: "password111" };
  mobileConnector.sendInputMessage(messageSentByMobile2, 1); //mobile  sends the second message, and the device receives it
  const messageReceivedByDevice2 = await deviceMessageReceivers.fields[1].message();
  expect(messageReceivedByDevice2).toEqual(messageSentByMobile2);

  const messageSentByDevice1={content:"some value"};
  deviceConnector.sendInputMessage(messageSentByDevice1,0); //device sends the first message, and the mobile receives it
  const messageReceivedByMobile1=await mobileMessageReceivers.input.message();  
  expect(messageReceivedByMobile1.data.index).toEqual(0);
  expect(messageReceivedByMobile1.data.value).toEqual(messageSentByDevice1);
  mobileMessageReceivers.input.reset();   
  
  const messageSentByDevice2={content:"some value 2"};
  deviceConnector.sendInputMessage(messageSentByDevice2,1); //device sends the first message, and the mobile receives it
  const messageReceivedByMobile2=await mobileMessageReceivers.input.message();   
  expect(messageReceivedByMobile2.data.index).toEqual(1);
  expect(messageReceivedByMobile2.data.value).toEqual(messageSentByDevice2);
  



});
