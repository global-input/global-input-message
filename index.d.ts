declare module 'global-input-message' {
    
    declare function createMessageConnector():GlobalInputMessageConnector;
    declare class GlobalInputMessageConnector {
        client:string;
        session:string;  
        constructor();
        isConnected():boolean;
        disconnect():void;
        setCodeAES(codeAES:string):void;
        connect(opts:OPTS);
        sendInputMessage(value:any,index?:number,fieldId?:string):void;
        buildOptionsFromInputCodedata(codedata:GlobalInputCodeData, options?:OPTS):OPTS;
        buildInputCodeData(data?:GlobalInputCodeData):string;
        processCodeData(encryptedCodeData?:EncryptedCodeData, options?:ProcessCodeDataOpts):void;
    }
    interface OPTS {
        url?:string;
        apikey?:string;
        codeAES?:string;
        securityGroup?:string;
        client?:string;
        onInput?:(message:GlobalInputMessage)=>void;
        onInputPermission?:(next:CallbackOnPermission)=>void;
        onRegistered?:(next:CallbackOnRegistered) =>void;
        onInputPermissionResult?:(message:GlobalInputPermissionMessage)=>void;
        onInputCodeData?:(codedata:GlobalInputCodeData)=>void;

        initData?:InitData;        
    }
    type CallbackOnPermission=()=>void;    
    type CallbackOnRegistered=()=>void;



    interface GlobalInputMessage {
        client:string;
        data:{
            value:any
        }
    }
    interface InitData {
        form:{
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
        value?:GlobalInputValue;        
        nLines?:number;
        icon?:string;
        viewId?:string;
        iconText?:string|object;
        operations?:FormOperation;        
        options?:object[];
        index?:number;
    }
    
    

    interface FormOperation{
        onInput:(value:any) => void
    }
    interface GlobalInputPermissionMessage{
        allow:boolean;
        reason?:string;
        inputAES?:string;
        initData?:InitData;
    }
    interface GlobalInputCodeData {
        session:string;
        url:string;
        aes:string;
        apikey:string;
        securityGroup:string; 
        action?:string;       
    }

    declare function generateRandomString(length?:number):string;
    declare function generatateRandomString(length?:number):string;
    declare function encrypt(content:string, password:string):string;    
    declare function decrypt(content:string, password:string):string;
  
    
    interface InitData {
        form:{
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
        value?:GlobalInputValue;        
        nLines?:number;
        icon?:string;
        viewId?:string;
        iconText?:string|object;
        operations?:FormOperation;        
        options?:object[];
        index?:number;
    }

    type GlobalInputValue=any; //todo
    
    

    interface FormOperation{
        onInput:(value:any) => void
    }
    
    /*
    EncryptedCodeData=[Type][EncryptedContent]
    switch(Type):
        case 'C': use the static shared encryption key to decrypt. 
        case 'A': use the dynamic encryption key to decrypt.
        case 'N': the content is not encrypted
    */
    type EncryptedCodeData=string; 




    interface ProcessCodeDataOpts {
        onError?:(opts:ProcessCodeDataOpts, message:string, error:any)=>void;
        onInputCodeData?:(codeData:GlobalInputCodeData)=>void;
        onPairing?:(codeData:GlobalInputCodeData)=>void;       
    }

    
    
    declare function generateRandomString(length?:number):string;
    declare function encrypt(content:string, password:string):string;
    
    declare function decrypt(content:string, password:string):string;

    
    

    
}