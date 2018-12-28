import CryptoJS from "crypto-js";
export function generatateRandomString(length=10){
  var randPassword = Array(length).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
  return randPassword;
}
export function encrypt(content, password){
    return escape(CryptoJS.AES.encrypt(content, password).toString());
}
export function decrypt(content, password){
  return CryptoJS.AES.decrypt(unescape(content), password).toString(CryptoJS.enc.Utf8);
}
export function basicGetURL(url, onSuccess, onError){
      var request = new XMLHttpRequest();
      request.ontimeout = (e) => {
            console.warn("requesting socket server url timeout");
            onError();
      };
      request.onreadystatechange = (e) => {
            if(e){
              var cache=[];
              console.log(JSON.stringify(e, (key,value)=>{
                      if(typeof value === 'object' && value!=null){
                            if(cache.indexOf(value)!=-1){
                                return;
                            }
                            cache.push(value);
                      }
                      return value;
              }));
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

    request.open('GET', url,true);

    request.send();
}
