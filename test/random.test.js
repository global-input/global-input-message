
import { generateRandomString } from "../src";


test("encrypt and decrypt should work", function () {


  let uniqueValues = new Set();
  let size = 1000;


  for (let i = 0; i < size; i++) {
    let pass = generateRandomString(17);
    uniqueValues.add(pass);

  };
  expect(uniqueValues.size).toBe(size);




});
