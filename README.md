# Global Input Message
<p align="right">
  <a href="https://github.com/global-input/global-input-message/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Global Input Message is released under the MIT license." />
  </a>
</p>

This JavaScript module allows you to introduce a mobile interoperability into JavaScript/TypeScript applications on smart devices like smart TVs, set-top boxes, game consoles, and devices in IoT, so that users can use their mobiles to operate on them. It allows you to define mobile interfaces and receive mobile events from within your device applications, while keeping the mobile app as a general and universal mobile app that works across all types of device applications with different business logic: meaning that there is no need to switch to different mobile app for operating on different devices and no need to develop different mobile apps for different business or device applications. It also allows you to enrich your device applications with a set of mobile functionalities like one-click login, one-click sign-up, mobile encryption, mobile secure storage to name a few. The communication between a mobile app and a device application is secured using end-to-end encryption process that is often initiated through scanning an encrypted QR Code.

This module is particularly useful in the current new normal established by the COVID-19 pandemic, where businesses require visiting customers to communicate accurately with customer representatives while enforcing the rules of wearing masks and social distancing. Thanks to this library, you will be able to establish an instant and secure communication right within the business software you are using, allowing your customers to collaborate effectively, securely and safely. For example, you may provide one-click subscriptions through user mobiles by leveraging the mobile secure storage provided by the mobile app. Alternative, you do not even have to collect users' personal data thanks to the ability to request data on-demand from the mobile app at the point of service, freeing yourself from the pains of privacy regulations. You may also choose to allow your customers to encrypt their own data using their mobiles, giving users full control over the security and privacy of their personal data.

## ⚛️ React Applications
We recommend using [global-input-react][r] for React applications.

## 🔌 Setup

```shell
npm install global-input-message
```

(CDN: https://unpkg.com/global-input-message@2.0.0/distribution/globalinputmessage.js)


## 📚 Usage
```JavaScript
import { createMessageConnector } from  "global-input-message";
const  deviceConnector = createMessageConnector();
```

Then, ```deviceConnector.connect()``` function can be called with a parameter, defining a mobile user interface. For example, the following code displays a login screen on the user's mobile screen when connected to your application:

```JavaScript
const  usernameField = {
  id:  'username',
  label:  'Username',
  operation: { onInput: (value)  =>  setUsername(value) }
};

const  passwordField = {
  id:'password',
  label:  'Password',
  operation:{ onInput: (value)  =>  setPassword(value) }
};

const  loginButton = {
  id:  'login',
  label:  'Sign In',
  type:  'button',
  operation: { onInput: () =>  login(username, password) }
};

const  {connectionCode} = await  deviceConnector.connect( {
  initData: {
    form: {
      title:  'Sign In',
      fields: [usernameField, passwordField, loginButton]
    }
  }
});

```

The ```initData``` contains a ```form``` with a set of fields: ```usernameField```,```passwordField```, and ```loginButton```.

 The ```connectionCode``` data  returned by ```await connector.connect()``` holds an encrypted string value.  When decrypted, it provides information on how to connect to your application, including a one-time-use encryption key for initiating an end-to-end encryption process between your application and a mobile app. The next step is to make the value of ```connectionCode``` available to mobile apps through a QR Code or any other close-range communication technologies like NFC.

  When connected to your application, the mobile app displays a ```form``` specified in ```initData```. Also, when the user interacts with elements in the ```form```, your application can receive mobile events through respective ```onInput()``` functions, being called with the value that the user has entered. In the above example code, you can  implement ```setUsername()``` , ```setPassword()``` and ```login()``` functions to store user entries and calling a authentication mechanism. When your application needs to send send values to the connected mobile app, you can call ```deviceConnector.sendValue()``` function with the first parameter providing the id of the target element and the second parameter providing the value itself:
```JavaScript
const  sendUsername = (username) => {
  deviceConnector.sendValue( usernameField.id, username );
}
const  sendPassword = (password) => {
  deviceConnector.sendValue( usernameField.id, password );
}
```

You can now tie the above two function to the respective input elements being displayed locally on the device:

```JavaScript
Username:
<input  type="text"  value=""  onchange = "sendUsername(this.value)"/>

Password:
<input  type="password"  value=""  onchange = "sendPassword(this.value)"/>
```
Using this approach, you can turn a simple password-based authentication into a one-click mobile authentication or you can implement any other password-less authentication or add an extra security layer without affecting the usability of your application.


When ```deviceConnector.sendInitData()``` function is called with a ```InitData``` parameter, the connected mobile app will switch to the user interface specified:

```JavaScript
const infoField={
  id:"info",
  type:  "info",
  value:  "Test Completed"
};

const  login=(username,password) => {
  deviceConnector.sendInitData( {
     form: {
            title:  "Welcome " +username,
            fields: [infoField]
           }
      });
  }
```

For an element in a ```form```, ```type``` attribute defines how to process/display the data contained in it. For example, if it is set to ```button```, the mobile app display a ```Button```:

```JavaScript
const  loginButton = {
  id:  'login',
  label:  'Sign In',
  type:  'button'
};
```

The default value of the ```type``` attribute is "text". In this case, it display either a text input or a ```textarea```, depending on the value of ```nLines```, which represents how many number of lines is visible:

```JavaScript
const  contentField = {
  id:  'content',
  label:  'Content',
  type:  "text",
  nLines: 5,
  value: "This is a content in the text box"
};
```
If the ```value``` attribute is set, it will be sent along with the form to pre-populate the the field when being displayed on the mobile screen.

## 🔐 Mobile Encryption
If you set the value of ```type``` of element in a ```form``` to ```"encrypt"```, the connected mobile app encrypts the ```value``` of the element and send back the result to your application:

```JavaScript
const  encryptField = {
   id:  'content',
   label:  'Content',
   type:  "encrypt",
   value: contentToEncrypt
};
```

In a similar way, setting ```type``` to ```"decrypt"``` will lead to decryption:

```JavaScript
const  decryptField = {
    id:  'content',
    label:  'Content',
    type:  "decrypt",
    value: contentToDecrypt
};

```

## 🛠 Customizing Form Elements & Styled Values.

The value attribute in an element can also be an object containing some styling information:

```JavaScript
const infoField = {
    id:   "title",
    type: "info",
    value: {
      type: "text",
      content: "This is a Text",
      style: {
        fontSize: 18,
        marginTop: 20,
      }
    }
}
```
You can display a multi-line text using an array for ```content```:

```JavaScript
const informationField = {
   id: "informationText",
   type: "info",
   value: {
      type: "view",
      style: {
                borderColor: "#rgba(72,128,237,0.5)",
                backgroundColor: "#rgba(72,128,237,0.5)",
                borderWidth: 1,
                marginTop: 5,
                minWidth: "100%",
                minHeight: 80,
            },
            content: [{
                type: "text",
                content: title,
                style: {
                    fontSize: 18,
                    color: "white"
                }
            }, {
                type: "text",
                content: message,
                style: {
                  fontSize: 14,
                  color: "white"
                }
            }]
         }
  }

````

Finally, the examples in the [website](https://globalinput.co.uk/), and tests in the [test project](https://github.com/global-input/test-global-input-app-libs) contain more information about various use cases that you can implement in your Typescript/JavaScript applications.


## 📲 On Mobile App Side
 Although you can use [Global Input App](https://globalinput.co.uk/) to operate on your applications, You can certainly use this module to enable your own mobile app to have the ability to operate on various device applications that are powered with this module, assuming your mobile app is  implemented using one of the JavaScript-based frameworks like [React Native](https://reactnative.dev/).

As discussed previously, in order to connect to a device application, your mobile app needs to obtain the value of ```connectionCode``` through scanning a QR Code. Then, you can pass it to the ```connect()``` function to connect to your device application as its second parameter:

```JavaScript
const  mobileConnector = createMessageConnector();
const {initData} = await  mobileConnector.connect( {
   onInput:(inputMessage) => {
     ....
   }
}, connectionCode);
```
In the above code, ```initData``` contains a ```form``` provided by the connected device application, while ```onInput()``` function is called whenever a message is received from the device application.

You can also send messages to the device application, responding to the events generated when the user interacts with form elements:

```JavaScript
const sendUsername = (username) => {
   mobileConnector.sendValue(initData.form.fields[0].id, username);
}
```
There are two input parameters required for calling  ```mobileConnector.sendValue()``` function: the first one identifies the target element that the value is being sent to, while the second parameter holds the value needs to be sent across.

## 👏 How to Contribute
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## 🖼 Examples

- [Browser Extension][b] is the source code of the browser extension application ([chrome][chrome], [Firefox Add-on][f]).

- [Content Transfer Example][content-source] is a  hello-world application. Its [online demo][content-demo] is available.

- [Game Example][content-source] is a simple mobile control application. Its [online demo][content-demo] is available.

- [Video Player Example][video-demo] shows how to achieve second-screen experience in media player applications. Its [online demo][video-demo] is available.

- [Mobile Encryption Example][encryption-source] shows how to use mobile to encrypt and decrypt data. Its [online demo][encryption-demo] is available.

- [Form Data Transfer Example][form-source] shows shows how to transfer form data between applications and a mobile app. It can be used in sign-in and sign-up operations to achieve one-click sign-up or one-click logins. Its online [online demo][form-demo] is available.

- [Send Message Example][message-source] show you can leverage the mobile secure storage to request data on-demand from the connected mobile app. Its online [online demo][message-demo] is available.


## 📄 License

Global Input Message is MIT licensed, as found in the [LICENSE][l] file.

[l]: https://github.com/global-input/global-input-message/blob/master/LICENSE
[g]: https://github.com/global-input
[b]: https://github.com/global-input/browser-extension
[f]: https://addons.mozilla.org/en-GB/firefox/addon/global-input-app/
[r]: https://github.com/global-input/global-input-react
[w]: https://globalinput.co.uk/
[chrome]: https://chrome.google.com/webstore/detail/global-input-app/hcklienddlealndjnakkagefaelhnjkp
[content-source]: https://github.com/global-input/content-transfer-example
[content-demo]: https://globalinput.co.uk/global-input-app/content-transfer
[game-demo]: https://globalinput.co.uk/global-input-app/game-example
[game-source]: https://github.com/global-input/game-control-example.
[video-demo]: https://globalinput.co.uk/global-input-app/video-player
[video-source]: https://github.com/global-input/media-player-control-example
[encryption-demo]: https://globalinput.co.uk/global-input-app/mobile-encryption
[encryption-source]: https://github.com/global-input/mobile-encryption
[form-demo]: https://globalinput.co.uk/global-input-app/form-data-transfer
[form-source]: https://github.com/global-input/transfer-form-data-example
[message-demo]: https://globalinput.co.uk/global-input-app/send-message
[message-source]: https://github.com/global-input/send-message-example
