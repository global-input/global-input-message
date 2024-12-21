import SocketIOClient from "socket.io-client";
import * as codedataUtil from "./codedataUtil";


export default class GlobalInputMessageConnector {
  logError(message, error) {
    if (error) {
      console.log(' ' + this.client + "-" + message + "-" + error + "-" + error.stack + " ");
    }
    else {
      console.log(' ' + this.client + "-" + message + ' ');
    }
  }
  constructor() {
    // cSpell:disable
    this.apikey = "k7jc3QcMPKEXGW5UC";
    this.securityGroup = "1CNbWCFpsbmRQuKdd";
    // cSpell:enable
    this.codeAES = "LNJGw0x5lqnXpnVY8";
    this.session = codedataUtil.generateRandomString(17);
    this.client = codedataUtil.generateRandomString(17);
    this.aes = codedataUtil.generateRandomString(17);
    this.socket = null;
    this.connectedSenders = [];
    this.url = "https://globalinput.co.uk";
  }

  isConnected() {
    return this.socket != null;
  }
  disconnect() {
    if (this.socket) {
      this.disconnectSenders(this.connectedSenders);
      this.socket.disconnect();
      this.socket = null;
      this.activeInitData = null;
      this.connectedSenders = [];
    }
    this.targetSession = null;
  }
  setCodeAES(codeAES) {
    this.codeAES = codeAES;
  }
  setSecurityGroup(securityGroup) {
    this.securityGroup = securityGroup;
  }
  async _connectWithCode(options = {}, encryptedCode) {
    const that = this;
    return new Promise((resolve) => {
      const codeProcessors = {};
      codeProcessors.onInputCodeData = (codeData) => {
        let mobileConnectOption = this.buildOptionsFromInputCodedata(codeData, options);
        mobileConnectOption.onInputPermissionResult = (permissionMessage) => {
          options.onInputPermissionResult && options.onInputPermissionResult(permissionMessage);
          if (permissionMessage.allow) {
            resolve({ type: "mobile", initData: permissionMessage.initData, permission: permissionMessage });
          }
          else {
            resolve({ type: "error", permission: permissionMessage, error: permissionMessage && permissionMessage.reason });
          }
        }
        mobileConnectOption.onError = (errorMessage) => {
          resolve({ type: "error", error: "failed to connect:" + errorMessage });
          options.onError && options.onError(errorMessage);
        }
        that._connectWithCallback(mobileConnectOption);
      };
      codeProcessors.onPairing = (codeData) => {
        resolve({ type: "pairing", codeData });
      };
      codeProcessors.onError = (message) => {
        resolve({ type: "error", error: "code error:" + message });
        options.onError && options.onError(message);
      };
      that.processCodeData(encryptedCode, codeProcessors);
    });
  }

  async connect(options = {}, encryptedCode) {
    if (encryptedCode) {
      return this._connectWithCode(options, encryptedCode);
    }
    const that = this;
    return new Promise((resolve) => {
      const onError = options.onError;
      options.onError = message => {
        resolve({ type: "error", error: "message" });
        onError && onError(message);
      }
      const onRegistered = options.onRegistered;
      options.onRegistered = (connectionCode, registeredInfo) => {        
        resolve({ type: "device", connectionCode, registeredInfo });
        if(registeredInfo){
          registeredInfo.url=this.url;
        }
        onRegistered && onRegistered(connectionCode,registeredInfo);
      }
      const onRegisterFailed = options.onRegisterFailed;
      options.onRegisterFailed = (error) => {
        resolve({ type: "error", error });
        onRegisterFailed && onRegisterFailed();
      }
      that._connectWithCallback(options)
    });
  }

  _connectWithCallback(options = {}) {
    this.disconnect();

    if (options.apikey) {
      this.apikey = options.apikey;
    }
    if (options.securityGroup) {
      this.securityGroup = options.securityGroup;
    }
    if (options.client) {
      this.client = options.client;
    }

    if (options.url) {
      this.url = options.url;
    }
    if (options.connectSession) {
      this._connectToSocket(options);
    }
    else {
      let url = this.url + "/global-input/request-socket-url?apikey=" + this.apikey;
      let that = this;
      codedataUtil.basicGetURL(url, function (application) {
        that.url = application.url;
        if (application.apikey) {
          that.apikey = application.apikey;
        }
        that._connectToSocket(options);
      }, function (message) {
        console.warn(" failed-socket-server-url " + message);
        if (options.onError) {
          options.onError(" failed-socket-server-url " + message);
        }
      });
    }



  }
  _connectToSocket(options) {
    console.log("Copyright © 2017-2022 Iterative Solution Limited, visit: https://github.com/global-input/global-input-message#readme");
    this.socket = SocketIOClient(this.url);
    let that = this;
    this.socket.on("registerPermission", function (data) {
      that.onRegisterPermission(JSON.parse(data), options);
    });
  }
  onRegisterPermission(registerPermission, options) {
    if (registerPermission.result === "ok") {
      let that = this;
      this.socket.on("registered", function (data) {
        let registeredMessage = JSON.parse(data);
        if (registeredMessage.result === "ok") {
          that.onRegistered(options);
          if (options.onRegistered) {
            const connectionCode = that.buildInputCodeData();
            options.onRegistered(connectionCode, registeredMessage.registeredInfo);
            if(options.onClientAppLaunched){
              that.socket.on("app/launched", function (data) {
                if(options.onClientAppLaunched){
                  if(!data){
                    console.log("onClientAppLaunched data received empty data");
                    return;
                  }                  
                  try{
                    data=JSON.parse(data);
                  }
                  catch(error){
                    console.log("failed-to-parse-launched-data:"+data);
                    return;
                  }
                  options.onClientAppLaunched(data);
                }                
              });
            }

          }
          if (options.onSocket) {
            options.onSocket(that.socket);
          }
        }
        else {
          if (options.onRegisterFailed) {
            options.onRegisterFailed(registeredMessage.reason ? registeredMessage.reason : "onRegisterPermission:registration failed!");
          }
        }

      });
      let registerMessage = {
        securityGroup: this.securityGroup,
        session: this.session,
        client: this.client,
        apikey: this.apikey
      };

      this.socket.emit("register", JSON.stringify(registerMessage));
    }
    else {
      this.logError("failed to get register permission");
      if (options.onRegisterFailed) {
        options.onRegisterFailed("failed to get register permission");
      }

    }


  }


  onRegistered(options) {
    let that = this;
    this.socket.on(this.session + "/inputPermission", function (data) {
      that.processInputPermission(JSON.parse(data), options);
    });
    if (options.connectSession) {
      that.socket.on(options.connectSession + "/inputPermissionResult", function (data) {
        that.onInputPermissionResult(JSON.parse(data), options);
      });
      let requestInputPermissionMessage = {
        securityGroup: that.securityGroup,
        session: that.session,
        client: that.client,
        connectSession: options.connectSession
      };
      requestInputPermissionMessage.data = {
        client: that.client,
        time: (new Date()).getTime()
      };
      requestInputPermissionMessage.data = JSON.stringify(requestInputPermissionMessage.data);
      if (options.aes) {
        requestInputPermissionMessage.data = codedataUtil.encrypt(requestInputPermissionMessage.data, options.aes);
      }
      else {
        throw new Error("AES encryption key is missing, key is required");
      }


      let data = JSON.stringify(requestInputPermissionMessage)
      // cSpell:disable
      this.socket.emit("inputPermision", data);
      // cSpell:enable
    }

  }
  processInputPermission(inputPermissionMessage, options) {
    if (!inputPermissionMessage.data) {
      this.sendInputPermissionDeniedMessage(inputPermissionMessage, "data is missing in the permission request");
      return;
    }
    try {
      inputPermissionMessage.data = codedataUtil.decrypt(inputPermissionMessage.data, this.aes);
    }
    catch (error) {
      this.sendInputPermissionDeniedMessage(inputPermissionMessage, "failed to decrypt");
      return;
    }
    if (!inputPermissionMessage.data) {
      this.logError(" failed to decrypt the data in the permission request");
      this.sendInputPermissionDeniedMessage(inputPermissionMessage, "failed to decrypt");
      return;
    }
    try {
      inputPermissionMessage.data = JSON.parse(inputPermissionMessage.data);
    }
    catch (error) {
      this.logError(error + " while parsing the json data in the permission request");
      this.sendInputPermissionDeniedMessage(inputPermissionMessage, "data format error in the permission request");
      return;
    }
    if (inputPermissionMessage.data.client !== inputPermissionMessage.client) {
      this.logError("***the client id mis match in the permission");
      this.sendInputPermissionDeniedMessage(inputPermissionMessage, "client id mismatch");
      return;
    }

    const deny = (errorMessage = " the application has denied the request to connect") => {
      this.sendInputPermissionDeniedMessage(inputPermissionMessage, errorMessage);
    };
    const allow = () => {
      this.grantInputPermission(inputPermissionMessage, options);
    }
    delete inputPermissionMessage.data;
    if (options.onInputPermission) {
      options.onInputPermission(inputPermissionMessage, this.connectedSenders, allow, deny);
    }
    else {
      allow();
    }
  }
  disconnectSenders(sendersToDisconnect) {
    if (!sendersToDisconnect || !sendersToDisconnect.length) {
      return;
    }
    try {
      sendersToDisconnect.forEach(s => {
        console.log(" disconnected-same-client ");
        this.disconnectSender(s);
      });
    }
    catch (error) {
      console.log(" disconnecting-" + error + ' ');
    }

  }
  grantInputPermission(inputPermissionMessage, options) {
    if (this.grantPermissionQueue) {
      this.grantPermissionQueue = this.grantPermissionQueue.filter(s => s.inputPermissionMessage.client !== inputPermissionMessage.client);
      this.grantPermissionQueue.push({ inputPermissionMessage, options });
      this.grantPermissionQueueLastModified = new Date();
      return;
    }
    let existingSameSenders = this.connectedSenders.filter(s => s.client === inputPermissionMessage.client);
    if (existingSameSenders.length > 0) {
      this.disconnectSenders(existingSameSenders);
      console.log(" client-connected-again ");
      this.grantPermissionQueue = [];
      this.grantPermissionQueue.push({ inputPermissionMessage, options });
      this.grantPermissionQueueLastModified = new Date();
      setTimeout(this.processGrantInputPermissionQueue.bind(this), 300);
    }
    else {
      this._grantInputPermission(inputPermissionMessage, options);
    }
  }
  processGrantInputPermissionQueue() {
    let currentTime = new Date();
    if ((currentTime.getTime() - this.grantPermissionQueueLastModified.getTime()) < 200) {
      setTimeout(this.processGrantInputPermissionQueue.bind(this), 300);
    }
    else {
      let grantPermissionQueue = this.grantPermissionQueue;
      this.grantPermissionQueue = null;
      grantPermissionQueue.forEach(queueItem => {
        this._grantInputPermission(queueItem.inputPermissionMessage, queueItem.options);
      });
    }
  }

  _grantInputPermission(inputPermissionMessage, options) {
    let inputSender = this.buildInputSender(inputPermissionMessage, options);
    this.connectedSenders.push(inputSender);
    this.socket.on(this.session + "/input", inputSender.onInput);
    this.socket.on(this.session + "/leave", inputSender.onLeave);
    this.sendInputPermissionGrantedMessage(inputPermissionMessage, options);
    console.log(" allow-to-connect-" + this.connectedSenders && this.connectedSenders.length + " ");
    options.onSenderConnected && options.onSenderConnected(inputSender, this.connectedSenders);
  }
  sendInputPermissionGrantedMessage(inputPermissionMessage, options) {
    let inputPermissionResult = { ...inputPermissionMessage };
    if (options.initData) {
      inputPermissionResult.initData = options.initData;
      let inputPermissionResultInString = JSON.stringify(inputPermissionResult.initData);
      if (this.aes) {
        inputPermissionResult.initData = codedataUtil.encrypt(inputPermissionResultInString, this.aes);
      }
      else {
        throw new Error("AES encryption key is missing in grant");
      }
    }
    inputPermissionResult.allow = true;
    this.sendInputPermissionResult(inputPermissionResult);
  }
  sendInputPermissionDeniedMessage(inputPermissionMessage, reason) {
    inputPermissionMessage.allow = false;
    inputPermissionMessage.reason = reason;
    this.sendInputPermissionResult(inputPermissionMessage);
  }
  sendInputPermissionResult(inputPermissionResult) {
    let data = JSON.stringify(inputPermissionResult);
    this.socket.emit(this.session + "/inputPermissionResult", data);
  }

  onInputPermissionResult(inputPermissionResultMessage, options) {
    this.connectSession = options.connectSession;
    this.inputAES = options.aes;
    if (this.inputAES && inputPermissionResultMessage.initData && typeof inputPermissionResultMessage.initData === "string") {
      let decryptedInitData = codedataUtil.decrypt(inputPermissionResultMessage.initData, this.inputAES);
      if (decryptedInitData) {
        try {
          inputPermissionResultMessage.initData = JSON.parse(decryptedInitData);
          if (this.socket) {
            let receiverDisconnected = function () {
              let currentTime = (new Date()).getTime();
              if ((!this.latTimeReceiverDisconnected) || ((currentTime - this.latTimeReceiverDisconnected) < 200)) {
                if (options.onReceiverDisconnected) {
                  options.onReceiverDisconnected();
                }
              }
              this.latTimeReceiverDisconnected = currentTime;

            }
            this.socket.on(options.connectSession + "/leave", receiverDisconnected);
            let inputSender = this.buildInputSender(inputPermissionResultMessage, options);
            this.socket.on(options.connectSession + "/input", inputSender.onInput);
            let that = this;
            this.socket.on(options.connectSession + "/output", function (outputMessage) {
              that.onOutputMessageReceived(outputMessage, options);
            });
          }
          if (options.onInputPermissionResult) {
            options.onInputPermissionResult(inputPermissionResultMessage);
          }
        }
        catch (error) {
          inputPermissionResultMessage.initData = null;
          console.log(" invalid-response-received ");
          if (options.onError) {
            options.onError(" invalid-response-received ");
          }

        }
      }
      else {
        console.warn(" empty-InitData-decrypted ");
        if (options.onError) {
          options.onError(" empty-InitData-decrypted ");
        }
      }

    }
    else {
      inputPermissionResultMessage.initData = null;
      console.log(" refused-to-connect ");
      if (options.onError) {
        options.onError(" refused-to-connect ");
      }
    }
  }
  onOutputMessageReceived(messageData, options) {
    if (options.onOutputMessageReceived) {
      let message = JSON.parse(messageData);
      let aes = this.aes;
      if (this.inputAES) {
        aes = this.inputAES;
      }
      if (aes && message.data) {
        message.data = codedataUtil.decrypt(message.data, aes);
      }
      options.onOutputMessageReceived(message);
    }
    else {
      console.log(" output-message-discarded-not-listener ");
    }
  }
  sendOutputMessage(outputMessage) {
    if (!this.isConnected()) {
      console.log(" not-connected-output-message ");
      return;
    }
    let encryptedMessageData = codedataUtil.encrypt(JSON.stringify(outputMessage), this.aes);
    let message = {
      client: this.client,
      data: encryptedMessageData
    }
    let messageToSent = JSON.stringify(message)
    this.socket.emit(this.session + "/output", messageToSent);
  }
  buildInputSender(inputPermissionMessage, options) {
    let that = this;
    let inputSender = {
      client: inputPermissionMessage.client,
      session: inputPermissionMessage.session,
      onInput: function (data) {
        try {
          let inputMessage = JSON.parse(data);
          if (inputMessage.client === that.client) {
            return;
          }
          let aes = that.aes;
          if (that.inputAES) {
            aes = that.inputAES;
          }
          if (inputMessage.data) {
            let dataDecrypted = null;
            try {
              dataDecrypted = codedataUtil.decrypt(inputMessage.data, aes);
            }
            catch (error) {
              that.logError(error + ", failed to decrypt the input content");
              return;
            }
            if (!dataDecrypted) {
              that.logError("failed to decrypt the content");
              return;
            }


            try {
              inputMessage.data = JSON.parse(dataDecrypted);
            }
            catch (error) {
              that.logError(error + "failed to parse the decrypted input content")
            }
          }
          else if (inputMessage.initData) {
            let dataDecrypted = null;
            try {
              dataDecrypted = codedataUtil.decrypt(inputMessage.initData, aes);
            }
            catch (error) {
              that.logError(error + ", failed to decrypt the initData content");
              return;
            }
            if (!dataDecrypted) {
              that.logError("failed to decrypt the content");
              return;
            }
            try {
              inputMessage.initData = JSON.parse(dataDecrypted);
            }
            catch (error) {
              that.logError(error + "failed to parse the decrypted initData content")
            }
          }
          else {
            that.logError("received input data is not encrypted");
          }
          if (options.onInput) {
            options.onInput(inputMessage);
            return;
          }
          else {
            that._onInput(inputMessage, options);
          }

        }
        catch (error) {
          that.logError("error when processing the input message.", error);
        }

      },
      onLeave: function (data) {
        let leaveMessage = JSON.parse(data);
        let matchedSenders = that.connectedSenders.filter(s => s.client === leaveMessage.client);
        if (matchedSenders.length > 0) {
          let inputSenderToLeave = matchedSenders[0];
          that.disconnectSender(inputSenderToLeave);

          if (options.onSenderDisconnected) {
            options.onSenderDisconnected(inputSenderToLeave, that.connectedSenders);
          }

        }
      }

    };
    return inputSender;
  }
  disconnectSender(inputSender) {
    try {
      this.socket.removeListener(this.session + "/input", inputSender.onInput);
      this.socket.removeListener(this.session + "/leave", inputSender.onLeave);
    }
    catch (error) {
      console.log(error);
    }
    this.connectedSenders = this.connectedSenders.filter(s => s.client !== inputSender.client);
    console.log(" client-disconnected ");
  }
  _onInput(inputMessage, options) {
    if (inputMessage.initData) {
      if (options.initData && options.initData.operations && options.initData.operations.onInitData) {
        options.initData.operations.onInitData(inputMessage);
      }
      return;
    }

    if (typeof inputMessage.data == "undefined") {
      console.log(" data-missing-input-message ");
      return;
    }
    let initData = options.initData
    if (this.activeInitData) {
      initData = this.activeInitData;
    }
    if ((!initData.form) || (!initData.form.fields)) {
      console.log(" form-field-missing-initData ");
      return;
    }
    if (typeof inputMessage.data.index != 'undefined') {
      if (inputMessage.data.index < 0 || initData.form.fields.length <= inputMessage.data.index) {
        console.log(" index-too-big-input-message ");
        return;
      }
      if (initData.form.fields[inputMessage.data.index] && initData.form.fields[inputMessage.data.index].operations && initData.form.fields[inputMessage.data.index].operations.onInput) {
        initData.form.fields[inputMessage.data.index].operations.onInput(inputMessage.data.value);
      }
      else {
        console.warn(" field-index-onInput-not-present ");
      }
    }
    else if (typeof inputMessage.data.fieldId != 'undefined') {
      const matchedFields = initData.form.fields.filter(f => f.id === inputMessage.data.fieldId);
      if (matchedFields.length) {
        let matchedField = matchedFields[0];
        if (matchedField.operations && matchedField.operations.onInput) {
          matchedField.operations.onInput(inputMessage.data.value);
        }
        else {
          console.log(" field-id-onInput-not-present ");
        }
      }
      else {
        console.log(" input-message-discarded-no-matching-id ");
      }
    }
    else {
      console.log(" input-message-discarded-index-id-missing ");
    }

  }

  sendInitData(initData) {
    if (!this.isConnected()) {
      console.log(" not-connected-send-init-data ");
      return;
    }
    let aes = this.aes;
    if (this.inputAES) {
      aes = this.inputAES;
    }
    const contentToEncrypt = JSON.stringify(initData);
    const contentEncrypted = codedataUtil.encrypt(contentToEncrypt, aes);

    const message = {
      client: this.client,
      initData: contentEncrypted
    }
    const content = JSON.stringify(message);
    let session = this.session;
    if (this.connectSession) {
      session = this.connectSession;
    }
    this.socket.emit(session + '/input', content);
    this.activeInitData = initData;
  }
  sendValue(fieldId, value, index) {
    if (!this.isConnected()) {
      console.log(" not-connected-send-value ");
      return;
    }
    let data = {
      id: codedataUtil.generateRandomString(10),
      value
    };
    if (fieldId) {
      data.fieldId = fieldId;
    }
    else {
      data.index = index;
    }
    let aes = this.aes;
    if (this.inputAES) {
      aes = this.inputAES;
    }
    let contentToEncrypt = JSON.stringify(data);
    let contentEncrypted = codedataUtil.encrypt(contentToEncrypt, aes);
    data = contentEncrypted;
    let message = {
      client: this.client,
      data
    }
    let content = JSON.stringify(message);
    let session = this.session;
    if (this.connectSession) {
      session = this.connectSession;
    }
    this.socket.emit(session + '/input', content);
  }
  sendInputMessage(value, index, fieldId) {
    this.sendValue(fieldId, value, index);
  }
  changeGlobalInputFieldData(globalInputdata, data) {
    if (!globalInputdata) {
      console.log(" fields-empty-discarded-changes ");
      return globalInputdata;
    }
    if (data.fieldId) {
      globalInputdata = globalInputdata.map(f => {
        if (f.id === data.fieldId) {
          f.value = data.value;
        }
        return f;
      });
    }
    else if (typeof data.index !== 'undefined' && data.index < globalInputdata.length) {
      globalInputdata = globalInputdata.slice(0);
      globalInputdata[data.index].value = data.value;
    }
    else {
      console.warn(" data-index-out-of-range-initData ");
    }
    return globalInputdata;
  }



  buildOptionsFromInputCodedata(codedata, options) {
    return codedataUtil.buildOptionsFromInputCodedata(this, codedata, options);
  }
  buildInputCodeData(data = {}) {
    return codedataUtil.buildInputCodeData(this, data);
  }

  buildPairingData(data = {}) {
    return codedataUtil.buildPairingData(this.securityGroup, this.codeAES, data);
  }

  processCodeData(encryptedCodedata, options) {
    return codedataUtil.processCodeData(this, encryptedCodedata, options);
  }

}
