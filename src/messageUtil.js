
export const setCallbacksOnDeviceConnectOption = (connectOption, receivers) => {
    // const inputPromise = new Promise((resolve) => {
    //     connectOption.onInput = (message) => resolve(message);
    // });
    // messageReceivers.input = () => inputPromise;
    receivers.registered={};
    receivers.registered.promise= new Promise((resolve, reject) => {
                connectOption.onRegistered = (next) => {
                    next();
                    resolve();
                }
                connectOption.onError=(message)=>reject(message);
    });    
    receivers.registered.message = () => receivers.registered.promise;
    setCallbacksOnInitData(connectOption.initData, receivers);
};


export const setCallbacksOnInitData = (initData, receivers) => {
    if (!initData || !initData.form || !initData.form.fields || !initData.form.fields.length) {
        console.error("initData.form.fields is required!!!");
        return;
    }
    receivers.fields=initData.form.fields.map(field=>createFieldMessageReceiver(field));    
}
const createFieldMessageReceiver=(field)=>{
    const receiver={};    
    createPromiseOnReceiver(receiver);
    field.operations= {                
        onInput: (message) => {            
            receiver.resolve(message);                        
        }
    };    
    receiver.message = async () => receiver.promise;
    receiver.reset=()=>createPromiseOnReceiver(receiver);    
    return receiver;    
};
const createPromiseOnReceiver=receiver=>{
    receiver.promise=new Promise((resolve, reject)=>{
        receiver.resolve=resolve;
        receiver.reject=reject;            
    });
};


export const setCallbacksOnCodeDataProcessors = (codeProcessors, receivers) => {
    receivers.codeType=null;
    receivers.pairing={};
    receivers.input={};
    receivers.input.promise = new Promise ((inputResolve, inputReject)=>{
    receivers.pairing.promise=new Promise ((pairResolve, pairReject)=>{
                codeProcessors.onInputCodeData = (codeData) => {
                    receivers.codeType='input';
                    inputResolve(codeData);                    
                };
                codeProcessors.onPairing = (codeData) => {
                    receivers.codeType='pairing';
                    pairResolve(codeData);
                };
                codeProcessors.onError = ( message) => {                    
                    receivers.codeType='error';
                    inputReject(message);
                    pairReject(message);
                };
         });
         receivers.pairing.code=async () => receivers.pairing.promise;

    });
    receivers.input.code = async () => receivers.input.promise;    
};


export const setCallbacksOnMobileConnectOption = (connectOption,receivers) => {
    receivers.permission={}; 

    receivers.permission.promise = new Promise((resolve, reject) => {        
        connectOption.onInputPermissionResult = (message) => {            
            resolve(message);
        };
        connectOption.onError=(message)=>reject(message);        

    });
        
    receivers.permission.message = async () => receivers.permission.promise;

    receivers.input={};
    createPromiseOnReceiver(receivers.input);    
    
    connectOption.onInput = (message) => {            
            receivers.input.resolve(message);
    };        
    receivers.input.message = async () => receivers.input.promise;
    receivers.input.reset=()=>createPromiseOnReceiver(receivers.input);
}
