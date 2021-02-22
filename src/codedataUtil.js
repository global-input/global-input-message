
import CryptoJS from "crypto-js";



const shuffleCharacterAt = (content, rNumber) => {
  if (rNumber < 1) {
    return content.slice(1) + content.charAt(0);
  }
  const rIndex = rNumber % content.length;
  if ((rIndex + 1) >= content.length) {
    return content.charAt(content.length - 1) + content.slice(0, content.length - 1);
  }
  return content.slice(0, rIndex) + content.slice(rIndex + 1) + content.charAt(rIndex);
}
const randomNumberGenerator = () => {
  const indexString = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(1));
  return parseInt(indexString, 16);
}
let possibleCharactersSeed = "Abm6fixYq;rMh9sSkjaGvl@*$tOVDZRyQF:8WzonIT41K0wL3PHp7XCEecB&Jgu£2dUN5";
const startUpTime = new Date().getMilliseconds();
export const generateRandomString = (length = 10) => {
  let result = '';
  for (let loop = 0; loop < length; loop++) {
    possibleCharactersSeed = shuffleCharacterAt(possibleCharactersSeed, Math.random() * possibleCharactersSeed.length); //reshuffle with browser random
    possibleCharactersSeed = shuffleCharacterAt(possibleCharactersSeed, new Date().getMilliseconds());//reshuffle with time
    possibleCharactersSeed = shuffleCharacterAt(possibleCharactersSeed, startUpTime);//reshuffle with application start time
    const indexValue = randomNumberGenerator();                                     //generate random using the crypto
    result += possibleCharactersSeed.charAt(indexValue % possibleCharactersSeed.length); //get the character from the seed using the crypto random
    possibleCharactersSeed = shuffleCharacterAt(possibleCharactersSeed, indexValue + new Date().getMilliseconds());     //reshuffle using the crypto random and time
  }
  return result;
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
