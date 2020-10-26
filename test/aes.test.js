import { decrypt, encrypt, generateRandomString } from "../src";


test("encrypt and decrypt should work", function () {
  let content = "dilshat hewzulla";
  let password = "Up69fq3tve9uTHG5";



  for (let i = 0; i < 100; i++) {
    let codedata = {
      url: "https://globalinput.co.uk",
      session: generateRandomString(17),
      action: "input",
      aes: generateRandomString(17)
    };
    let codeAES = generateRandomString(17);

    let codeString = JSON.stringify(codedata);
    let encryptedValue = "A" + encrypt("J" + codeString, codeAES);
    let decrypted = decrypt(encryptedValue.substring(1), codeAES);
    let obj = JSON.parse(decrypted.substring(1));
    expect(obj.url).toBe(codedata.url);
    expect(obj.session).toBe(codedata.session);
    expect(obj.action).toBe(codedata.action);
    expect(obj.aes).toBe(codedata.aes);
  }






});
