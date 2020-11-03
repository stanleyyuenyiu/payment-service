
export enum Status  {
    SUCCESS = "00",
    CANCEL = "01",
    OFFLINE = "02"
}

export namespace PaymentReponse {
    export type Request = {
        auth_code:string,
        respcode?:Status,
        txncurr?:string,
        amt?:number,
        txnid?:string,
        signature?:string,
        nttrefid:string,
        respdesc:string,
        proc_code:string,
        date:Date,
        callbackUrl:string,
        login:string,
        channelType:string,
        paymentMethod:string,
        ru:string,
        captureId:string,
        manualCapture:string,
        manualCaptureStatus:string
    } 
}
export namespace Payment{
    
    export type Request = {
        login:string,
        pass:string,
        txncurr:string,
        amt:number,
        txnid:string,
        od:string,
        ru:string,
        callbackUrl:string,
        useLimit:number,
        lang:string,
        signature:string
    }

    export type Response = {
        respcode:Status, 
        respdesc:string, 
        result?:string
    }
}
export namespace Query
{
    export type Request = {
        login:string,
        pass:string,
        txnid:string,
        signature:string
    }

    export type Response = {
        respcode:RespCode,
        respdesc:string,
        auth_code:string,
        amt:number,
        txncurr:string,
        txnid:string,
        nttrefid:string,
        proc_code:string,
        accounttype:string,
        date: Date,
        mobile: string,
        signature:string,
        channelType:string,
        refundedAmount:number,
        capturedAmount:number,
        voidedAmount:number,
        paymentMethod:string,
        captureId:string,
        manualCapture:string
    }
    export enum RespCode  {
        COMPLETED = "00",
        FAILED = "01",
        PENDING = "02"
    }
}



