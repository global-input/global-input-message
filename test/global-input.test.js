import { createMessageConnector, setCallbacksOnDeviceConnectOption, setCallbacksOnCodeDataProcessors, setCallbacksOnMobileConnectOption,setCallbacksOnInitData } from "../src";


  const assertInitData = (initData, expectedInitData)=>{
    expect(initData.action).toBe(expectedInitData.action);
    expect(initData.dataType).toBe(expectedInitData.dataType);
    expect(initData.form.id).toBe(expectedInitData.form.id);
    expect(initData.form.title).toBe(expectedInitData.form.title);
    expect(initData.form.label).toBe(expectedInitData.form.label);

    initData.form.fields.forEach((field,index)=>{
        expect(expectedInitData.form.fields[index].label).toEqual(field.label);     
        expect(expectedInitData.form.fields[index].id).toEqual(field.id);
        expect(expectedInitData.form.fields[index].value).toEqual(field.value);     
        expect(expectedInitData.form.fields[index].nLines).toBe(field.nLines);     
      });

  };

  describe("Mobile and Device Communication",()=>{

    test('receiver sender should send input message', async () => {


      let initData = {
        action: "input",    
        dataType: "form",        
        form: {
          title: "Login",
          id:"someForm",
          label:"someFolder",
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
      assertInitData(permissionMessage.initData,initData);
      
    
      const message1 = { content: "dilshat" };
      mobileConnector.sendInputMessage(message1, 0); //mobile  sends the first message, and the device receives it
      const messageReceived1 = await deviceMessageReceivers.fields[0].message();
      expect(messageReceived1).toEqual(message1);
    
      const message2 = { content: "password111" };
      mobileConnector.sendInputMessage(message2, 1); //mobile  sends the second message, and the device receives it
      const messageReceived2 = await deviceMessageReceivers.fields[1].message();
      expect(messageReceived2).toEqual(message2);
    
      const message3={content:"some value"};
      mobileMessageReceivers.input.reset();
      deviceConnector.sendInputMessage(message3,0); //device sends the first message, and the mobile receives it      
      const messageReceived3=await mobileMessageReceivers.input.message();  
      expect(messageReceived3.data.index).toEqual(0);
      expect(messageReceived3.data.value).toEqual(message3);
      mobileMessageReceivers.input.reset();   
      
      const message4={content:"some value 2"};
      deviceConnector.sendInputMessage(message4,1); //device sends the first message, and the mobile receives it
      const messageReceived4=await mobileMessageReceivers.input.message();      
      expect(messageReceived4.data.index).toEqual(1);
      expect(messageReceived4.data.value).toEqual(message4);
      mobileMessageReceivers.input.reset();   
      
    
    
      const initData2={
            action: "input",
            dataType: "form",
            form: {
            id: "test2@globalinput.co.uk",
            title: "Global Input App Test 2",
            label: "Global Input Test 2",
            fields: [
                {
                    label: "First Name",
                    id: "firstName",
                    value: "",
                    nLines: 10                    
                },{
                    label: "Last Name",
                    id: "lastName",
                    value: "",
                    nLines: 10                    
                },
            ]
            }
       };
       setCallbacksOnInitData(initData2,deviceMessageReceivers);
       deviceConnector.sendInitData(initData2);  //device change UI and mobile receives the message
       const messageForInitData=await mobileMessageReceivers.input.message();          
       assertInitData(messageForInitData.initData,initData2); 
       

       const message5 = { firstName: "dilshat" };
       mobileConnector.sendInputMessage(message5,0);        //mobile sends a message and the device receives it
       const messageReceived5 = await deviceMessageReceivers.fields[0].message();
       expect(messageReceived5).toEqual(message5);

       const message6 = { lastName: "hewzulla" };
       mobileConnector.sendInputMessage(message6,1); //mobile sends another message and the device receives it
       const messageReceived6 = await deviceMessageReceivers.fields[1].message();
      expect(messageReceived6).toEqual(message6);
       
      const message7={firstName: "name1"};
      
      mobileMessageReceivers.input.reset();   
      deviceConnector.sendInputMessage(message7,0); //device sends the first message, and the mobile receives it      
      const messageReceived7=await mobileMessageReceivers.input.message();  
      expect(messageReceived7.data.index).toEqual(0);
      expect(messageReceived7.data.value).toEqual(message7);
      


    });




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
      
    
      //mobileConnector.setCodeAES(codeAES); 
      const mobileMessageReceivers={};
      setCallbacksOnMobileConnectOption(mobileConnectOption,mobileMessageReceivers);
    mobileConnector.connect(mobileConnectOption); //mobile connect to device
    const permissionMessage=await mobileMessageReceivers.permission.message(); //mobile receive permission 
    
    expect(permissionMessage.allow).toBeTruthy();//should allow and should contain form information
    assertInitData(permissionMessage.initData,initData);
    
    
    const messageFromMobile={content:"dilshat"};
    
    mobileConnector.sendInputMessage(messageFromMobile, 0); //message send by mobile should be received by device
    const messageReceivedByDevice=await deviceMessageReceivers.fields[0].message();
    expect(messageReceivedByDevice).toEqual(messageFromMobile);
    const messageFromDevice={content:"next content"};
    
    deviceConnector.sendInputMessage(messageFromDevice,0);
    const messageReceivedByMobile=await mobileMessageReceivers.input.message();
    
    expect(messageReceivedByMobile.data.index).toEqual(0);
    expect(messageReceivedByMobile.data.value).toEqual(messageFromDevice);
      
    
    mobileConnector.disconnect();
    deviceConnector.disconnect();
    
    });


  });




