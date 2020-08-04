
import {createMessageConnector,deviceConnect,decryptCodeData,mobileConnect,deviceSendInitData} from "../src"; 


  /**
   * compare initData to expectedInitData
   * @param {*} initData 
   * @param {*} expectedInitData 
   */
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
            
      
          
      const deviceConnectOption = {
        //url: 'http://localhost:1337',
        // cSpell:disable
        //apikey: "k7jc3QcMPKEXGW5UC",
        // cSpell:enable     
        initData
      };
    
      
      const deviceConnector = createMessageConnector();
      
      let {registered,fields}=deviceConnect(deviceConnector,deviceConnectOption);
      
      await registered();    //device registered
    
      let codedata = deviceConnector.buildInputCodeData(); // device generate encrypted connection code
      
      //We assume here that mobile app obtains the codedata by scanning the QR Code

      const mobileConnector = createMessageConnector(); //Mobile App prepare for connection
      
      const {codeData,codeType}=await decryptCodeData(codedata,mobileConnector);//mobile app decrypts the code
      expect(codeType).toBe('input'); 

      const {getPermission,input} = mobileConnect(mobileConnector,codeData); //mobile connect with the codeData
      
      const permissionMessage = await getPermission(); //mobile receive permission 
    
      expect(permissionMessage.allow).toBeTruthy();//should allow and should contain form information
      assertInitData(permissionMessage.initData,initData);
      
    
      const message1 = { content: "dilshat" };
      mobileConnector.sendInputMessage(message1, 0); //mobile  sends the first message, and the device receives it
      const messageReceived1 = await fields[0].get(); //device receives the message
      expect(messageReceived1).toEqual(message1);
      fields[0].reset(); //to be ready to receive the next message
    
      const message2 = { content: "password111" };
      mobileConnector.sendInputMessage(message2, 1); //mobile  sends the second message, and the device receives it
      const messageReceived2 = await await fields[1].get() //device receives the message
      expect(messageReceived2).toEqual(message2);
      fields[1].reset(); //to be ready to receive the next message
    
      const message3={content:"some value"};
      deviceConnector.sendInputMessage(message3,0); //device sends first message
      const messageReceived3=await input.get();   //mobile receives the message 
      expect(messageReceived3.data.index).toEqual(0);
      expect(messageReceived3.data.value).toEqual(message3);
      input.reset(); //mobile ready to receive the next message

      const message4={content:"some value 2"};
      deviceConnector.sendInputMessage(message4,1); //device sends the first message, and the mobile receives it
      const messageReceived4=await input.get();      
      expect(messageReceived4.data.index).toEqual(1);
      expect(messageReceived4.data.value).toEqual(message4);      
      input.reset(); //mobile ready to receive the next message


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

   fields=deviceSendInitData(deviceConnector,initData2); //device sent initData
   const messageForInitData=await input.get(); //mobile receives the initData
   assertInitData(messageForInitData.initData,initData2); //received should match what is sent
   input.reset(); //mobile input ready for the next input

   const message5 = { firstName: "dilshat" };
   mobileConnector.sendInputMessage(message5,0);        //mobile sends a message
   const messageReceived5 = await fields[0].get();  //device receives it
   expect(messageReceived5).toEqual(message5);
   fields[0].reset();


   const message6 = { lastName: "hewzulla" };
   mobileConnector.sendInputMessage(message6,1); //mobile sends a message
   const messageReceived6 = await fields[1].get(); //device receives it.
   expect(messageReceived6).toEqual(message6);
   fields[1].reset();

      
       
   const message7={firstName: "name1"};            
   deviceConnector.sendInputMessage(message7,0); //device sends the first message, and the mobile receives it      
   const messageReceived7=await input.get();  
   expect(messageReceived7.data.index).toEqual(0);
   expect(messageReceived7.data.value).toEqual(message7);
   input.reset();

   mobileConnector.disconnect();
  deviceConnector.disconnect();
    
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
        apikey:"k7jc3QcMPKEXGW5UC",
        // cSpell:enable              
        initData
    }
    
      const codeAES = "YFd9o8glRNIvM0C2yU8p4";
      const deviceConnector=createMessageConnector();
      deviceConnector.setCodeAES(codeAES);
      let {registered,fields}=deviceConnect(deviceConnector,deviceConnectOption);
      await  registered(); //device is ready to connect

      const encryptedDevicePairingCodeData=deviceConnector.buildPairingData(); //get pairing code from the device

      const mobileConnector=createMessageConnector(); //mobile app
      //mobile app scans the code 

      const {codeData:paringCodeData,codeType:pairingCodeType}=await decryptCodeData(encryptedDevicePairingCodeData,mobileConnector);//mobile app decrypts the code
      expect(pairingCodeType).toBe('pairing');
      expect(paringCodeData).toEqual({
          securityGroup:deviceConnectOption.securityGroup,
          codeAES,
          action:"pairing"
      });
      
      mobileConnector.setCodeAES(paringCodeData.codeAES);
      mobileConnector.setSecurityGroup(paringCodeData.securityGroup);

      const inputCodeData=deviceConnector.buildInputCodeData();
      
      const {codeData,codeType} = await decryptCodeData(inputCodeData,mobileConnector);//mobile app decrypts the code
      expect(codeType).toBe('input');       
      
      const {getPermission,input} = mobileConnect(mobileConnector,codeData); //mobile connect with the codeData
      
      const permissionMessage = await getPermission(); //mobile receive permission 
    
      expect(permissionMessage.allow).toBeTruthy();//should allow and should contain form information

      assertInitData(permissionMessage.initData,initData);
    
      
    const messageFromMobile={content:"dilshat"};
    
    mobileConnector.sendInputMessage(messageFromMobile, 0); //message send by mobile should be received by device
    const messageReceivedByDevice=await fields[0].get();
    expect(messageReceivedByDevice).toEqual(messageFromMobile);
    const messageFromDevice={content:"next content"};
    fields[0].reset();
    
    deviceConnector.sendInputMessage(messageFromDevice,0);
    const messageReceivedByMobile=await input.get();
    
    expect(messageReceivedByMobile.data.index).toEqual(0);
    expect(messageReceivedByMobile.data.value).toEqual(messageFromDevice);
    
    
    mobileConnector.disconnect();
    deviceConnector.disconnect();
    
    });


  });




