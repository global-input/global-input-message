# global-input-message
```global-input-message``` is a JavaScript library for transfering data between applications using the end-to-end encryption via the [Global Input WebSocket server](https://github.com/global-input/global-input-node). The WebSocket server is available at
    [https://github.com/global-input/global-input-node](https://github.com/global-input/global-input-node)

A WebSocket client application can pass unencrypted messsages to the global-input-message JavaScript library, without worrying about the encryption and delivering of the messages. The global-input-message JavaScript library encrypts the message content with the end-to-end encryption and forwards them over to the destination. On the receiving end, the WebSocket client appplication registers a callback function to the [global-input-message] JavaScript library to receive the decrypted messages. The JavaScript library is responsible for receiving encrypted messages, decrypting them and forwarding the decrypted messages to the registered callback function.

### How It Works
The end-to-end encryption and the message trasnsporting logic are implemented transparently inside the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library and the [WebSocket server](https://github.com/global-input/global-input-node).  This enables the WebSocket client applications concentrate on the business logic.

###### Receiver Application
A ```global-input-message``` application is a ```reiceiver application``` if it connects to the WebSocket server and waits for connection from another application.

###### Calling Application
A ```global-input-message``` application is a ```calling application``` if it requests to connet to the ```Receiver application````.

###### QR Code
A ```receiver application``` uses QR Code to pre-share the necessary information with the ```calling application``` to let the ```calling application``` to find the ```Receiver``` application and establish the communication using the end-to-end encryption.

The QR code contains the following information:
(1) The ```url``` value of the WebSocket server that the ```receiver application``` has connected.
(2) The  ```apikey``` value required by the WebSocket server.
(3) A ```session``` value that uniquely identifies the ```receiver application``` on the WebSocket server.
(4) The encryption key that should be used to encrypt and decrypt the message content.

A new encryption key is generated inside the ```receiver application``` for each session and shared with the ```calling application``` via the QR code only. Hence, the the encryption key is transferred to the ```calling client``` directly without involving network connection. This is important because the WebSocket server should never be able to decrypt the content of the encrypted messages, and only the applications involved in the communication should be able to decrypt the content of the messages. So, even if the WebSocket server is hacked, the messages between the applications will be safe.

### Setup

Install the global-input-message JavaScript library:

```shell
npm install --save global-input-message
```
And install the [socket.io](https://socket.io/) dependency:

```shell
npm install --save socket.io-client
```

The [receiver application](#receiver-application) uses QR codes to share the [the required information](#qr-code) with the [calling application](#calling-application). Hence, you also need to install a QR Code Javascript library. If you are using the ReactJS framework, you may choose to use [qrcode.react](https://github.com/zpao/qrcode.react):
```shell
npm install --save qrcode.react
```
If you are not using the ReactJS framework, you may choose to use [davidshimjs's qrcode](https://github.com/davidshimjs/qrcodejs) or choose any QR code javascript library available:

 ```shell
 npm install --save davidshimjs-qrcodejs
 ```

###### Plain HTML+JavaScript ####
If you prefer manipulating the plain HTML+JavaScript directly, you can set it up by placing the following script tag in your HTML page:
```javascript
<script src="https://unpkg.com/global-input-message@1.5.1/distribution/globalinputmessage.min.js">
</script>
```
and the JavaScript tag for the qrcode library:
```javascript
<script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/04f46c6a/qrcode.min.js">
</script>
```

### Import/Require in Your Code
You can now ```import/require``` the JavaScript module in your code:
```JavaScript
import {createMessageConnector} from "global-input-message";
```
If you use ```require```:

```JavaScript
var globalInputMessage=require("global-input-message");
var createMessageConnector=globalInputMessage.createMessageConnector;
```

In the case of [Plain JavaScript+HTML](#plain-htmljavascript), you can use:

```javascript
var createMessageConnector=require("global-input-message");
var createMessageConnector=globalinputmessage.createMessageConnector();
```
Now the next step is to create a connector and pass the configuration object to the connect object by invoking the ```connect``` method on the connector object. It is more straightforward to understand by an example, so I explain the rest with an example.

### An Example
This example application is a [receiver application](#receiver-application). When you use a [Global Input App](https://globalinput.co.uk/) to scan the QR code displayed, the Global Input App displays a field on your mobile where you can type content, the content will be sent over to the example application using the end-to-end encryption. The application then prints the content in the JavaScript console. It is better to build an application on top of this example iteratively to implement any complex logic.

You can test the example on [fiddler](https://jsfiddle.net/dilshat/c5fvyxqa/)

###### Configuration
First, you need to define a configuration object, which defines a single field to receive messages from the Global Input App:
```javascript
var options={
    initData:{
    form:{                                       
        title:"Type Something in the following field:",        
        fields:[{
            label:"Content",
            operations:{
                onInput:function(content){
                        console.log("Content received:"+content);
                        }
                }
        }]
      }
    }
};
```
The ```form``` object display a form in the Global Input App, the ```title``` specifies the title of the form. The ```fields``` array contains a single field called ```Content```. When a user types on the field, the ```onInput``` callback function will be called with the current content in the field.

###### Connect
You can now create a connector and then connect to the WebSocket server by passing the configuration object.
```javascript
    var gloalinputconnector=createMessageConnector();
    gloalinputconnector.connect(options);
```
The application now waits for the [calling application](#calling-application) to connect.

The ```codedata``` content, which needs to be shared with the [calling application](#calling-application), can be obtained from the ```connector``` object:
```javascript
    var codedataToShare=gloalinputconnector.buildInputCodeData();
```
You can now use QR Code to display content of the ```codedataToShare```. If you are using the ReactJS:

```javascript
  <QRCode  value={codedataToShare}
           level="H"
           size={300}/>
```
If do not use the ReactJS, you can specify where to display the QR code in your HTML page:
```html
<div id="qrcode"/>
```
and then, in your script:
```javascript
var qrcode=new QRCode(document.getElementById("qrcode"), {
      text: codedataToShare,
      width: 300,
      height: 300,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
```

Now the [receiver application](#receiver-application) displays a QR code. Please scan it with the Global Input App [https://globalinput.co.uk/](https://globalinput.co.uk/). The Global Input App will display a field on your mobile screen. When you type something on it, you can see the content that you have typed appear in the JavaScript console on your desktop browser. This means that the content is transferred securely from the Global Input App running on your mobile to your application using the end-to-end encryption.

Now you can build your application iteratively on top the example by modifying the [configuration](#configuration) step by step.

### Adding a Button
If you like to display a button on the mobile and disconnect the application from the WebSocket Server if the user has pressed on it. Add the following to the ```fields``` array in the [configuration](#configuration_50):
```javascript
    {
        label:"Login",
        type:"button",
        operations:{                                                    onInput:function(){
                 gloalinputconnector.disconnect();   
            }
```

### URL of the Websocket Server & API Key
In the example [configuration](#configuration), the URL of the WebSocket Server and the API key values are not specified. Hence, as the default, the ```global-input-message``` JavaScript library is going to use a shared WebSocket Server and its corresponding API key value. If you do so, the performance of the WebSocker Server is not guaranteed. So it is better to run your own WebSocket server by downloading from the [WebSocket Server Github repository](https://github.com/global-input/global-input-node).

After your WebSocket server is up and running, you can modify the [configuration](#configuration_50) to include the URL of your Websocket Server and the API key value:
```javascript
var options={
    url:"URL of your WebSocket server",
    apikey:"API key value required by your WebSocket server",
     initData:{
           ...
        }
    };
```

### Multi-line Text Field

If you would like to display a multi-line Text Field on the Mobile screen, you can just add ```nLines``` attributes to the corresponding configuration item:

```javascript
           {
                    label:"Content",
                    nLines:5,
                    operations:{
                        onInput:function(content){
                            console.log("Content received:"+content);
                        }
                   }
            }
```

### More Advanced Examples
You can declartively define a complex UI elements on the mobile screen. For example you can compose a Video Player Controller to allow users to control the video from the mobile, or you can compose a game pad on the mobile screen and reiceve the events from your application.  For more advanced example, please visit:

[Global Input Website](https://globalinput.co.uk/).

The source code the above website is available at:
[https://github.com/global-input/global-input-web](https://github.com/global-input/global-input-web)
