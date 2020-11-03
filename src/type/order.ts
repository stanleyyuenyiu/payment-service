import {Status} from "@type/constants";
import { number } from "@hapi/joi";
export type Settle = {
    authCode?:string | null,
    authDate?:string | null,
    lastFourDigitPAN?:string | null,
    transactionRefNo?:string | null
}
export namespace Update{
    export type Request = {
        data : {
            paymentStatus: Status,
            data ?: Settle | null
        }
    }

    export type Response = {
        data: unknown | null,
        error  : {
            statusCode : number,
            error: string,
            message: string
        } | null
    }
}


