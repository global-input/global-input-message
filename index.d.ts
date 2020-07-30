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
        sendInputMessage(value:FieldValue,index?:number,fieldId?:string):void;
        sendInitData(initData:InitData):void;
        buildOptionsFromInputCodedata(codedata:CodeData, options?:ConnectOptions):ConnectOptions;
        buildInputCodeData(data?:CodeData):string;
        buildPairingData(data?:CodeData):string;
        processCodeData(encryptedCodeData?:string, options?:CodeProcessors):void;
        /*
            encryptedCodeData=[Type][EncryptedContent]
            switch(Type):
                case 'C': use the static shared encryption key to decrypt. 
                case 'A': use the dynamic encryption key to decrypt.
                case 'N': the content is not encrypted
       */    
         
    }
    type FieldValue=string|number|object|null|undefined;

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
            value:FieldValue;
            index?:number;
            id?:number;
        };
        initData?:InitData;
    }

    interface CodeProcessors {
        onInputCodeData?: (codedata:CodeData)=>void;
        onPairing?:(codedata:CodeData)=>void;
        onError?:(message:string)=>void;
    }


    interface InitData {
        action?:string;
        dataType?:string;    
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
        value?:FieldValue;        
        nLines?:number;
        icon?:string;
        viewId?:string;
        iconText?:string|object;
        operations?:FormOperation;        
        options?:object[];
        index?:number;
    }

    
    

    interface FormOperation{
        onInput:(value:FieldValue) => void;
    }
    
    
    interface PermissionMessage{
        allow:boolean;
        reason?:string;
        inputAES?:string;
        initData?:InitData;
    }
    interface CodeData {
        session?:string;
        url?:string;
        aes?:string;
        apikey?:string;
        securityGroup?:string; 
        action?:string; 
        codeAES?:string;     
    }

    function generateRandomString(length?:number):string;    
    function encrypt(content:string, password:string):string;    
    function decrypt(content:string, password:string):string;
    

    

    
    
    function generateRandomString(length?:number):string;
    function encrypt(content:string, password:string):string;
    
    function decrypt(content:string, password:string):string;

    
    
    function setCallbacksOnDeviceConnectOption(connectOption:ConnectOptions, receivers:DeviceMessageReceivers):void;
    function setCallbacksOnInitData (initData:InitData, receivers:DeviceMessageReceivers):void;
    interface DeviceMessageReceivers {        
        registered?:{
            message:() => Promise<void>;
        }
        fields?:FieldMessage[];        
    }
    interface FieldMessage {
        message:() => Promise<FieldValue>;
        reset:()=>void;
    }    
    
    function setCallbacksOnCodeDataProcessors(codeProcessors:CodeProcessors, receivers:CodeDataReceiver):void;

    
    

    interface CodeDataReceiver {
        codeType?:string;
        input?:{code:()=>Promise<CodeData>};
        pairing?:{code:()=>Promise<CodeData>};        
    }
            
    function setCallbacksOnMobileConnectOption(connectionOptions:ConnectOptions,receivers:MobileMessageReceivers):void
    interface MobileMessageReceivers {
            permission?:{
                message:()=>Promise<PermissionMessage>;
            }
            input?:{
                message:()=>Promise<InputMessage>;
                reset:()=>void;
            }
    }
    
}