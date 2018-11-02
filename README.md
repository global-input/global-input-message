# global-input-message
```global-input-message``` is a JavaScript extension of the [Global Input App](https://globalinput.co.uk). The extension allows applications to have mobile input, mobile control, mobile encrypted storage functionalities without the need to develop separate mobile apps. An application can declaratively specify mobile user interfaces and the callback functions to receive mobile input events. The JavaScript extension is responsible for sending and receiving messages that are secured with end-to-end encryption, and the application can concentrate on implmenting the mobile business logic within its context.

### Setup

Install the global-input-message JavaScript library:

```shell
npm install --save global-input-message
```
And install its only dependency [socket.io](https://socket.io/):

```shell
npm install --save socket.io-client
```

The application also needs to use a QR Code to display its communication pararameters. Global Input App scans the QR code to obtain the communication parmeters including the encryption key used for end-to-end encryptuon. Hence, you also need to install a QR Code Javascript library. If you are using the ReactJS framework, you may choose to use [qrcode.react](https://github.com/zpao/qrcode.react):
```shell
npm install --save qrcode.react
```
If you are not using the ReactJS framework, you may choose to use [davidshimjs's qrcode](https://github.com/davidshimjs/qrcodejs) or choose any other QR code javascript library available:

 ```shell
 npm install --save davidshimjs-qrcodejs
 ```

###### Plain HTML+JavaScript ####
If you prefer manipulating the plain HTML+JavaScript directly, you can set it up by placing the following script tag in your HTML page:
```javascript
<script src="https://unpkg.com/global-input-message@1.5.3/distribution/globalinputmessage.min.js">
</script>
```
and the JavaScript tag for the qrcode library:
```javascript
<script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/04f46c6a/qrcode.min.js">
</script>
```

### Create Message Connector Object
You can now ```import/require``` the JavaScript module and create a message connector:

```JavaScript
import {createMessageConnector} from "global-input-message";
var gloalinputconnector=createMessageConnector();
```

If you use ```require```:

```JavaScript
var globalInputMessage=require("global-input-message");
var gloalinputconnector=globalInputMessage.createMessageConnector();
```

In the case of [Plain JavaScript+HTML](#plain-htmljavascript), the JavaScript library that you have included in the JavaScript tag provides the ```require``` method itself, so you can still write the following code in your application.

```javascript
    var globalinputmessage=require("global-input-message");
	var gloalinputconnector=globalinputmessage.createMessageConnector();
```
Now the next step is to invoke the ```connect()``` method on the ```gloalinputconnector``` object by passing a configuration object as its argument. It is more straightforward to understand this by an actual example, so I'll explain the rest with an example.

### An Example
This example application is a [receiver application](#receiver-application). When you use a [Global Input App](https://globalinput.co.uk/) to scan the QR code displayed, the Global Input App displays a field on your mobile where you can type content, the content will be sent over to the example application using the end-to-end encryption. The application then prints the content in the JavaScript console. You can build an application on top of this example iteratively to implement more complex logic.

You can test the example explained below on [fiddler](https://jsfiddle.net/dilshat/c5fvyxqa/)

###### Configuration
Create a configuration object, which declaratively defines a text field and its callback function to receive mobile input events:

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
The ```form``` object is for displaying a form in the Global Input App, the ```title``` specifies the title of the form. The ```fields``` array contains a single field called ```Content```. The ```onInput``` is the callback function to receive the mobile input events from the application.

###### Connect
You can now invoke the connector method on the ```connector``` object to connect to the Global Input WebSocket server. You need to pass the [configuration](#configuration) object as its argument:

```javascript
    gloalinputconnector.connect(options);
```
The application now waits for the Global Input App to connect.

The next step for the application is to obtain the code data from the the ```connector``` object:
```javascript
    var codedataToShare=gloalinputconnector.buildInputCodeData();
```
You can now use QR Code to display content of the ```codedataToShare```.

If you are using the ReactJS:

```javascript
  <QRCode  value={codedataToShare}
           level="H"
           size={300}/>
```
This will display a QR code on the screen using the content of the variable ```codedataToShare```.
If are not using the ReactJS, you can specify where to display the QR code in your HTML page:
```html
<div id="qrcode"/>
```
and then you can include the following code in your application:
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

Now the [receiver application](#receiver-application) displays a QR code using the content of the variable ```codedataToShare```.

If you scan the QR Code using your [Global Input App](https://globalinput.co.uk/global-input-app/app), a form will be displayed on your mobile screen and it contains a single field called ```Content```. When you type something on it, you can see the content that you have typed appear in the JavaScript console on your desktop browser. This means that the content is transferred securely from the Global Input App running on your mobile to the example application using end-to-end encryption.

Now you can build your actual application iteratively on top of the example by modifying the [configuration](#configuration) step by step.

### Adding a Button
If you like to display a button on the mobile screen and disconnect the application from the WebSocket Server if the user has pressed on it,  add the following to the ```fields``` array in the [configuration](#configuration):
```javascript
    {
        label:"Login",
        type:"button",
        operations:{                                                    onInput:function(){
                 gloalinputconnector.disconnect();   
            }
```

### URL of the Websocket Server & API Key
In the example [configuration](#configuration), the URL of the [Global Input WebSocket Server](https://github.com/global-input/global-input-node) and the API key are not specified. Hence, the ```global-input-message``` JavaScript library is going to use a shared Global Input WebSocket Server and its corresponding API key value if they are not found in the configuration. The performance of the shared WebSocker Server is not guaranteed, so it is better to download and run your own Global Input WebSocket server from the [Global Input WebSocket Server Github repository](https://github.com/global-input/global-input-node).

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
### Display an Icon button.
Use ```icon``` to specify the icon in a button:
```javascript
    {
        label:"Play",
        icon: play,
        type:"button",
        ...
    }
```

### Grouping elements into a view.

The ```viewId``` of an element identifies its the parent view that the element belongs to, and the default behaviour of an view is to render its children in a row on the mobile screen. This means if you would like to render a number of UI elements into a row, you can set the value of their ```viewId``` to a same value. You can customise any UI element, including the view that the element belongs to, with ```style``` attributes.  


### Customise a UI element.
you can customise an element with the ```style``` attribute. For example, if you would set the colour of the border of a button to ```green```:
```javascript
    {
        label:"Up",
        type:"button",
        style:{
            borderColor:"green",
        },
        ...
    }
```


### More Examples

For more advanced examples, please visit:

[Global Input Website](https://globalinput.co.uk/).

The source code of the Global Input website can be found at:
[https://github.com/global-input/global-input-web](https://github.com/global-input/global-input-web)
