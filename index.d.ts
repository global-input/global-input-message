declare module 'global-input-message' {
    
    export function createMessageConnector():GlobalInputMessageConnector;
    class GlobalInputMessageConnector {
        client:string;
        session:string;        
        isConnected():boolean;
        disconnect():void;
        setCodeAES(codeAES:string):void;
        setSecurityGroup(securityGroup:string):void;
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
        securityGroup?:string;
        connectSession?:string;
        aes?:string;
        onInput?:(message:InputMessage)=>void;        
        onRegistered?:(next:()=>void) =>void;
        onRegisterFailed?:(message:object)=>void;
        onInputPermissionResult?:(message:PermissionMessage)=>void;
        onInputCodeData?:(codedata:CodeData)=>void;
        onError?:(message:string)=>void;
        initData?:InitData;        
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

    export function generateRandomString(length?:number):string;    
    export function encrypt(content:string, password:string):string;    
    export function decrypt(content:string, password:string):string;
    

    

    export function deviceConnect (connector:GlobalInputMessageConnector,connectOption:ConnectOptions):DeviceConnectMessageReceivers;

    interface DeviceConnectMessageReceivers {
        registered:()=>Promise<void>;
        fields:MessageReceiver<FieldValue>[];
    }
    
    interface MessageReceiver <T> {
            get:()=>Promise<T>;
            reset:()=>void;
    }
    export function createWaitForFieldMessages (fields:FormField[]):MessageReceiver<FieldValue>[];



    export function decryptCodeData (codedata:string,connector:GlobalInputMessageConnector):Promise<DecryptedCodeData>

    interface DecryptedCodeData{
        codeType:string;
        codeData:CodeData;
    }

    export function mobileConnect(connector:GlobalInputMessageConnector,codedata:CodeData):MobileConnectMessageReceivers;
    
   interface MobileConnectMessageReceivers{
    getPermission:()=>Promise<PermissionMessage>
    input: MessageReceiver<InputMessage>
   }

   export function deviceSendInitData(connector, initData):MessageReceiver<FieldValue>[];
    
    
    
}