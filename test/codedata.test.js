
import {createMessageConnector} from "../src/index";

test("apikey se test", function(done){

  const connector=createMessageConnector();

   var apikey="thisisapikey";

   var options={
     onSettingsCodeData:function(codedata,next){

      next();
      expect(connector.apikey).toBe(apikey);
      done();
     }
   }
   connector.apikey=apikey;
   var encryptedapikey=connector.buildAPIKeyCodeData();
   connector.apikey="dummy";
   console.log("encryptedapikey:{"+encryptedapikey+"}");
   connector.processCodeData(options,encryptedapikey);

});



test("input test for code", function(done){
 var url="https://dilshat";
  const connector=createMessageConnector();
 connector.url=url;

   connector.connect=function(opts){
      console.log("connect:"+JSON.stringify(opts));
      expect(opts.url).toBe(url);
      done();
   };

   var encrypteddata=connector.buildInputCodeData();
   console.log("encrypte connection:{"+encrypteddata+"}");
   connector.processCodeData({},encrypteddata);

});
