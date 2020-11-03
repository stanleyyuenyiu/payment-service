import { Document, Types } from "mongoose";

interface IPaymentSchema extends Document {
    _id: string,
    responseUrl: string,
    cancelUrl: string,
    failUrl: string,
    orderId: string,
    realOrderId: string,
    currency: string,
    locale?: string,
    totalAmount: number,
    reference?: string,
    market: string,
    method: string,
    paymentLog: Types.Array<{status:string, content:string, message:string, createdAt:Date}>,
    status: string,
    queueRetry: boolean
    updatedAt ?: Date
    createdAt ?: Date 
}

export interface IPaymentEntity extends IPaymentSchema {
    log4Redirect(data: {status?:string, req?:unknown, message?:string}): Promise<IPaymentEntity>;
    log4Callback(data: {status?:string, req?:unknown, message?:string}): Promise<IPaymentEntity>;
    log4Schedule(data: {status?:string, req?:unknown, message?:string}): Promise<IPaymentEntity>;
}