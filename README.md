
## global-input-message

This is a [Global Input App](https://globalinput.co.uk) JavaScript library for web and device applications to implement mobile integrations.

The [Global Input App](https://globalinput.co.uk) with its extensions provides a universal mobile integration solution for web and device applications, allowing users to use mobiles to operate on those applications. It provides applications with mobile input, mobile control, and portable encrypted storage functionalities without the need to develop separate mobile apps. Applications can implement mobile integration logic within its application context.


Some of its use cases are:
* [Mobile Authentication](https://globalinput.co.uk/global-input-app/about-mobile-authentication)
* [Mobile Input & Control](https://globalinput.co.uk/global-input-app/about-mobile-control)
* [Second Screen Experience](https://globalinput.co.uk/global-input-app/about-second-screen)
* [Mobile Content Encryption](https://globalinput.co.uk/global-input-app/about-print-scan-qrcodes)




## React Applications

For React applications, please use the [Global Input React](https://github.com/global-input/global-input-react) Component that
you may find even more delightful.


## Setup

The following command installs the ```npm``` module:

```shell
npm install --save global-input-message
```

## Usage

import and create a connector object:



```JavaScript
import {createMessageConnector} from "global-input-message";
var gloalinputconnector=createMessageConnector();
```

or if you use require:

```JavaScript
var globalInputMessage=require("global-input-message");
var gloalinputconnector=globalInputMessage.createMessageConnector();
```

or if you are using manual linking of your JavaScript files:

```JavaScript
<script src="https://unpkg.com/global-input-message@1.6.8/distribution/globalinputmessage.min.js">
</script>
```

Let's say that you would like to display a text field, labelled as ```Content```, on the user's mobile screen after the user has connected to your application by scanning an encrypted QR code:


```JavaScript

 let mobileConfig={        
                          initData:{                              
                              form:{
                                	title:"Content Transfer",   
                                fields:[{
                                  label:"Content",            
                                  operations:{
                                      onInput:value=>setContent(value)
                                  }
                                }]
                              }
                          },
                          onRegistered:function(next){
                                  next();
                                  displayQRCode();
                          }
             };
  gloalinputconnector.connect(mobileConfig);           
```

When scan the Encrypted QR Code using the [Global Input App](https://globalinput.co.uk/), a form titles as "Content Transfer" will be displayed on the mobile screen. The form contains a single field labelled as "Content". If you type on the content field on your mobile, the ```setContent()``` function will be invoked, passing the current ```content``` value. 

The 'displayQRCode' function displays an encrypted QR code that contains a one-time-use encryption key among other communication channel parameters.


If you would like to display a button, labelled as ```Play```, on the user's mobile screen, and you would like to invoke ```play()``` function when the user has pressed the button on his/her mobile. you just need to add the following to the ```fields```
array of the above example:


```JavaScript
  {
        label:"Play",
        type:'button'           
        operations:{onInput:()=>play()}
  }
```


### Sign In Example

Let's say that you would like to display a ```Username``` and a ```Password``` fields, and a ```Sign In``` button, on
the user's mobile screen after the user has connected to your application by scanning an encrypted QR code.
You can achieve the requirement by including the following in your application:

```JavaScript
 let mobileConfig={        
                          initData:{                              
                              form:{
                                	title:"Sign In",
                                  id:"###username###@mycompany.com",  
                                fields:[{
                                  label:"Username",            
                                  operations:{
                                      onInput:username=>setUsername(username)
                                  }
                                },{
                                  label:"Password",            
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

    gloalinputconnector.connect(mobileConfig);           
```

The value of the ```id``` of the form in the above example identifies the form data when the user stores/loads it from/to the encrypted storage on his/her mobile device. The place holder ```###username###``` is used when a user needs to have multiple user accounts on the same application/domain.

This means that users can sign in to your application by pushing stored credentials from the mobile devices to your application. This brings convenience and security by allowing users to set up complicated passwords without the need to remember them, allowing users to sign in securely on shared devices in public view. You can try out the sample code on [JSFiddler](https://jsfiddle.net/dilshat/c5fvyxqa/)


## More Examples
* [Content Transfer Example](https://globalinput.co.uk/global-input-app/content-transfer)
* [Second Screen Application](https://globalinput.co.uk/global-input-app/video-player)
* [Game Control Application](https://globalinput.co.uk/global-input-app/game-example)
* [Mobile Form Automation](https://globalinput.co.uk/global-input-app/send-message)
* [Mobile Form Transfer](https://globalinput.co.uk/global-input-app/form-data-transfer)
* [Mobile Content Encryption](https://globalinput.co.uk/global-input-app/qr-printing)
