
import { generateRandomString } from "../src";




describe("Communications between a Mobile App and a Device App", () => {

    test('tests for messages sent between a mobile app and a device app', () => {
        const stringLength = 20;
        const generatedStrings = [];
        for (let i = 0; i < 1000; i++) {
            const randomString1 = generateRandomString(stringLength);

            expect(randomString1.length).toBe(stringLength);
            const duplicates = generatedStrings.filter(f => f === randomString1);
            expect(duplicates.length).toBe(0);
            generatedStrings.push(randomString1);
        }


    });


});
