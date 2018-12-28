# global-input-message
```global-input-message``` is a JavaScript extension of the [Global Input App](https://globalinput.co.uk). By including this extension in your JavaScript application, you can allow your users to use their mobile to operate securely on your JavaScript applications running on other devices. Your applications will have mobile input, mobile control, portable encrypted storage functionalities without the need to develop separate mobile apps. Your application can declaratively specify mobile user interfaces and the callback functions to receive mobile input events. The JavaScript extension is responsible for sending and receiving messages that are secured with the end-to-end encryption, and your application can concentrate on implementing the mobile business logic within its context.

### Setup

Install the global-input-message JavaScript library:

```shell
npm install --save global-input-message
```

The application also needs to use a QR Code to display its communication parameters. Global Input App scans the QR code to obtain the communication parameters including the encryption key used for end-to-end encryption. Hence, you also need to install a QR Code Javascript library. If you are using the ReactJS framework, you may choose to use [qrcode.react](https://github.com/zpao/qrcode.react):
```shell
npm install --save qrcode.react
```
If you are not using the ReactJS framework, you may choose to use [davidshimjs's qrcode](https://github.com/davidshimjs/qrcodejs) or choose any other QR code javascript library available:

 ```shell
 npm install --save davidshimjs-qrcodejs
 ```

###### Plain HTML+JavaScript ####
If you prefer the plain HTML+JavaScript, you can place the following script tag in your HTML page:
```javascript
<script src="https://unpkg.com/global-input-message@1.6.1/distribution/globalinputmessage.min.js">
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

Now the next step is to invoke the ```connect()``` method on the ```gloalinputconnector``` object passing a configuration object as its argument. It is more straightforward to understand this by an actual example.

### An Example
This example allows you to use your Global Input App running on your mobile to control your JavaScript application. The communication is secured with the end-to-end encryption. When you scan the QR code with the [Global Input App](https://globalinput.co.uk/), a form appears on your mobile screen.  As you type content on the field on your mobile, the content will be sent over to the example application. The application then prints the content in the JavaScript console. You can build an application on top of this example to implement your actual business logic.

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
    },
    onRegistered:function(next){
            next();
            displayQRCode();
    }
};
```
The ```form``` object is for displaying a form in the Global Input App, the ```title``` specifies the title of the form. The ```fields``` array contains a single field called ```Content```. The ```onInput``` is the callback function to receive the mobile input events from the mobile app.

###### Connect
You can now invoke the connector method on the ```connector``` object to connect to the Global Input WebSocket server. You need to pass the [configuration](#configuration) object as its argument:

```javascript
    gloalinputconnector.connect(options);
```
The application now waits for the Global Input App to connect.

When the connection is successful, the ``` onRegistered()``` function specified in the configuration will be called. There you can obtain the code data from the  ```connector``` object, and use it to display the QR code:
```javascript
    displayQRCode(){    
            var codedataToShare=gloalinputconnector.buildInputCodeData();
           ```javascript
displayQRCode(){    
            var codedataToShare=gloalinputconnector.buildInputCodeData();      
    var qrcode=new QRCode(document.getElementById("qrcode"), {
          text: codedataToShare,
            width: 300,
          height: 300,
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.H
    });
 }
```
The above code looks for the HTML snippet and place the QR code there:
```html
<div id="qrcode"/>
```
If you are using the ReactJS:

```javascript
  ...
            var codedataToShare=gloalinputconnector.buildInputCodeData();
return (
  <QRCode  value={codedataToShare}
           level="H"
           size={300}/>
    );
 ```

If you scan the QR Code using your [Global Input App](https://globalinput.co.uk/global-input-app/app), a form will be displayed on your mobile screen and it contains a single field called ```Content```. When you type something on it, you can see the content that you have typed appear in the JavaScript console on your desktop browser. This means that the content is transferred securely from the Global Input App running on your mobile to the example application.

Now you can build your actual application on top of the example by modifying the [configuration](#configuration) step by step.

### Obtaining the QR code via buildInputCodeData()

In order to obtain the value used for QR code correctly, you should invoke the ```buildInputCodeData()``` method after the connection is successful:
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
var options={
    onRegistered:function(next){
            next();
            displayQRCode();            
    },
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
gloalinputconnector.connect(options);

```
In the code above, the ```onRegistered()``` function will be invoked when the extension code has registered itself to the WebSocket server successfully. You can write the code inside this function to obtain the QR code data and display it on the page.

### Adding a Button
You may like to display a button on the mobile screen and disconnect the application from the WebSocket Server when the user has pressed on it. To achieve  this, modify the ```fields``` array in the [configuration](#configuration) to add the following:
```javascript
    {
        label:"Login",
        type:"button",
        operations:{                                                    onInput:function(){
                 gloalinputconnector.disconnect();   
            }
```

### URL of the WebSocket Server & API Key
In the example [configuration](#configuration), the URL of the [Global Input WebSocket Server](https://github.com/global-input/global-input-node) and the API key are not specified. In this case, the ```global-input-message``` JavaScript library uses the default Global Input WebSocket Server farm and its corresponding API key value.  You can download and run your own Global Input WebSocket server from the [Global Input WebSocket Server Github repository](https://github.com/global-input/global-input-node).

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

The source code of the Global Input website is available:
[https://github.com/global-input/global-input-web](https://github.com/global-input/global-input-web)
