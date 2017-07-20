
import {createMessageConnector} from "../src/index";

test("encrypt and decrypt should work", function(){

const connector=createMessageConnector();
  var uniquevalues=new Set();
  size=1000;
  for(var i=0;i<size;i++){
      var pass=connector.generatateRandomString(17);
      uniquevalues.add(pass);
  };
  expect(uniquevalues.size).toBe(size);




});
