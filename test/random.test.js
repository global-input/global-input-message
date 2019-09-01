
import {generatateRandomString} from "../src";


test("encrypt and decrypt should work", function(){


  var uniquevalues=new Set();
  var size=1000;


  for(var i=0;i<size;i++){
       var pass=generatateRandomString(17);       
       uniquevalues.add(pass);

  };
  expect(uniquevalues.size).toBe(size);




});
