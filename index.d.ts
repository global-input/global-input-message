declare module 'global-input-message' {
    
    export function createMessageConnector():GlobalInputMessageConnector;
    
    
    
    interface ConnectResult{
        type:"device"|"mobile"|"pair"|"error";
        connectionCode?:string;
        codeData?:CodeData;
        initData?:InitData;
        permission?:PermissionResultMessage;
        error?:string;
    }

    class GlobalInputMessageConnector {
        client:string;
        session:string;        
        isConnected():boolean;
        disconnect():void;
        setCodeAES(codeAES:string):void;
        setSecurityGroup(securityGroup:string):void;
        connect(opts:ConnectOptions,encryptedCode?:string):Promise<ConnectResult>;
        sendInputMessage(value:FieldValue,index?:number,fieldId?:string):void;
        sendValue(fieldId:string|null|undefined,value:FieldValue,index?:number):void;
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
        initData?:InitData;
        url?:string;
        apikey?:string;        
        securityGroup?:string;
        connectSession?:string;
        aes?:string;
        onInput?:(message:InputMessage)=>void;        
        onRegistered?:(connectionCode:string) =>void;
        onRegisterFailed?:  () =>void;
        onInputPermission?: (permissionMessage:PermissionRequestMessage,allow:()=>void,deny:()=>void) => void;
        onInputPermissionResult?:(message:PermissionResultMessage)=>void;
        onInputCodeData?:(codedata:CodeData)=>void;
        onError?:(message:string)=>void;        
    }

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
        id?:string;
        action?:string;
        dataType?:string;    
        form:{  
            id?:string;          
            title?:string;            
            label?:string;
            domain?:string;
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
    
    
    interface PermissionResultMessage{
        allow:boolean;
        client?:string;
        connectSession?:string;
        initData?:InitData;
        securityGroup?:string;
        session?:string;        
        reason?:string;        
    }
    interface PermissionRequestMessage{
        client?:string;        
        connectSession?:string;
        data?:object;
        client?:string;
        time?:number;        
        securityGroup?:string;
        session?:string;        
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

    export function generateRandomString(length?:number):string;    
    export function encrypt(content:string, password:string):string;    
    export function decrypt(content:string, password:string):string;



    interface MessageReceiver <T> {
        get:()=>Promise<T>;    
    }
    interface CreateMessageReceiver{
        config:ConnectOptions;
        input:MessageReceiver<InputMessage>|null;
        inputs:MessageReceiver<FieldValue>[]|null;
    }
    export function createInputReceivers(config?:ConnectOptions):CreateMessageReceiver;
}