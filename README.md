

## global-input-message

This is a [Global Input App](https://globalinput.co.uk) JavaScript Extension Library (GIA JS Extension) for web and device applications to implement mobile integrations within its application context, eliminating the need for developing separate mobile apps. It enables applications to have:

- [Mobile Authentication](https://globalinput.co.uk/global-input-app/mobile-authentication)
 - [Mobile Input & Control](https://globalinput.co.uk/global-input-app/mobile-input-control)
 - [Second Screen Experience](https://globalinput.co.uk/global-input-app/second-screen-experience)
 - [Mobile Personal Storage](https://globalinput.co.uk/global-input-app/mobile-personal-storage)
 - [Mobile Encryption & Signing](https://globalinput.co.uk/global-input-app/mobile-content-encryption)
 - [Mobile Content Transfer](https://globalinput.co.uk/global-input-app/mobile-content-transfer)


## React Applications

If you are introducing mobile integration to React applications, the [GIA React Extension](https://github.com/global-input/global-input-react), which is a React Wrapper for the Global Input App JavaScript  extension, is much easier to use.

## Setup

### ```npm``` module

```shell
npm install --save global-input-message
```
### CDN
```JavaScript
<script src="https://unpkg.com/global-input-message@1.6.8/distribution/globalinputmessage.min.js">
</script>
```

## Usage

Import and create a connector object:

```JavaScript
import {createMessageConnector} from "global-input-message";
const connector=createMessageConnector();
```

or use require:

```JavaScript
const globalInputMessage=require("global-input-message");
const connector=globalInputMessage.createMessageConnector();
```
Now you can invoke ```connect()```  function on the ```connector``` object,  passing the configurations that specify mobile interfaces and callbacks for processing mobile events.

Let's say that you would like to display a text field ```Content``` on the user's mobile screen after the user has connected to your application by scanning an encrypted QR code. To have this functionality, just add the following code to your application:
```JavaScript
 const mobileConfig={        
   initData:{                              
     form:{
        title:"Content Transfer",   
        fields:[{
          label:"Content",            
          operation:{onInput:c=>setContent(c)}             
         }]
       }
     },
     onRegistered:function(next){
         next();
         displayQRCode();
    }
 };
 connector.connect(mobileConfig);           
```
The GIA extension converts the content of the ```initData``` to a JSON data and sends it to the GIA. The content of the ```form``` describes the form that the GIA should display on the user's mobile screen. Each item in the ```fields```  describes a user interface element in the form. In the above example, there is only one text field element ```Content```, and it specifies the callback function for receiving the content that the user types on the text field.

The ```onRegistered``` is a callback function, which is called when the GIA JS extension has successfully connected to a [WebSocket Server node](https://github.com/global-input/global-input-node).   The correct URL of the WebSocket server node can only be obtained in this function because of how [the GIA WebSocket Load Balancing Mechanism](https://github.com/global-input/global-input-node) works: each GIA WebSocket session starts with a REST API call on the load balancer to obtain the URL of an available WebSocket Server node, so that the subsequent long-running WebSocket connection can skip the load balancer, significantly increasing the scalability of the GIA WebSocket server farm.  Hence, in the  ```onRegistered()``` function, the application calls the ```connector.buildInputCodeData()```  to obtain the encrypted connection information and use it as the content of the QR Code.

The Encrypted QR Code contains information on how to connect to the device application via the WebSocket server, for example, the URL of the WebSocket node and the API key value that is required for connecting to the WebSocket server, an encryption key for establishing end-to-end encrypted communication, the session id and securityGroup that are required for locating and validating the incoming messages reaching the device application.

### Sign In Example
Another example is to display a Sign In form on the connected mobile. The form comprises of a  ```Username``` text field, a ```Password``` text field, and a ```Sign In``` button:
```JavaScript
 const mobileConfig={        
   initData:{                              
     form:{
        title:"Sign In",
        id:"###username###@mycompany.com",
        fields:[{
           label:"Username",
           id:"username",
           operations:{
            onInput:username=>setUsername(username)
           }
       },{
          label:"Password",            
          id:"password",
          operations:{
            onInput:password=>setPassword(password)
          }
       },{
         label:"Sign In",
         type:"button",            
         operations:{
            onInput:()=>signIn()
          }
       }]
     }
   },
   onRegistered:function(next){
         next();
         displayQRCode();
   }
 };
    connector.connect(mobileConfig);           
```
You can try out the sample code above on [JSFiddler](https://jsfiddle.net/dilshat/c5fvyxqa/)

One of the important features that the GIA provides is that users can take advantage of the [mobile personal storage](https://globalinput.co.uk/global-input-app/mobile-personal-storage) to automate the sign in process. The value of the ```id``` of the form plays the role of the identifier for identifying the form data when the user chooses to store it to the [mobile personal storage](https://globalinput.co.uk/global-input-app/mobile-personal-storage) on his/her mobile device. The place holder ```###username###``` distinguishes multiple user accounts from each other on the same application/domain. If one user can have only one account on the domain/application, no need to include the place holder in the id of the form.

The [GIA Mobile Authention](https://globalinput.co.uk/global-input-app/mobile-authentication) allows users to convert a password-based authentication to a password-less authentication by pushing the stored credentials from the [Mobile Personal Storage](https://globalinput.co.uk/global-input-app/mobile-personal-storage) to the connected application. This brings convenience and security to users because the users can set up completely random passwords without the need for remembering them, and can sign in securely on shared devices in public view, without worrying about revealing passwords to prying eyes, video cameras and keyboard tracking devices.

## More Examples
* [Content Transfer Example](https://globalinput.co.uk/global-input-app/content-transfer)
* [Second Screen Application](https://globalinput.co.uk/global-input-app/video-player)
* [Game Control Application](https://globalinput.co.uk/global-input-app/game-example)
* [Mobile Form Automation](https://globalinput.co.uk/global-input-app/send-message)
* [Mobile Form Transfer](https://globalinput.co.uk/global-input-app/form-data-transfer)
* [Mobile Content Encryption](https://globalinput.co.uk/global-input-app/qr-printing)
