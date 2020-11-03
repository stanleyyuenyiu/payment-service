'use strict';
import {  Request,Response, Process } from '@type/request-response';
export interface IPayment {
     code : string;
     Request(arg : Request) : Promise<Process.Request.Response>;
}

export interface IRedirectable extends IPayment {
     Response(request : Response, paymentId?: string) : Promise<any>
}

export interface ICancelable extends IPayment {
     Cancel(request : Response, paymentId ?: string) : Promise<any>
}

export interface ICallbackable extends IPayment {
     Callback(request : unknown, paymentId ?: string) : Promise<any>
}

export interface ISchedulable extends IPayment {
     Schedule() : Promise<void>;
}

export interface IPaymentConfig {
    id:String,
    prefix: string,
    suffix: string,
    path: string,
    debug: boolean,
    paymentDescription: string,
    enabled: boolean,
    isLive: boolean,
    config: unknown,
    markets: {identifier:string}[],
    configurations: Record<string, string>,
    liveUrl:string,
    testUrl:string,
    Get(key:string):string
    Get(...args:string[]):string | {};
}