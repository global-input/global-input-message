import CryptoJS from "crypto-js";


export const generateRandomString = (length = 10) => {
      const randPassword = Array(length).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@£$&*:;").map(function (x) {
            const indexString = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(1));
            const indexValue = parseInt(indexString, 16);
            return x[indexValue % x.length]
      }).join('');
      return randPassword;
};
export const encrypt = (content, password) => escape(CryptoJS.AES.encrypt(content, password).toString());

export const decrypt = (content, password) => CryptoJS.AES.decrypt(unescape(content), password).toString(CryptoJS.enc.Utf8);

export const basicGetURL = (url, onSuccess, onError) => {
      let request = new XMLHttpRequest();
      request.ontimeout = (e) => {
            console.warn(" socket-server-url-timeout ");
            onError();
      };
      request.onreadystatechange = (e) => {
            if (e) {
                  let cache = [];
                  console.log(' onreadystatechange-error-'+e+' ');
                  // console.log(JSON.stringify(e, (key, value) => {
                  //       if (typeof value === 'object' && value != null) {
                  //             if (cache.indexOf(value) != -1) {
                  //                   return;
                  //             }
                  //             cache.push(value);
                  //       }
                  //       return value;
                  // }));
            }
            if (request.readyState !== 4) {
                  return;
            }
            if (request.status === 200) {
                  onSuccess(JSON.parse(request.responseText));

            } else {
                  onError();
            }
      };

      request.open('GET', url, true);

      request.send();
};
