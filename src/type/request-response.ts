'use strict';
import {PaymentMethod, Status} from '@type/constants'
import {Settle} from '@type/order'
import * as Hapi from "@hapi/hapi";


export type Callback<T> = Hapi.Request & {
    payload:T,
    params : {
        paymentMethod:string,
        market:string,
        paymentId?:string
    }
}

export type Request = Hapi.Request & {
    payload:{
        data:Process.Request
    }
    params : {
        paymentMethod:string,
        market:string,
        paymentId?:string
    }
}

export type Response = Hapi.Request & {
    payload:unknown,
    params : {
        paymentMethod:string,
        market:string,
        paymentId:string
    }
}

export namespace Process {
    export type Request  = {
        market: string,
        orderId: string,
        realOrderId: string,
        totalAmount: number,
        locale: string,
        currency: string,
        responseUrl: string, 
        cancelUrl: string,
        failUrl: string,
        email?: string,
        paymentType ?: string,
        addtional?:unknown
    }
    export namespace Request {
        export type Response  = {
            body?: unknown,
            method? : PaymentMethod
            redirectEndPoint? : string
        }
    }
    export namespace Response {
        export type Response  = {
            status : Status
            data ?: Settle
        }
    }

    
}
