
import { createMessageConnector, createInputReceivers } from "../src";

import * as testUtil from './testUtil';
/**
 * compare initData to expectedInitData
 * @param {*} initData 
 * @param {*} expectedInitData 
 */
expect.extend({toBeSameInitData:testUtil.toBeSameInitData});

describe("Communications between a Mobile App and a Device App", () => {

    test('tests for messages sent between a mobile app and a device app', async () => {


        const deviceConfig = {
            //url: 'http://localhost:1337',
            // cSpell:disable
            //apikey: "k7jc3QcMPKEXGW5UC",
            // cSpell:enable     
            initData: {
                action: "input",
                dataType: "form",
                form: {
                    title: "Login",
                    id: "someForm",
                    label: "someFolder",
                    fields: [{
                        id: "username",
                        label: "Email address",
                        value: "some value"
                    }, {
                        id: "password",
                        label: "Password",
                        type: "secret"
                    }, {
                        id: "login",
                        label: "Login",
                        type: "action"
                    }]
                }
            }
        };

        const deviceApp = {
            con: createMessageConnector(), //creates a connector
            receiver: testUtil.createInputReceivers(deviceConfig), //create promise objects inside callbacks to make testing more intuitive.
            ui: deviceConfig.initData,
            message: null
        }
        let { connectionCode } = await deviceApp.con.connect(deviceConfig); //device is now ready to connect

        /** Here the device app displays a QR Code that contains the value of connectionCode, which is 
         *  an encrypted string containing information on how to connect to your device app
         **/

        const mobileApp = {
            con: createMessageConnector(), //creates a connector
            receiver: testUtil.createInputReceivers(), //create promise objects inside callbacks to make testing more intuitive.
            ui: null,
            message: null
        }
        //mobile app obtains the connectionCode from the device app by scanning the QR code displayed
        const { initData: initDataReceivedByMobile } = await mobileApp.con.connect(mobileApp.receiver.config, connectionCode) //mobile app connects to the device using the connectionCode that is obtained from the QR Code
        mobileApp.ui = initDataReceivedByMobile;   //mobile app display user interface from the initData obtained
        expect(mobileApp.ui).toBeSameInitData(deviceApp.ui);//initData received by the mobile should match the one sent by the device    

        mobileApp.message = "user1";
        mobileApp.con.sendValue(mobileApp.ui.form.fields[0].id, mobileApp.message); //mobile app sends a message
        deviceApp.message = await deviceApp.receiver.inputs[0].get(); //device app receives the message
        expect(deviceApp.message).toEqual(mobileApp.message); //received message should match the one sent

        mobileApp.message = "password1";
        mobileApp.con.sendValue(mobileApp.ui.form.fields[1].id, mobileApp.message); //mobile  sends a message
        deviceApp.message = await deviceApp.receiver.inputs[1].get(); //device receives the message        
        expect(deviceApp.message).toEqual(mobileApp.message); //received message should match the one sent



        deviceApp.message = "user2";
        deviceApp.con.sendValue(deviceApp.ui.form.fields[0].id, deviceApp.message); //device sends a message        
        mobileApp.message = await mobileApp.receiver.input.get();   //mobile receives the message 
        expect(mobileApp.message.data.fieldId).toEqual(deviceApp.ui.form.fields[0].id);   //index of the field should match
        expect(mobileApp.message.data.value).toEqual(deviceApp.message); //value should match the message sent by the device


        deviceApp.message = "password2";
        deviceApp.con.sendValue(deviceApp.ui.form.fields[1].id, deviceApp.message); //device sends a message        
        mobileApp.message = await mobileApp.receiver.input.get();   //mobile receives the message 
        expect(mobileApp.message.data.fieldId).toEqual(deviceApp.ui.form.fields[1].id);   //index of the field should match
        expect(mobileApp.message.data.value).toEqual(deviceApp.message); //value should match the message sent by the device

        const deviceConfig2 = {
            //url: 'http://localhost:1337',
            // cSpell:disable
            //apikey: "k7jc3QcMPKEXGW5UC",
            // cSpell:enable     
            initData: {
                action: "input",
                dataType: "form",
                form: {
                    id: "test2@globalinput.co.uk",
                    title: "Global Input App Test 2",
                    label: "Global Input Test 2",
                    fields: [{
                        label: "First Name",
                        id: "firstName",
                        value: "",
                        nLines: 10
                    }, {
                        label: "Last Name",
                        id: "lastName",
                        value: "",
                        nLines: 10
                    }]
                }
            }
        };
        deviceApp.receiver = testUtil.createInputReceivers(deviceConfig2); //create promise objects inside callbacks to make testing more intuitive.
        deviceApp.ui = deviceConfig2.initData;
        deviceApp.con.sendInitData(deviceApp.ui); //device sent an initData
        const { initData: initDataReceivedByMobile2 } = await mobileApp.receiver.input.get();   //mobile receives the initData
        mobileApp.ui = initDataReceivedByMobile2; //mobile app display user interface from the initData obtained
        expect(mobileApp.ui).toBeSameInitData(deviceApp.ui);//initData received by the mobile should match the one sent by the device    

        mobileApp.message = "firstName1";
        mobileApp.con.sendValue(mobileApp.ui.form.fields[0].id, mobileApp.message);        //mobile sends the message
        deviceApp.message = await deviceApp.receiver.inputs[0].get();  //device receives the message
        expect(deviceApp.message).toEqual(mobileApp.message); //received should match what was sent

        mobileApp.message = "lastName1";
        mobileApp.con.sendValue(mobileApp.ui.form.fields[1].id, mobileApp.message);        //mobile sends the message
        deviceApp.message = await deviceApp.receiver.inputs[1].get();  //device receives the message
        expect(deviceApp.message).toEqual(mobileApp.message); //received should match what was sent


        deviceApp.message = "firstName2";
        deviceApp.con.sendValue(deviceApp.ui.form.fields[0].id, deviceApp.message); //device sends a message        
        mobileApp.message = await mobileApp.receiver.input.get();   //mobile receives the message 
        expect(mobileApp.message.data.fieldId).toEqual(deviceApp.ui.form.fields[0].id);   //id of the field should match
        expect(mobileApp.message.data.value).toEqual(deviceApp.message); //value should match the message sent by the device

        deviceApp.message = "lastName2";
        deviceApp.con.sendValue(deviceApp.ui.form.fields[1].id, deviceApp.message); //device sends a message        
        mobileApp.message = await mobileApp.receiver.input.get();   //mobile receives the message 
        expect(mobileApp.message.data.fieldId).toEqual(deviceApp.ui.form.fields[1].id);   //id of the field should match
        expect(mobileApp.message.data.value).toEqual(deviceApp.message); //value should match the message sent by the device

        mobileApp.con.disconnect();
        mobileApp.con.disconnect();
    });




    test('receiver sender should pairing', async () => {

        const deviceConfig = {
            url: 'https://globalinput.co.uk',
            // cSpell:disable      
            securityGroup: "KqfMZzevq2jCbQUg+W8i750",
            apikey: "k7jc3QcMPKEXGW5UC",
            // cSpell:enable              
            initData: {
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
            }
        };

        const deviceApp = {
            con: createMessageConnector(),
            receiver: testUtil.createInputReceivers(deviceConfig),
            codeAES: "YFd9o8glRNIvM0C2yU8p4"
        }

        deviceApp.con.setCodeAES(deviceApp.codeAES);          //change the encryption for QR Code        
        let { connectionCode } = await deviceApp.con.connect(deviceConfig);  //connect        
        const encryptedDevicePairingCodeData = deviceApp.con.buildPairingData(); //get pairing code from the device

        const mobileApp = {
            con: createMessageConnector(), //mobile app
            receiver: testUtil.createInputReceivers()
        }
        const { codeData, type } = await mobileApp.con.connect(mobileApp.receiver.config, encryptedDevicePairingCodeData); //expected to get the codeData for pairing

        expect(codeData).toEqual({
            securityGroup: deviceConfig.securityGroup,
            codeAES: deviceApp.codeAES,
            action: "pairing"
        });
        expect(type).toBe('pairing');

        mobileApp.con.setCodeAES(codeData.codeAES);   //pair the mobile with the data
        mobileApp.con.setSecurityGroup(codeData.securityGroup); //pair the mobile with the data

        const inputCodeData = deviceApp.con.buildInputCodeData(); //get the connectionCode
        const { initData } = await mobileApp.con.connect(mobileApp.receiver.config, inputCodeData); //connect to the device using the code
        expect(initData).toBeSameInitData(deviceConfig.initData);  //should get the initData from the device

        mobileApp.message = "content1";
        mobileApp.con.sendValue(null, mobileApp.message, 0); //mobile sends the message    
        deviceApp.message = await deviceApp.receiver.inputs[0].get();
        expect(deviceApp.message).toEqual(mobileApp.message);

        deviceApp.message = "content2"
        deviceApp.con.sendValue(null, deviceApp.message, 0);
        mobileApp.message = await mobileApp.receiver.input.get();
        expect(mobileApp.message.data.index).toEqual(0);
        expect(mobileApp.message.data.value).toEqual(deviceApp.message);

        mobileApp.con.disconnect();
        deviceApp.con.disconnect();
    });


});


