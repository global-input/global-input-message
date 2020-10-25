
This JavaScript module allows you to introduce a mobile interoperability into your JavaScript applications on smart devices like smart TVs, set-top boxes, game consoles, and devices in IoT, so that users can use their mobiles to operate on them. It allows you to define mobile interfaces and receive mobile events from within your device applications, while keeping the mobile app as a general and universal mobile app that works across all types of device applications with different business logic: meaning that there is no need to switch to different mobile app for operating on different devices and no need to develop different mobile apps for different business or device applications. It also allows you to enrich your device applications with a set of mobile functionalities like [mobile encryption](https://globalinput.co.uk/global-input-app/mobile-content-encryption), [mobile authentication](https://globalinput.co.uk/global-input-app/mobile-authentication), [mobile input & control](https://globalinput.co.uk/global-input-app/mobile-input-control), [second screen experience](https://globalinput.co.uk/global-input-app/second-screen-experience), [mobile secure storage](https://globalinput.co.uk/global-input-app/mobile-personal-storage), [mobile encryption & signing](https://globalinput.co.uk/global-input-app/mobile-content-encryption), and [mobile content transfer](https://globalinput.co.uk/global-input-app/mobile-content-transfer). The communication between a mobile app and a device application is often established through scanning an Encrypted QR Code that contains a set of communication parameters that includes one-time-use encryption key for starting an end-to-end encryption process.


This module is particularly useful in the new normal established by the current COVID-19 pandemic, where businesses require visiting customers to communicate accurately with customer representatives while enforcing the rules of wearing masks and social distancing. Thanks to this library, you will be able to establish an instant and secure communication right within your business software, allowing your customers to collaborate effectively, securely and safely. For example, you may provide one-click subscriptions through user mobiles by leveraging the [mobile secure storage](https://globalinput.co.uk/global-input-app/mobile-authentication).   Alternative, you do not even have to collect users' personal data thanks to the ability to request data on-demand from the mobile app at the point of service, freeing yourself from the pains of privacy regulations. You may also choose to allow your customers to encrypt their own data using their mobiles, giving users full control over the security and privacy of their personal data. 

## React Applications
Please use the [React module](https://github.com/global-input/global-input-react) for React applications.

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
Then, you can pass a data object to ```deviceConnector.connect()```, defining a mobile interface that you would like the mobile app present to the user upon connecting to your application. For example, if you would like to display a login screen on the the user's mobile screen upon connection:
```JavaScript
const  usernameField={
	id:  'username',
	label:  'Username',
	operation:{onInput:value => setUsername(value)}
};

const  passwordField={
	id:'password',
	label:  'Password',
	operation:{onInput:value => setPassword(value)}
};

const  loginButton={
	id:  'login',
	label:  'Sign In',
	type:  'button',
	operation:{onInput:() => login(username,password)}
};
const connectionCode = await deviceConnector.connect({
	initData:{
		form:{
		    title:  'Sign In',
	        fields: [usernameField,passwordField,loginButton]
        }       
	}
});
```
In the above code, the ```initData``` parameter holds data describing the mobile user interface. It specifies a ```form``` with a set of fields that are  ```usernameField```,```passwordField```, and ```loginButton```.  

The  ```connectionCode``` variable holds an encrypted string value returned by the ```await connector.connect()``` function. It contains the information on how to connect to your application, including a one-time-use encryption  key for initiating an end-to-end encryption process between your application and the user's mobile app. Your application can display the value of  ```connectionCode```  in the form of a QR Code for uses to scan to connect to it. It is also possible to other close-range communication technologies like NFC for pair the mobile app to your application.

When a mobile app has connected to your application, the connected mobile app presents user with the form that you have defined in the ```initData``` parameter above. When the user interacts with any of the element on the mobile screen, the ```onInput()``` function specified will be called passing the current value that the user has entered.  Then, as you can see in the above code,   the callback functions are calling  ```setUsername()``` , ```setPassword()```  or ```login()``` expecting that you have already implemented them. For example, you may put your authentication logic in the  ```login()``` function. Using this approach, you can turn a simple password-based authentication into a one-click mobile authentication [mobile authentication](https://globalinput.co.uk/global-input-app/mobile-authentication).

When a value is changed locally within your application, you need to send it to the mobile app to keep the remote and local values in sync by calling the ```deviceConnector.sendValue()``` function:
```JavaScript
	const sendUsername=(username)=>{
		deviceConnector.sendValue(username,usernameField.id);
	}
	const sendPassword=(password)=>{
		deviceConnector.sendValue(password,passwordField.id);
	}
```
If the device where your application is running provides a input means, you may bind the functions defined above to the text fields being displayed on your device:

```JavaScript
Username: 
<input type="text" value="" onchange="sendUsername(this.value)"/>
Password: 
<input type="password" value="" onchange="sendPassword(this.value)"/>
```

In order to switch to a different mobile user interface responding to some events, you can can pass a new user interface data to the ```deviceConnector.sendInitData()``` function. For example, the following 
```JavaScript
const login=(username,password)=>{
         deviceConnector.sendInitData(initData:{
			form: {
							title:  "Welcome " +username,
							fields: [{type:  "info", value:  "Test Completed"}]
            }
         }); 
}
```

## On Mobile App Side
Although you can use the [Global Input App](https://globalinput.co.uk/) to operate on your device applications, you may like your own mobile app to have this functionality. In order to achieve this, you can use this JavaScript library suppose your mobile app is implemented using one of the JavaScript-based cross-platform frameworks like [React Native](https://reactnative.dev/).

You may implement  QR Code scanning in your mobile app to obtain the value of the ```connectionCode ``` that was generated on your device application side, then you can pass it to the ```connect()``` function to connect to your device application:
 
```JavaScript
const  mobileConnector=createMessageConnector();
const {initData} = await mobileConnector.connect({
	onInput:(inputMessage)=>{
	   ....
    }
},connectionCode);

```
Then, you may display the form specified in the  ```initData``` that were returned as the result of the execution of   ```await mobileConnector.connect() ```. After that, you can send messages to your device application using the ```mobileConnector.sendValue()```  function, responding to the events generated when the user interacts with the form elements.  For example, the ```onInput()``` function in the ```usernameField``` data in your device application will be called with the passed-in value, when the following code is executed
```JavaScript
mobileConnector.sendValue("my user name", initData.form.fields[0].id);
```
On the other hand, the messages send by your device application will be received by the ```onInput()``` in your mobile app that you have specified in your data  when executing ```await mobileConnector.connect()``` earlier. 

The [Typescript Declaration file](https://github.com/global-input/global-input-message/blob/master/index.d.ts), the  integration tests in the  [test project](https://github.com/global-input/test-global-input-app-libs) and the examples in the [website](https://globalinput.co.uk/) have more information on how to implement those various use cases  in your Typescript applications. 


## More about Form Element

When you go through the previous example, you might have noticed that the ```type``` attribute of a form element defines what component the mobile app uses to process the data contained in it. For example, if it is set to ```button```, the mobile app uses the ```Button``` UI component to process the data:
```JavaScript
const  loginButton={
	id:  'login',
	label:  'Sign In',
	type:  'button'
};
```
As a result, it displays a button on the mobile screen. 

If the ```type``` attribute is missing, it takes its default value, which is "text". In this case, it display either a text field or text box (textarea) depending the values of another attribute, called  ```nLines```, which takes ```1``` as its the default value. The ```nLines``` specifies the number of lines visible in the text field/box.  

For example, when you would like to display a content with a text box with fix visible text rows:

```JavaScript
const  contentField={
    id:  'content',
    label:  'Content',
    type: "text",
    nLines:5    
};
```
You can also send the actual value with the form element to pre-populate the text box:

```JavaScript
const  contentField={
    id:  'content',
    label:  'Content',
    type: "text",
    nLines:5,
    value:"This is a content in the text box"    
};
```

## Mobile Encryption
To instruct the mobile app to encrypt the content and send the result back to your application, simply set the ```type``` attribute of the corresponding element to "encrypt".
```JavaScript
	const contentToEncrypt="...";
	
	const  contentField={
	    id:  'content',
	    label:  'Content',
	    type: "encrypt",
	    value:contentToEncrypt    
	};
```
When you pass this field as part of the ```form``` contained in the ```initData``` , the mobile app prompts the user to encrypt the content specified in the value attribute, and the result will be sent back to your application. You can receive the  content through your ```onInput()``` callback function.
In the similar way, you can send an encrypted content to the mobile app for decryption by setting the type of an element to ```decrypt``` :

```JavaScript
	const contentToDecrypt="...";
	const  contentField={
	    id:  'content',
	    label:  'Content',
	    type: "descrypt",
	    value:contentToDecrypt
	};	
```
When you pass this field as part of the ```form``` contained in the ```initData``` , the mobile app prompts the user to decrypt the content specified in the value attribute, and the result will be sent back to your application. You can receive the  content through your ```onInput()``` callback function.






