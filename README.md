# global-input-message
```global-input-message``` is a JavaScript library for transfering the encypted data via the [Global Input WebSocket server](https://github.com/global-input/global-input-node).

A WebSocket client application can pass unencrypted messsages to the global-input-message JavaScript library, without worrying about the encryption and delivering of the messages. The global-input-message JavaScript library encrypts the message content with the end-to-end encryption and forwards them over to the destination. On the receiving end, the WebSocket client appplication registers a callback function to the [global-input-message] JavaScript library to receive the decrypted messages. The JavaScript library is responsible for receiving encrypted messages, decrypting them and forwarding the decrypted messages to the registered callback function. The end-to-end encryption details and the message routing logic is transparently implemented inside the JavaScript library.

### Setup

Install the global-input-message npm module:
```shell
npm install --save global-input-message
```
Install the [socket.io](https://socket.io/) dependency:

```shell
npm install --save socket.io-client
```

The Websocket applications may need to use the QR codes to pre-share the necessary information including the
encryption key, which is needed for the end-to-end encryption. For this, you may also need to install a QR Code Javascript module. if you are using reactjs framework, you may choose to use [qrcode.react](https://github.com/zpao/qrcode.react):
```shell
npm install --save qrcode.react
```
If you are not using the ReactJS framework, you may use [davidshimjs's qrcode module](https://github.com/davidshimjs/qrcodejs):

 ```shell
 npm install --save davidshimjs-qrcodejs
 ```

 and then you can  ```import```/```require``` the javascript libraries in your code:
 ```javascript
	import {createMessageConnector} from "global-input-message";
```
###### Native JavaScript+HTML method
If you prefer to use the native JavaScript+HTML method without using any transpilers, dependency or development tools, you can set it up by placing  the following scrip tags in your HTML page:
```javascript
<script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/04f46c6a/qrcode.min.js">
</script>

<script src="https://unpkg.com/global-input-message@1.4.7/lib/globalinputmessage.min.js">
</script>
```
The JavaScript 'globalinputmessage.min.js' expose a 'require' method, you can use it to obtain the reference to the module contained in it:
```javascript
var globalinputmessage=require("global-input-message");
var gloalinputconnector=globalinputmessage.createMessageConnector();
```
### Hello World Example
The following defines a form field to receive messages from another device (i.e., mobile), when a user type in the field, the javascript console in the computer will display the content received.

###### configuration
```javascript
var options={
     initData:{
            form:{                                       
                title:"Type Something in the following field:",        
                fields:[{
                    label:"Content",
                    operations:{onInput:function(content){console.log("Content received:"+content);}}
                }]
             }
        }
    };
```
After including above code spippet in your code, you can now create a connector and the connect to the Global Input WebSocket server by passing the configuration listed above. The coedata, which needs to be pre-shared with the other WebSocket client, can be obtained by calling the ```buildInputCodeData()``` on the connector object:
```javascript
    var gloalinputconnector=createMessageConnector();
    gloalinputconnector.connect(options);
    var codedataToShare=gloalinputconnector.buildInputCodeData();
```

You can share the content of the ```codedataToShare``` via the QR code. If you are using the ReactJS, you can use the following code to display the QR code:

```javascript
  <QRCode  value={codedataToShare}
           level="H"
           size={300}/>
```
If prefere to use [Native JavaScript+HTML method](#Native_JavaScriptHTML_method_30), specify where you would like to display the QR code in your HTML page:
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

Now your application will display a QR code. If you scan it with the Global Input App [https://globalinput.co.uk/](https://globalinput.co.uk/), the app will display a field on your mobile screen. When you type something on it, you can see the content that you have typed appear in the console. This means that the content is transferred securely from the Global Input App running on your mobile to your application using the end-to-end encryption.

Now you can build on top the above example iteratively towards to your goal by modifying the [configuration](#configuration_50) step by step.

### Adding a Button
For example, if you may like to display a button on the mobile and disconnect from the WebSocket Server if the user has pressed on it. Add the following to the ```fields``` array in the [configuration](#configuration_50):
```javascript
    {
        label:"Login",
        type:"button",
        operations:{                                                    onInput:function(){
                 gloalinputconnector.disconnect();   
            }
```
### URL to the Websocket Server & API Key
In the above example, the URL to the WebSocket Server and the API key value are not provided. Hence, as the default, the ```global-input-message``` JavaScript library is going to use a shared WebSocket Server and its corresponding API key value. If you do so, the performance of the WebSocker Server is not gurantaed. So it is better to run your own WebSocket server by downloading from the [WebSocket Server Github repository](https://github.com/global-input/global-input-node).

After your WebSocket server is up and running, you can modify the [configuration](#configuration_50) to include the URL to your Websocket Server and the API key value:
```javascript
var options={
    url:"URL to your WebSocket server",
    apikey:"API key value required by your WebSocket server",
     initData:{
            form:{                                       
                title:"Type Something in the following field:",        
                fields:[{
                    label:"Content",
                    operations:{onInput:function(content){console.log("Content received:"+content);}}
                }]
             }
        }
    };
```

### Multi-line Text Field

If you would like to display a multi-line Text Field on the Mobile screen, you can just add ```nLines``` attributes to the corresponding configuration item:


```javascript
var options={
    url:"URL to your WebSocket server",
    apikey:"API key value required by your WebSocket server",
     initData:{
            form:{                                       
                title:"Type Something in the following field:",        
                fields:[{
                    label:"Content",
                    nLines:5,
                    operations:{onInput:function(content){console.log("Content received:"+content);}}
                }]
             }
        }
    };
```

### More Advanced Examples
You can declartively define a complex UI elements on the mobile screen. For example you can compose a Video Player Controller to allow users to control the video from the mobile etc.  For more advanced example, please visit:

[Global Input Website](https://globalinput.co.uk/).

The source code the above website is available at:
[https://github.com/global-input/global-input-web](https://github.com/global-input/global-input-web)
