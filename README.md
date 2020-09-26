

## global-input-message

This JavaScript library allows you to [introduce mobile app interoperability](https://globalinput.co.uk/) into your device and web applications, so you users can user their mobiles to operate on your applications and enjoy many mobile related features like [Mobile Encryption ](https://globalinput.co.uk/global-input-app/mobile-content-encryption), [Mobile Authentication ](https://globalinput.co.uk/global-input-app/mobile-authentication), [Mobile Content Transfer ](https://globalinput.co.uk/global-input-app/mobile-content-transfer), [Mobile Input & Control ](https://globalinput.co.uk/global-input-app/mobile-input-control), [Second Screen Experience](https://globalinput.co.uk/global-input-app/second-screen-experience) and [Mobile Personal Storage](https://globalinput.co.uk/global-input-app/mobile-personal-storage). 

 

## ReactJS or React Native Applications

If you have React applications, you may use the [React extension library](https://github.com/global-input/global-input-react), which is much more intuitive to use.

## Setup

### ```npm``` module

```shell
npm install --save global-input-message
```
### CDN
```JavaScript
<script src="https://unpkg.com/global-input-message@1.8.5/distribution/globalinputmessage.js">
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
Next invoke the  ```connect()```  function on the ```connector```, passing the configuration that specifies the mobile user interface elements and the callbacks for receiving the events. It is straightforward to understand The following example is 
```JavaScript
 const mobileConfig={
   initData:{                              
     form:{
        title:"Content Transfer",   
        fields:[{
          label:"Content",            
          operation:{onInput:setContent}             
         }]
       }
     },
     ...
 };
 connector.connect(mobileConfig);           
```
The following configuration specifies a login form:
```JavaScript
 const mobileConfig={        
   initData:{                              
     form:{
        title:"Sign In",
        id:"###username###@myCompany.com",
        fields:[{
           label:"Username",
           id:"username",
           operations:{
            onInput:setUsername
           }
       },{
          label:"Password",            
          id:"password",
          operations:{
            onInput:setPassword
          }
       },{
         label:"Sign In",
         type:"button",            
         operations:{
            onInput:signIn
          }
       }]
     }
   },
   ...
 };
    connector.connect(mobileConfig);           
```
You can try out the sample code above on [JSFiddler](https://jsfiddle.net/dilshat/c5fvyxqa/)


## TypeScript
Typescript type definitions are bundled with the module.
