import {createMessageConnector,setCallbacksOnDeviceConnectOption,setCallbacksOnCodeDataProcessors,setCallbacksOnMobileConnectOption} from "../src";

test('receiver sender should pairing', async () => {
  const initData={
    action:"input",
    form:{
           title:"Login",
              fields:[{
            label:"Email address",
            value:"some value"
            },{
              label:"Password",
             type:"secret"
            },{
              label:"Login",
             type:"action"
           }]
      }
};
  const deviceConnectOption={
    url:'https://globalinput.co.uk',
    // cSpell:disable      
    securityGroup:"KqfMZzevq2jCbQUg+W8i750",
    codeAES:"YFd9o8glRNIvM0C2yU8p4",        
    apikey:"k7jc3QcMPKEXGW5UC",
    // cSpell:enable              
    initData
}
const deviceMessageReceivers={};
setCallbacksOnDeviceConnectOption(deviceConnectOption,deviceMessageReceivers);
const deviceConnector=createMessageConnector();
deviceConnector.connect(deviceConnectOption); 
  await   deviceMessageReceivers.registered.message(); //device is ready to connect
  const encryptedDevicePairingCodeData=deviceConnector.buildPairingData(); //get pairing code from the device

  const mobileConnector=createMessageConnector();
  const codeProcessors={};
  const codeMessageReceivers={};
  setCallbacksOnCodeDataProcessors(codeProcessors,codeMessageReceivers); 

  mobileConnector.processCodeData(encryptedDevicePairingCodeData,codeProcessors); //decrypt the pairing code

  const decryptedPairingCode=await codeMessageReceivers.pairing.code(); //obtains the decrypted paring code

  const securityGroup=decryptedPairingCode.securityGroup; //sync to the mobile
  const codeAES=decryptedPairingCode.codeAES;
  

  const encryptedConnectionCode=deviceConnector.buildInputCodeData({
    securityGroup,
    codeAES
  }); //obtain connection code

  mobileConnector.processCodeData(encryptedConnectionCode,codeProcessors); //decrypt the connection code
  const decryptedConnectionCode=await codeMessageReceivers.input.code(); //obtains the decrypted connection code
  expect(decryptedConnectionCode.securityGroup).toEqual(securityGroup);
  expect(decryptedConnectionCode.codeAES).toEqual(codeAES);
  const mobileConnectOption=mobileConnector.buildOptionsFromInputCodedata(decryptedConnectionCode);
  console.log("---------mobileConnectOption:::::"+JSON.stringify(mobileConnectOption));

  //mobileConnector.setCodeAES(codeAES); 
  const mobileMessageReceivers={};
  setCallbacksOnMobileConnectOption(mobileConnectOption,mobileMessageReceivers);
mobileConnector.connect(mobileConnectOption); //mobile connect to device
const permissionMessage=await mobileMessageReceivers.permission.message(); //mobile receive permission 

expect(permissionMessage.allow).toBeTruthy();//should allow and should contain form information
expect(permissionMessage.initData.form.fields[0].label).toBe(initData.form.fields[0].label);
expect(permissionMessage.initData.form.fields[0].label).toBe(initData.form.fields[0].label);
expect(permissionMessage.initData.form.fields[1].label).toBe(initData.form.fields[1].label);   

const messageFromMobile={content:"dilshat"};

mobileConnector.sendInputMessage(messageFromMobile, 0); //message send by mobile should be received by device
const messageReceivedByDevice=await deviceMessageReceivers.fields[0].message();
expect(messageReceivedByDevice).toEqual(messageFromMobile);
const messageFromDevice={content:"next content"};
//deviceConnector.sendInputMessage(messageFromDevice,0);


mobileConnector.disconnect();
deviceConnector.disconnect();

});
