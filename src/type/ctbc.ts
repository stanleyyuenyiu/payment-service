export namespace PaymentReponse {
    export type Request = {
        URLResEnc: string,
        merID:string
    } 
}

export namespace Encrypt{
    export type Request = {
        MerchantID:string,
        TerminalID:string,
        OrderNo:string,
        AuthAmt:string,
        TxType:string,
        Option:string,
        Key:string,
        MerchantName:string,
        AuthResURL:string,
        OrderDetail:string,
        AutoCap:string,
        Customize:string
    }

    export type Response = {
        result:string,
        error ?: string,
        success: boolean
    }
}

export namespace Decrypt{
    export type Request = {
        URLResEnc: string,
        key:string
    }

    export type Response = {
        result: {
            encRes :string
            status :string
            errCode :string
            authCode :string
            authAmt :string
            merID :string
            orderNo :string
            last4digitPAN :string
            errDesc :string
            authResURL :string
            xid :string
            lastError:number
        },
        error ?: string,
        success: boolean
    }
}

export namespace Query{
    export type Request = {
        ServerName:string,
        Amt:number,
        MerID:number,
        OrderNo:string
    }
    
    export type Response = {
        result: {
            pan: string,
            status: number,
            errCode: string,
            authCode: string,
            authAmt: number,
            queryCode: number,
            termSeq: number,
            currentState: number,
            retrRef: string,
            errorDesc: string
        },
        error ?: string,
        success: boolean
    }

    export enum Status {
        FIND = 1,
        FIND_MORE_THAN_ONE = 2,
        NOT_FOUND = 0,
        ERROR = -1
    }

   
}

export enum Status {
    CANCEL = "10"
}

export enum ErrCode {
    CANCEL = "88"
}
export enum State {
    PAID = 10
}

















