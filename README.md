# global-input-message


The global-input-message is a javascript library that helps your application to display a Global Input QR Code so that your users can use the Global Input mobile app (available both in [iOS](https://itunes.apple.com/us/app/global-input-app/id1269541616?mt=8&ign-mpt=uo%3D4) and [Android](https://itunes.apple.com/us/app/global-input-app/id1269541616?mt=8&ign-mpt=uo%3D4)) to operate on your application.  

One typical use case is that you can allow your users to sign in quicly and securely via their mobile into your application.

If your javascript application is a ReactJS application, you may also have a look at the ReactJS wrapper library in the following URL to make it even simpler.

   [https://github.com/global-input/global-input-react](https://github.com/global-input/global-input-react)


### Setup

##### Set up as a node module and use ```import```/```require``` in your code

Type the following command to install the global-input-message module

```npm install --save global-input-message```

The ```global-input-message``` does not contain the QR code implementation itself, so you need to install one of the QR Code javascript libraries. For example, you can type the following command

 ```npm install --save davidshimjs-qrcodejs```

 to install the [davidshimjs's qrcode module](https://github.com/davidshimjs/qrcodejs)

After above is done, you need to ```import```/```require``` the javascript libraries in your code.

For example, if you use the ES6 transpiler, then you can import the ```createMessageConnector``` function from the package and then call that function to create message connector:

```javascript
	import {createMessageConnector} from "global-input-message";
    var connector=createMessageConnector();
```
If you do not use the ES6 transpier, then you can use ```require``` instead, check [this example](https://jsfiddle.net/dilshat/c5fvyxqa/) for actual example for this.

##### Set up as a browserified JS and include it in the javascript tag

In your HTML code include the qrcode javascript library as well as the ```global-input-message``` javascrypt library:

```javascript
<script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/04f46c6a/qrcode.min.js">
</script>

<script src="https://unpkg.com/global-input-message@1.3.33/lib/global-input-message.min.js">
</script>

```

In the above code, the first line uses the [davidshimjs's qrcode javascript library](https://github.com/davidshimjs/qrcodejs), which you need to display the QR code.

and then you need to create the connector in your javascript code:

```javascript
	var globalinput=require("global-input-message");
    var connector = globalinput.createMessageConnector();
```

### Usage

You can play around with [the full working example here](https://jsfiddle.net/dilshat/c5fvyxqa/). The code is self-explanatory. But before looking at the example, better read through the following explanation about the codes.  

After implement the set up process explained in the Setup section, you just need to call  ```connect()``` method, and get the codedata from the connector.

```
    connector.connect(globalInputConfig);
    var codedata=connector.buildInputCodeData();
```

 The codedata contains the information necessary for the mobile app to connect to your application. For example, it contains the encryption key used for end-to-end encryption and the necessary connection information. This data should be displayed as the content of the QR code, so that the mobile can obtain the ionformation to establish the secure communication to your application.

In the above code, the ```globalInputConfig```  variable is passed in to the connect method. The variable contains the information about the form that you would like to display on the mobile screen. It also contains the callback function that you would like to be invoked when the user interacts with the form. I explain this in details in the next section.

After that, you just need to display the coedata content with the QR code:

```javascript    
      var qrcode = new QRCode(document.getElementById("qrcode"), {
      text: codedata,
      width: 300,
      height: 300,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
```

Above code requires you to define a HTML element with the id ```qrcode```:

```
  <div id="qrcode"></div>
```

That is all you need to do allow your users to operate on your application via their mobile.


### Configuration

As explained above, the ```globalInputConfig```  variable is passed in to the connect method. The variable defines the form that you would like to display on the mobile phone screen. It also contains the callback function that you would like to be invoked when the user interact with the form.

This can be explained very easily with the following requirements that you may have:

* Suppose you would like to display a ```Sign In``` form on the mobile screen.
* You would like the form to contain ```Email Address``` input field,  a ```Password``` input field and a ```Login``` button.
* When a user enters something in the ```Email Address``` field on the mobile screen, you would like your function  ```setUsername(username)``` invoked.
* When a user enters something in the ```Password``` field on the mobile screen, you would like your function called ```setPassword(password)``` invoked with the text entered.
* When a user clicks on the ```Login``` button on the mobile screen, you would like your function ```login()``` invoked, so that you can do the login operation within your ```login()``` function

The following ```globalInputConfig``` variable consts the data that satisfies the above  requirements.

```javascript

var globaInputConfig = {
        initData:{                
               form:{
                      title:"Sign In",
                      fields:[{
                                   label:"Email address",
                                   operations:{
                                       onInput:setUsername
                                   }

                             },{
                                 label:"Password",
                                 type:"secret",
                                 operations:{
                                     onInput:setPassword
                                 }

                             },{
                                 label:"Login",
                                 type:"button",
                                 operations:{
                                 onInput:login
                                }
                             }]
                     }

               }               

 };
```

Click on the the [JS Fiddler](https://jsfiddle.net/dilshat/c5fvyxqa/) link to play around with the above code and see it in action.

Folllwing is the explainartion with line by line:

(1)
```
var globaInputConfig = {
        initData:{                
```
defines the ```globaInputConfig``` variable, it has the ```initData``` object, which contain all the data for initialising the Global Input Mobile app on the other end.

(2)

```
form:{
       title:"Sign In",
```
defines the form that is to be displayed on the mobile screen. Obviously, ```Sign In``` will be displayed on the mobile screen as the title.


(3)
```
fields:[{
```
defines an array containing the form elements.

(4)
```
{
             label:"Email address",
             operations:{
                 onInput:setUsername
             }

}
```
Instructs the mobile app to display a ```text``` field on the mobile screen with the label ```Email Address```. Because the ```type``` is not defined, and the default value of the ```type``` is ```text```, the mobile display the text field.  
The ```operations``` contains  contains all the callback functions. The ```onInput``` callback function will be invoked when user is entering text on the field. In this case, ```setUsername(username)``` will be invoked for each user typing in the ```Email Address``` field. The function ```setUsername(username)``` will passed in with the current value in the ```Email Address``` field.


(5)

```
{
     label:"Password",
     type:"secret",
     operations:{
           onInput:setPassword
     }
 }
```                             
Instructs the mobile app to display a ```secret``` field on the mobile screen with the label ```Password```. The ```type``` defines the types of form field, it can be ```button```, ```secret```, ```range```, ```text```, ```list``` etc. If it is not defined, it take the default value ```text```.

The ```operations``` contains  contains all the callback functions.

The ```onInput``` callback function will be invoked when user is entering text on the field. In this case, ```setPassword(password)``` will be invoked for each user typing in the ```password``` field. The function ```setUPassword(password)``` will passed in with the current value in the ```password``` field.

(6)
```
{
      label:"Login",
      type:"button",
      operations:{
             onInput:login
      }
 }
```                             


Instructs the mobile app to display a ```Login``` button on the mobile screen. The ```type``` defines the types of form field, it can be ```button```, ```secret```, ```range```, ```text```, ```list``` etc.

The ```operations``` contains all the callback functions.

The ```onInput``` callback function will be invoked when user has clicked on the button. In this case, ```login()``` function will be invoked.

With the above addition to your application, your application can display a QR code, so that the Global Input App can scan it to connect to your app and display any form you like and calls back your function on your choice.

The communication between your application and the Global Input app is absolutely secure. An encryption key will be generated for each session and will be part of the QR code to be transferred to the mobile app to establish a secure end-to-end encryption. Nothing between your application and the Global Input App will know what the user is typing. Furthermore, you can control the authentication and authorisation from within your app when the mobile app tries to connect to your mobile.


Please try it out this free library and the free mobile app, and you will see that you can use Global Input app on your mobile to operate on your application. If you like our solution, let us know so we will be encouraged to make it better and exciting without support and encouragement!

You can also find some applications in action in

[https://globalinput.co.uk/](https://globalinput.co.uk/)
