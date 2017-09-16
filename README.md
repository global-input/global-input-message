# global-input-message


The global-input-message library enables your JavaScript application to display a Global Input QR Code so that your users can connect their Global Input mobile app (available in [iOS](https://itunes.apple.com/us/app/global-input-app/id1269541616?mt=8&ign-mpt=uo%3D4) and [Android](https://itunes.apple.com/us/app/global-input-app/id1269541616?mt=8&ign-mpt=uo%3D4)) to your application just by poing the phone camera to the QR code displayed. Your users can operate securely on your application via their mobile. For example you can allow your users to sign in via their mobile and much more!

If your javascript application is developed with React JS framework, please have a look at

   [https://github.com/global-input/global-input-react](https://github.com/global-input/global-input-react)


### Setup

#### as node module & ES6

 ```npm install --save global-input-message```

 Also need to import a qrcode module to display qrcode:

 ```npm install --save global-input-message```

 above command installs the [davidshimjs's qrcode module](https://github.com/davidshimjs/qrcodejs)

and then  import the ```createMessageConnector``` function from the package and then call that function to create connector:

```javascript
	import {createMessageConnector} from "global-input-message";
    var connector=createMessageConnector();
```

#### As browserified & pure javascript

If you HTML:

```javascript
<script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/04f46c6a/qrcode.min.js">
</script>

<script src="https://unpkg.com/global-input-message@1.3.31/lib/global-input-message.js">
</script>
```

In the above, the first line references [davidshimjs's qrcode module](https://github.com/davidshimjs/qrcodejs), which you need to display the QR code.

and then you need to create the connector in your javascript code:

```javascript
	var globalinput=require("global-input-message");
    var connector = globalinput.createMessageConnector();
```



### Usage

You can play around with the full working source code in

    [JSFiddler](https://jsfiddle.net/dilshat/c5fvyxqa/)

Although the code is very self-explanatory, I would like to explain to source code in details:

After the doing the work explained in the Setup section, you just need to call  ```connect()``` method, get the codedata from the connector.

```
    connector.connect(globalInputConfig);
    var codedata=connector.buildInputCodeData();
```

In the above code, the ```globalInputConfig```  variable is passed in to the connect method. The variable defines the form that you would like to display on the mobile phone screen. It also contains the callback function that you would like to be invoked when the user interact with the form. I will explain how to do this later.

After you have got the codedata, you just need to display it with QR code:

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

From the above code, you need to including following HTML code to specify where you would like to display the QR Code:

```<div id="qrcode"></div>
```

That is all you need to do allow your application connect to the Global Input mobile app. In the next section, I explain how to set up the ```globalInputConfig```  variable that I mentioned earlier.


### Configuration

As explained above, the ```globalInputConfig```  variable is passed in to the connect method. The variable defines the form that you would like to display on the mobile phone screen. It also contains the callback function that you would like to be invoked when the user interact with the form.

This can be explained very easily with the following requirements:

* Suppose you would like to display a ```Sign In``` form on the mobile screen.
* You would like the form to contain ```Email Address``` input field,  a ```Password``` input field and a ```Login``` button.
* When a user enters something in the ```Email Address``` field on the mobile screen, you would like your function  ```setUsername(username)``` invoked.
* When a user enters something in the ```Password``` field on the mobile screen, you would like your function called ```setPassword(password)``` invoked with the text entered.
* When a user clicks on the ```Login``` button on the mobile screen, you would like your function ```login()``` invoked, so that you can do the login operation within your ```login()``` function

The following ```globalInputConfig``` variable defines the requirements described above.

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

You may find the above self-explanatory, but still I would like to explain line by line to make it absoltey clear:

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
                 onInput:this.setUsername
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

The ```onInput``` callback function will be invoked when user is entering text on the field. In this case, ```setPassword(password)``` will be invoked for each user typing in the ```Email Address``` field. The function ```setUsername(username)``` will passed in with the current value in the ```Email Address``` field.

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

The ```onInput``` callback function will be invoked when user has clicked on the button. In this case, ```login()``` will be invoked.

As you can see that it is so simple to to make your application display a QR code, that can be instruct the Global Input mobile app to display any form you like and calls back your function on your choice.

The communication between your application and the Global Input app is absolutely secure. An encryption key will be generated for each session and will be part of the QR code to be transferred to the mobile app to establish a secure end-to-end encryption. Nothing between your application and the Global Input App will know what the user is typing. Furthermore, you can control the authentication and authorisation from within your app when the mobile app tries to connect to your phone.


Please try it out this free library and the free mobile app, and you will see that you can use Global Input app on your mobile to operate on your application like a magic. Try it out and if you like it let us know so we will be encouraged to make it better and exciting!

You can find the applications in action in

[https://globalinput.co.uk/](https://globalinput.co.uk/)

If your application is a React JS application, you can following the instruction in the following URL:

[https://github.com/global-input/global-input-react](https://github.com/global-input/global-input-react)
