import { document, console } from 'global';
import { storiesOf } from '@storybook/html';
import { createMessageConnector } from "global-input-message";
import QRCode from 'qrcode';



let connector = null;
const startGlobalInput = ({ onReceiveConnectionCode, onInput, onSenderConnected, onSenderDisconnected }) => {
  if (connector) {
    return;
  }
  connector = createMessageConnector();
  const mobileConfig = {
    initData: {
      form: {
        title: "Content Transfer",
        fields: [{
          label: "Content",
          operations: { onInput }
        }]
      },
    },
    onRegistered: function (next) {
      next();
      onReceiveConnectionCode(connector.buildInputCodeData());
    },
    onRegisterFailed: function (registeredMessage) {
      console.log("failed to register to the WebSocket:" + registeredMessage);
    },
    onSenderConnected,
    onSenderDisconnected,
    // cSpell:disable
    apikey: "k7jc3QcMPKEXGW5UC",
    securityGroup: "1CNbWCFpsbmRQuKdd",
    aes: "dfhrhahfhhfsdhlnnnlkfjlihjc3QcMPKEXGW5UC",
    client: "thisShouldBeUniqueId"
    // cSpell:enable      
    //url:"http://localhost:1337"
  };
  connector.connect(mobileConfig);
};

const uiUtil = {
  createButton: function () {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = 'Connect to Mobile';
    return button;
  },
  createTextArea: function () {
    const textarea = document.createElement('textarea');
    return textarea;
  },
  createQRCodeContainer: function () {
    const qrContainer = document.createElement('div');
    const text = document.createElement('div');
    text.textContent = "Scan with Global Input App";
    qrContainer.appendChild(text);
    return qrContainer;
  }
}

storiesOf('global-input-message', module)

  .add('content', () => {

    const container = document.createElement('div');
    const button = uiUtil.createButton();
    const textarea = uiUtil.createTextArea();
    container.appendChild(button);
    const qrContainer = uiUtil.createQRCodeContainer();

    const onSenderConnected = (sender, senders) => {
      qrContainer.remove();
      container.appendChild(textarea);
    };
    const onSenderDisconnected = (sender, senders) => {
      textarea.remove();
      container.append(qrContainer);
    };



    const onReceiveConnectionCode = connectionCode => {
      button.remove();
      QRCode.toCanvas(connectionCode, function (error, canvas) {
        if (error) throw error;
        qrContainer.appendChild(canvas);
        container.appendChild(qrContainer);
      });
    }
    const onInput = content => {
      textarea.value = content;
    };

    let connected = false;
    button.addEventListener('click', e => startGlobalInput({ onReceiveConnectionCode, onSenderConnected, onSenderDisconnected, onInput }));

    return container;
  }


  );
