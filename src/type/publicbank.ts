import { string } from "@hapi/joi"

export namespace Payment {
    export type Request = {
        merID : string,
        invoiceNo: string,
        amount: string,
        postURL: string,
        securityMethod: string,
        securityKeyReq: string
    }
}

export namespace PaymentResponse {
    export type Request = {
        status  : string,
        errdesc : string,
        authCode : string,
        invoiceNo: string,
        PAN: string,
        expiryDate: string,
        amount: string,
        ECI: string,
        securityKeyRes: string,
        error: string,
    }
}


export namespace Query
{
    export type Request = {
        merID:string,
        amount:string,
        invoiceNo:string
    }

    export type Response = string

    export enum RespCode  {
        NOT_FOUND = "N",
        FAILED = "01",
        PENDING = "02"
    }
}

export enum Status  {
    SUCCESS = "00",
    FAIL = "99"
}