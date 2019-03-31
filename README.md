
A [Global Input App](https://globalinput.co.uk) JavaScript library for web applications to implement mobile integrations.

The [Global Input App](https://globalinput.co.uk) with its extensions provides a universal mobile integration solution for web and device applications, allowing users to use mobiles to operate on those applications. It provides applications with mobile input, mobile control, and portable encrypted storage functionalities without the need to develop separate mobile apps. Applications can implement mobile integration logic within its application context.

Some of its use cases:
* [Mobile Authentication](https://globalinput.co.uk/global-input-app/about-mobile-authentication)
* [Mobile Input & Control](https://globalinput.co.uk/global-input-app/about-mobile-control)
* [Second Screen Experience](https://globalinput.co.uk/global-input-app/about-second-screen)
* [Mobile Content Encryption](https://globalinput.co.uk/global-input-app/about-print-scan-qrcodes)




### React Application

For React application, please use the [Global Input React](https://github.com/global-input/global-input-react) Component that
you may find much more straightforward to use.


### Setup

Install the global-input-message JavaScript library:

```shell
npm install --save global-input-message
```

### Usage

import and create the connector object:



```JavaScript
import {createMessageConnector} from "global-input-message";
var gloalinputconnector=createMessageConnector();
```

or if you use require:

```JavaScript
var globalInputMessage=require("global-input-message");
var gloalinputconnector=globalInputMessage.createMessageConnector();
```

or if go for manual insertion into the HTML page:

```JavaScript
<script src="https://unpkg.com/global-input-message@1.6.6/distribution/globalinputmessage.min.js">
</script>
```

Let's say that you would like to display a text field, labelled with ```Content```, on the user's mobile screen after the user has connected to your application by scanning the encrypted QR code. And you would like to receive the typed content via ```setContent(content)``` function when the user is typing on his/her mobile. You can achieve your goal just by the following code:


```JavaScript

 let mobileConfig={        
                          initData:{                              
                              form:{
                                	title:"Content Transfer",   
                                fields:[{
                                  label:"Content",            
                                  operations:{
                                      onInput:value=>setContent(value);
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

You can see it in action in the [live demo](https://globalinput.co.uk/global-input-app/content-transfer), or you can download the source code from [GitHub repository](https://github.com/global-input/content-transfer-example).

Let's say you have another application that you would like to allow users to use mobiles to invoke its ```play()``` function. You can put the following into the render function of your component:


```JavaScript
const [content, setContent]=useState("");  
 let mobileConfig={        
                          initData:{                              
                              form:{
                                	title:"Play",   
                                fields:[{
                                  label:"Play",
                                  type:"button",            
                                  operations:{
                                      onInput:()=>play();
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

If you have a Sign In Component that uses password authentication, and you would like your users to use mobiles to sign in speedily. You just need to include the following in the render function of your component:

```JavaScript
 let mobileConfig={        
                          initData:{                              
                              form:{
                                	title:"Sign In",
                                  id:"###username###@mycompany.com",  
                                fields:[{
                                  label:"Username",            
                                  operations:{
                                      onInput:username=>setUsername(username);
                                  }
                                },{
                                  label:"Password",            
                                  operations:{
                                      onInput:password=>setPassword(password);
                                  }
                                },{
                                  label:"Sign In",
                                  type:"button",            
                                  operations:{
                                      onInput:()=>signIn(username,password);
                                  }
                                }]
                              }
                          },
             };

    gloalinputconnector.connect(mobileConfig);           
```

In the above example, you can replace the ```this.signIn()``` with whatever function that you have implemented to accept username and password to validate user credential.

The value of the ```id``` of the form in the above example identifies the form data when the user stores/loads it from/to the encrypted storage on his/her mobile device. using place holder ```###username###``` allows to store multiple accounts on the same domain.

### More Examples
* [Content Transfer Example](https://globalinput.co.uk/global-input-app/content-transfer)
* [Second Screen Application](https://globalinput.co.uk/global-input-app/video-player)
* [Game Control Application](https://globalinput.co.uk/global-input-app/game-example)
* [Mobile Form Automation](https://globalinput.co.uk/global-input-app/send-message)
* [Mobile Form Transfer](https://globalinput.co.uk/global-input-app/form-data-transfer)
* [Mobile Content Encryption](https://globalinput.co.uk/global-input-app/qr-printing)


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
