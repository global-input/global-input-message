
const createPromise=target=>{
    target.promise=new Promise((resolve, reject)=>{
        target.resolve=resolve;
        target.reject=reject;            
    });
};

const createWaitForRegistered = (connectOption) => {        
    const promise= new Promise((resolve, reject) => {
                connectOption.onRegistered = (next) => {
                    next();
                    resolve();
                }
                connectOption.onError=(message)=>reject(message);
    });        
    return () => promise;    
};


export const createWaitForFieldMessages = (fields) => {    
    return fields.map(field=>{
        const receiver={};    
        createPromise(receiver);
        field.operations= {                
            onInput: (message) => {            
                receiver.resolve(message);                        
            }
        };    
        receiver.get =  () => receiver.promise;
        receiver.reset=()=>createPromise(receiver);
        return receiver;    
    });
};

export const deviceConnect= (connector,connectOption)=>{
    const registered=createWaitForRegistered(connectOption);      
    const fields=createWaitForFieldMessages(connectOption.initData.form.fields);
    connector.connect(connectOption); 
    return {registered,fields};    
}


export const decryptCodeData= (codedata,connector)=>{
        const codeProcessors={};        
        const promise = new Promise ((resolve, reject)=>{
            codeProcessors.onInputCodeData = (codeData) => {                    
                resolve({codeData,codeType:"input"});                                                
            };  
            codeProcessors.onPairing = (codeData) => {
                resolve({codeData, codeType:"pairing"});                
            };          
            codeProcessors.onError = (message) => {
                reject(message);                
            };
        });           
        connector.processCodeData(codedata,codeProcessors);
        return promise;
};

const createWaitForPermission = (connectOption) => {
    const promise = new Promise((resolve, reject) => {        
        connectOption.onInputPermissionResult = (message) => {            
            resolve(message);
        };
        connectOption.onError=(message)=>reject(message);        
    });
    return () => promise;
};


const createWaitForInput = (connectOption) => {    
    const input={};                
    createPromise(input);    
    connectOption.onInput = (message) => {            
            input.resolve(message);
    };        
    input.get =  () => input.promise;
    input.reset=()=>createPromise(input);
    return input;    
};



export const mobileConnect= (connector, codedata)=>{
    let mobileConnectOption = connector.buildOptionsFromInputCodedata(codedata);
    const getPermission=createWaitForPermission(mobileConnectOption);
    const input=createWaitForInput(mobileConnectOption);
    connector.connect(mobileConnectOption);     
    return {getPermission,input};
};

export const deviceSendInitData=(connector, initData) =>{    
    const fields=createWaitForFieldMessages(initData.form.fields);
    connector.sendInitData(initData); 
    return fields;
}

