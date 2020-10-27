### Global Input Message
This JavaScript module allows you to introduce a mobile interoperability into JavaScript applications on smart devices like smart TVs, set-top boxes, game consoles, and devices in IoT, so that users can use their mobiles to operate on them. It allows you to define mobile interfaces and receive mobile events from within your device applications, while keeping the mobile app as a general and universal mobile app that works across all types of device applications with different business logic: meaning that there is no need to switch to different mobile app for operating on different devices and no need to develop different mobile apps for different business or device applications. It also allows you to enrich your device applications with a set of mobile functionalities like [mobile encryption](https://globalinput.co.uk/global-input-app/mobile-content-encryption), [mobile authentication](https://globalinput.co.uk/global-input-app/mobile-authentication), [mobile input & control](https://globalinput.co.uk/global-input-app/mobile-input-control), [second screen experience](https://globalinput.co.uk/global-input-app/second-screen-experience), [mobile secure storage](https://globalinput.co.uk/global-input-app/mobile-personal-storage), [mobile encryption & signing](https://globalinput.co.uk/global-input-app/mobile-content-encryption), and [mobile content transfer](https://globalinput.co.uk/global-input-app/mobile-content-transfer). The communication between a mobile app and a device application is often established through scanning an Encrypted QR Code that contains a set of communication parameters that includes one-time-use encryption key for starting an end-to-end encryption process.

This module is particularly useful in the current new normal established by the COVID-19 pandemic, where businesses require visiting customers to communicate accurately with customer representatives while enforcing the rules of wearing masks and social distancing. Thanks to this library, you will be able to establish an instant and secure communication right within the business software you are using, allowing your customers to collaborate effectively, securely and safely. For example, you may provide one-click subscriptions through user mobiles by leveraging the [mobile secure storage](https://globalinput.co.uk/global-input-app/mobile-authentication). Alternative, you do not even have to collect users' personal data thanks to the ability to request data on-demand from the mobile app at the point of service, freeing yourself from the pains of privacy regulations. You may also choose to allow your customers to encrypt their own data using their mobiles, giving users full control over the security and privacy of their personal data.

## React Applications
We recommend using the [global-input-react](https://github.com/global-input/global-input-react) for React applications.

## Setup

```shell
  npm install --save global-input-message
```

(CDN: https://unpkg.com/global-input-message@2.0.0/distribution/globalinputmessage.js)

  
## Usage
```JavaScript
  import {createMessageConnector} from  "global-input-message";
  const  deviceConnector=createMessageConnector();
```

Then, you can call the ```deviceConnector.connect()``` function, passing the data, defining a mobile interface that mobile app presents to the user when having connected to your application. For example, when you require a connected mobile app to display a login screen on the the user's mobile screen:

```JavaScript
const  usernameField={
    id:  'username',
    label:  'Username',
    operation:{onInput:value  =>  setUsername(value)}
};

const  passwordField={
    id:'password',
    label:  'Password',
    operation:{onInput:value  =>  setPassword(value)}
};

const  loginButton={
    id:  'login',
    label:  'Sign In',
    type:  'button',
    operation:{onInput:() =>  login(username,password)}
};

const  {connectionCode} = await  deviceConnector.connect({
  initData:{
    form:{
      title:  'Sign In',
      fields: [usernameField,passwordField,loginButton]
    }
  }
});

```

The ```initData``` item holds data describing a mobile user interface, in this case it is a ```form``` with a set of fields that are ```usernameField```,```passwordField```, and ```loginButton```.


The ```connectionCode``` variable holds an encrypted string value returned by the ```await connector.connect()``` expression. It contains the encrypted information on how to connect to your application that contains a one-time-use encryption key for initiating an end-to-end encryption process between your application and the user's mobile app. Your application can display a QR Code using the value of ```connectionCode```. 
  
When a mobile app has connected to your application, the connected mobile app presents the user with the form specified in the ```initData```. And, when the user interacts with any of the elements on the mobile screen, the ```onInput()``` function in the corresponding item will be called passing the current value that the user has entered. In the above example code, the callback functions are calling ```setUsername()``` , ```setPassword()``` or ```login()``` that you need implement. Using this approach, you can turn a simple password-based authentication into a one-click mobile authentication.  

You can also send a value to the connected mobile app by using the ```deviceConnector.sendValue()``` function:

```JavaScript
  const  sendUsername=(username)=>{
      deviceConnector.sendValue(username,usernameField.id);
  }
  const  sendPassword=(password)=>{
       deviceConnector.sendValue(password,passwordField.id);
  }
```
If the device where your application is running provides a mean of input, you may bind the functions defined above to the text fields being displayed on your device, so that local and remote values can be sync on both directions:

```JavaScript
  Username:
  <input  type="text"  value=""  onchange="sendUsername(this.value)"/>
 
  Password:
  <input  type="password"  value=""  onchange="sendPassword(this.value)"/>
```

You may require to switch to a different mobile user interface responding to some events. You can can pass a new user interface data to the ```deviceConnector.sendInitData()``` function:

```JavaScript
  const infoField={
      id:"info",
      type:  "info", 
      value:  "Test Completed"
  };
  
  const  login=(username,password)=>{
      deviceConnector.sendInitData(initData:{
          form: {
            title:  "Welcome " +username,
            fields: [infoField]
           }
      });
  }
```
  
## On Mobile App Side
This module is also used by the mobile app -- for any JavaScript-based cross-platform frameworks like [React Native](https://reactnative.dev/) -- for operating on device applications. Hence, you can include the features of [Global Input App](https://globalinput.co.uk/) into your onw mobile app.

In your mobile app, after obtaining the value of the ```connectionCode ``` by scanning a QR CODE being displayed by your device application, you can pass it to the ```connect()``` function to connect to your device application:

```JavaScript
      const  mobileConnector=createMessageConnector();
      const {initData} = await  mobileConnector.connect({
          onInput:(inputMessage)=>{
          ....
          }
      },connectionCode);
```
The  ```initData``` that were returned as the result of the execution of ```await mobileConnector.connect() ```, contains a user interface specified by the connected device application. 

The ```onInput()``` function is for receiving the messages send by the the device application.

You can send messages to your device application using the ```mobileConnector.sendValue()``` function, responding to the events generated when the user interacts with the form elements:

```JavaScript
  const username="some username";
  mobileConnector.sendValue(initData.form.fields[0].id,username);
```

## More about Form Elements
The ```type``` attribute of a form item defines what component the mobile app uses to process/display the data contained in it. For example, if it is set to ```button```, the mobile app display a ```Button```:

```JavaScript
  const  loginButton={
    id:  'login',
    label:  'Sign In',
    type:  'button'
  };
```

The default value of the ```type``` attribute is "text". In this case, it display either a text field or text box (textarea) depending the values of another attribute ```nLines```, which takes ```1``` as its the default value. The ```nLines``` specifies the number of lines visible in the text field/box:  

```JavaScript
  const  contentField={
      id:  'content',
      label:  'Content',
      type:  "text",
      nLines:5,
      value:"This is a content in the text box"
  };
```
If the ```value``` is set, it will be sent along with it to set its value when it is displayed on the mobile screen.
  

## Mobile Encryption
You can set the value of the ```type``` attribute to "encrypt" to to tell the mobile app to encrypt the content and send the result back to your application, 

```JavaScript

const  contentToEncrypt="...";
const  encryptField={
    id:  'content',
    label:  'Content',
    type:  "encrypt",
    value:contentToEncrypt
};
```

When you pass it as part of the ```fields``` of the ```form``` contained in the ```initData```, the mobile app prompts the user to encrypt the content in the value attribute, and the result will be sent back to your application bt the ```onInput()``` function.

In a similar way, setting the type to ```decrypt``` will results in mobile app to decrypt the content: 

```JavaScript
const  contentToDecrypt="...";
const  decryptField={
    id:  'content',
    label:  'Content',
    type:  "decrypt",
    value:contentToDecrypt
};

```


## Customizing Form Elements & Styled Values.

The value attribute can be an object containing some styling information:

```JavaScript
const infoField={
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
You can display a multi-line text using array as the value of the ````content``` attribute:

The following example demonstrate the flexibility that you can have when you setting the value of a form element for the connected mobile app:

```JavaScript]

const informationField={
        id: "informationText",
        type: "info",
        value:  {
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

Finally, the examples in the [website](https://globalinput.co.uk/), [tests](https://github.com/global-input/global-input-message/blob/master/test/communication-mobile-app-device-app.test.js) including those in the [test project](https://github.com/global-input/test-global-input-app-libs) contain more information on various use cases that you can implement in your Typescript/JavaScript applications. 
