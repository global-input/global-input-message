
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
    onError('socket-server-url-timeout');
  };
  request.onreadystatechange = (e) => {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      try {
        onSuccess(JSON.parse(request.responseText));
      }
      catch (error) {
        onError("invalid processing the server response:" + error);
        console.log("server response:" + request.responseText);
      }
    } else {
      onError('socket-server-url-status:' + request.status);
    }
  };

  request.open('GET', url, true);

  request.send();
};

export const buildOptionsFromInputCodedata = (connector, codedata, options) => {
  const { session, url, aes, apikey, securityGroup } = codedata;
  return {
    connectSession: session,
    url, aes, apikey, securityGroup,
    ...options
  };
};

export const buildInputCodeData = (connector, data = {}) => {
  const { url, session, apikey, aes, codeAES } = connector;
  const codedata = { ...data, url, session, apikey, aes, action: 'input' };
  if (codeAES) {
    return "A" + encrypt("J" + JSON.stringify(codedata), codeAES);
  }
  else {
    return "NJ" + JSON.stringify(codedata);
  }
};

const sharedKey = "50SUB39ctEKzd6Uv2a84lFK";
export const buildPairingData = (securityGroup, codeAES, data) => {
  const codedata = { securityGroup, codeAES, action: 'pairing', ...data };
  return "C" + encrypt("J" + JSON.stringify(codedata), sharedKey);
};

const onError = (options, message, error) => {
  if (options.onError) {
    options.onError(message);
  }
  else {
    console.log(message);
  }
  if (error) {
    console.log(error);
  }
};

export const processCodeData = (connector, encryptedCodedata, options) => {
  if (!encryptedCodedata) {
    console.log(" codedata-empty ");
    return;
  }
  const encryptionType = encryptedCodedata.substring(0, 1);
  const encryptedContent = encryptedCodedata.substring(1);
  let decryptedContent = null;
  switch (encryptionType) {
    case 'C':
      try {
        decryptedContent = decrypt(encryptedContent, sharedKey);
        break;
      }
      catch (error) {
        onError(options, "May not ne a global Input code (C) ", error);
        return;
      }
    case 'A':
      try {
        decryptedContent = decrypt(encryptedContent, options.codeAES ? options.codeAES : connector.codeAES);
        break;
      }
      catch (error) {
        onError(options, "May not be global input code (A)", error);
        return;
      }
    case 'N':
      decryptedContent = encryptedContent;
      break;
    default:
      onError(options, "Not a Global Input code (N)  ");
      return;
  }
  if (!decryptedContent) {
    onError(options, "Not a global Input code (E)");
    return;
  }
  const dataFormat = decryptedContent.substring(0, 1);
  const dataContent = decryptedContent.substring(1);
  let codedata = null;

  if (dataFormat === "J") {
    try {
      codedata = JSON.parse(dataContent);
    }
    catch (error) {
      onError(options, " incorrect format decrypted", error);
      return;
    }
  }
  else {
    onError(options, "unrecognized format decrypted");
    return;
  }
  if (codedata.action === 'input') {
    if (options.onInputCodeData) {
      options.onInputCodeData(codedata);
    }
  }
  else if (codedata.action === 'pairing') {
    if (options.onPairing) {
      options.onPairing(codedata);
    }
  }
};
