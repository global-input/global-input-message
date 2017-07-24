
import {createMessageConnector} from "../src/index";

test("apikey test", function(done){

  const connector=createMessageConnector();

   var apikey="thisisapikey";

   var options={
      onSettingsCodeData:function(codedata){
      expect(codedata.apikey).toBe(apikey);
      done();
     }
   };
   connector.apikey=apikey;
   var encryptedapikey=connector.buildAPIKeyCodeData();
   connector.apikey="dummy";
   console.log("encryptedapikey:{"+encryptedapikey+"}");
   connector.processCodeData(encryptedapikey,options);

});



test("input test for code", function(done){
 var url="https://dilshat";
  const connector=createMessageConnector();
  connector.url=url;
   var encrypteddata=connector.buildInputCodeData();

   console.log("encrypte connection:{"+encrypteddata+"}");
   var options={
     onInputCodeData:function(codedata){
       console.log("iput codedata:"+JSON.stringify(codedata));
       expect(codedata.url).toBe(url);
       done();
     }
   };
   connector.processCodeData(encrypteddata,options);

});
