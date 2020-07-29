declare module 'global-input-message' {
    
    function createMessageConnector():GlobalInputMessageConnector;
    class GlobalInputMessageConnector {
        client:string;
        session:string;  
        constructor();
        isConnected():boolean;
        disconnect():void;
        setCodeAES(codeAES:string):void;
        connect(opts:ConnectOptions);
        sendInputMessage(value:any,index?:number,fieldId?:string):void;
        buildOptionsFromInputCodedata(codedata:CodeData, options?:ConnectOptions):ConnectOptions;
        buildInputCodeData(data?:CodeData):string;
        buildPairingData(data?:CodeData):string;
        processCodeData(encryptedCodeData?:string, options?:CodeDataCallbacks):void;
        /*
            encryptedCodeData=[Type][EncryptedContent]
            switch(Type):
                case 'C': use the static shared encryption key to decrypt. 
                case 'A': use the dynamic encryption key to decrypt.
                case 'N': the content is not encrypted
       */    
         
    }
    interface ConnectOptions {
        url?:string;
        apikey?:string;
        codeAES?:string;
        securityGroup?:string;
        client?:string;
        onInput?:(message:InputMessage)=>void;
        onInputPermission?:(next:PermissionCallback)=>void;
        onRegistered?:(next:RegisteredCallback) =>void;
        onInputPermissionResult?:(message:PermissionMessage)=>void;
        onInputCodeData?:(codedata:CodeData)=>void;
        onError?:(message:string)=>void;
        initData?:InitData;        
    }
    
    type PermissionCallback=()=>void;    
    type RegisteredCallback=()=>void;



    interface InputMessage {
        client:string;
        data:{
            value:any,
            index?:number,
            id?:number
        }
    }
    interface InitData {
        form:{  
            id?:string;          
            title?:string;            
            label?:string;
            fields:FormField[];
            views?:{
                viewId:{
                    [id:string]:object;
                }
            };
        }        
    }    
    interface FormField{
        id?:string;        
        type?:string;
        label?:string;
        value?:InputValue;        
        nLines?:number;
        icon?:string;
        viewId?:string;
        iconText?:string|object;
        operations?:FormOperation;        
        options?:object[];
        index?:number;
    }

    type InputValue=any; //todo
    

    interface FormOperation{
        onInput:(value:any) => void;
    }
    
    
    interface PermissionMessage{
        allow:boolean;
        reason?:string;
        inputAES?:string;
        initData?:InitData;
    }
    interface CodeData {
        session:string;
        url:string;
        aes:string;
        apikey:string;
        securityGroup:string; 
        action?:string; 
        codeAES?:string;     
    }

    function generateRandomString(length?:number):string;    
    function encrypt(content:string, password:string):string;    
    function decrypt(content:string, password:string):string;
    

    interface CodeDataCallbacks {
        onError?:(message:string)=>void;
        onInputCodeData?:(codeData:CodeData)=>void;
        onPairing?:(codeData:CodeData)=>void;       
    }

    
    
    function generateRandomString(length?:number):string;
    function encrypt(content:string, password:string):string;
    
    function decrypt(content:string, password:string):string;

    function setCallbacksOnDeviceConnectOption(connectOption:ConnectOptions, messageReceivers:DeviceMessageReceivers):void;
    function setCallbacksOnInitData (initData:InitData, messageReceivers:DeviceMessageReceivers):void;
    function setCallbacksCodeDataProcessors(codeProcessors:CodeProcessors, codeDataReceiver:CodeDataReceiver):void;
    function setCallbacksOnMobileConnectOption(connectionOptions:ConnectOptions,messageReceivers:MobileMessageReceivers):void
    
    interface DeviceMessageReceivers {
        input:() => Promise<InputMessage>;
        registered:() => Promise<void>;
        fieldInputs:()=>Promise<any>;
    }
    interface CodeProcessors {
        onInputCodeData: (codedata:CodeData)=>void;
        onPairing:(codedata:CodeData)=>void;
        onError:(message:string)=>void;
    }
    interface CodeDataReceiver {
        inputCode:()=>Promise<CodeData>;
        pairingCode:()=>Promise<CodeData>;
        codeType: string;
    }
    interface MobileMessageReceivers {
            permission:()=>Promise<PermissionMessage>;
            input:()=>Promise<InputMessage>;
    }
    
}