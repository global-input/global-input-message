import {decrypt,encrypt} from "../src";

test("encrypt and decrypt should work", function(){
  var content="dilshat hewzulla";
  var password="Up69fq3tve9uTHG5";

  var encrypted=encrypt(content,password);

  console.log("encrypted content:"+encrypted+"    type:"+typeof encrypted);
  var decrypted=decrypt(encrypted,password);
  console.log("decrypted content:"+decrypted+"    type:"+typeof decrypted);
  expect(decrypted).toBe(content);





});
