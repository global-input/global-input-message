import {decrypt,encrypt,generatateRandomString} from "../src";


test("encrypt and decrypt should work", function(){
  var content="dilshat hewzulla";
  var password="Up69fq3tve9uTHG5";


   for(var i=0;i<100;i++){
             var codedata={
                       url:"https://globalinput.co.uk",
                       session:generatateRandomString(17),
                       action:"input",
                       aes:generatateRandomString(17)
             };
             var codeAES=generatateRandomString(17);

             var codestring=JSON.stringify(codedata);
             var encryptedvalue="A"+encrypt("J"+codestring,codeAES);
             console.log(codestring.length+":"+encryptedvalue.length+":encrypted content:"+encryptedvalue);
             var decrypted=decrypt(encryptedvalue.substring(1),codeAES);
             var obj=JSON.parse(decrypted.substring(1));
             expect(obj.url).toBe(codedata.url);
             expect(obj.session).toBe(codedata.session);
             expect(obj.action).toBe(codedata.action);
             expect(obj.aes).toBe(codedata.aes);
   }






});
