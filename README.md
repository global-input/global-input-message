# global-input-message
```global-input-message``` is a JavaScript extension for the [Global Input App](https://globalinput.co.uk). It enables applications to allow users to use their mobile to operate securely on the applications running on other devices. It provides applications with mobile input, mobile control, and portable encrypted storage functionalities without the need to develop separate mobile apps. An application can declaratively specify mobile user interfaces and the callback functions to receive mobile input events. The JavaScript extension encapsulates the logic of sending and receiving messages that are secured with the end-to-end encryption so that the application can implement mobile business logic within its context. The extensions enables applications to impelement "Authentication via Mobile", "Second Screen App",  and "Operating on Self-service machines without the need of a keyboard or a touch screen" and much more. For more information, please visit the [Global Input App](https://globalinput.co.uk) website.

### Setup

Install the global-input-message JavaScript library:

```shell
npm install --save global-input-message
```
You also need a QR Code library. Global Input App scans the QR code to obtain the communication parameters that includes the one-time-use encryption key for end-to-end encryption. If you are using the ReactJS, you may use [qrcode.react](https://github.com/zpao/qrcode.react):
```shell
npm install --save qrcode.react
```
Otherwise, you can use [davidshimjs's qrcode](https://github.com/davidshimjs/qrcodejs) or any other QR code javascript library:

 ```shell
 npm install --save davidshimjs-qrcodejs
 ```

###### Plain HTML+JavaScript ####
for vanilla JavaScript, you can place script tag in the HTML page:
```javascript
<script src="https://unpkg.com/global-input-message@1.6.5/distribution/globalinputmessage.min.js">
</script>
<script src="https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs@04f46c6a0708418cb7b96fc563eacae0fbf77674/qrcode.min.js">
</script>

```

### Create Message Connector Object
 ```import/require``` the JavaScript module and create a message connector:

```JavaScript
import {createMessageConnector} from "global-input-message";
var gloalinputconnector=createMessageConnector();
```

or use ```require```:

```JavaScript
var globalInputMessage=require("global-input-message");
var gloalinputconnector=globalInputMessage.createMessageConnector();
```

### Display QR Code
Global Input App needs to scan an encrypted QR code to obtain the necessary information to establish secure communication with the application.

Define a function to obtains the encrypted code data from the extension and render the QR Code:

```javascript
renderQRCode(){
            var codedataToShare=gloalinputconnector.buildInputCodeData();
return (
  <QRCode  value={codedataToShare}
           level="H"
           size={300}/>
    );
}
```

or if you are not using react:


```javascript
var displayQRCode=function(){
        var codedataToShare=gloalinputconnector.buildInputCodeData();
        var qrcode=new QRCode(document.getElementById("qrcode"), {
        text: codedataToShare,
        width: 300,
        height: 300,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });    
};
```

The above code looks for the HTML snippet and place the QR code there:

```html
<div id="qrcode"/>
```

Then, invoke the ```connect()``` method on the ```gloalinputconnector``` object passing a configuration object as its argument.  The following example describes the structure of the configuration object.

### Example

This example allows you to use your mobile to control your JavaScript application. The communication is secured with the end-to-end encryption.

If you scan the QR Code using your [Global Input App](https://globalinput.co.u), a form will be displayed on your mobile screen and it contains a single field called ```Content```. When you type something on it, you can see that the content that you have typed appears in the JavaScript console of your desktop browser. This tells that the content is transferred securely from your Global Input App running on your mobile to the example application.

You can easily extend this to implement actual business logic.

You can test the example explained below on [fiddler](https://jsfiddle.net/dilshat/c5fvyxqa/)

The configuration declaratively defines a text field and a callback function to receive mobile input events:

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
    },
    onRegistered:function(next){
            next();
            displayQRCode();
    }
};
  gloalinputconnector.connect(options);
```
The ```form```  specifies the form on the mobile screen, the ```title``` provides the title of the form. The ```fields``` array contains a single field ```Content```. The ```onInput``` is the callback function for receiving the mobile input events from the mobile app.

The ``` onRegistered()``` function provided in the configuration is invoked when the extension has registered itself to a WebSocket server (https://github.com/global-input/global-input-node).  It is important to invoke the ```displayQRCode()``` function only after the extension has registered itself to a WebSocket server.


### Adding a Button
For adding a button to the form, modify the ```fields``` array in the [configuration](#configuration)  to add the following:
```javascript
    {
        label:"Disconnect",
        type:"button",
        operations:{      
   onInput:function(){
                 gloalinputconnector.disconnect();   
            }
```

### URL of the WebSocket Server & API Key

In the example [configuration](#configuration), the URL of the [Global Input WebSocket Server](https://github.com/global-input/global-input-node) and the API key are not specified. Hence, the ```global-input-message``` JavaScript library uses the default Global Input WebSocket Server farm and its corresponding API key value.  You can download and run your own Global Input WebSocket server from the [Global Input WebSocket Server Github repository](https://github.com/global-input/global-input-node).

After your WebSocket server is up and running, you can modify the [configuration](#configuration_50) to include the URL of your WebSocket Server and the API key value:
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

You may like to display a multi-line Text Field on the Mobile screen, you can  add ```nLines``` attributes to the corresponding configuration item:

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

The ```viewId``` of an element identifies its the parent view that the element belongs to, and the default behaviour of a view is to render its children in a row on the mobile screen. This means if you would like to render a number of UI elements into a row, you can set the value of their ```viewId``` to the same value. You can customise any UI element, including the view that the element belongs to, with ```style``` attributes.  


### Customise a UI element.
You can customise an element with the ```style``` attribute. For example, if you would set the colour of the border of a button to ```green```:
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
