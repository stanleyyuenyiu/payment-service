'use strict';
import PaymentSchema from "@models/entities/payment";
import {IPaymentEntity} from "@interface/payment-entities";
import { model } from "mongoose";

PaymentSchema.methods.log4Redirect = async function(data: {status?:string, req?:unknown, message?:string}): Promise<IPaymentEntity>  {
    if(typeof data.status != "undefined")
    {
        this.status = data.status;
    }
    this.paymentLog.push(
        { status: this.status, content: data.req ?  JSON.stringify(data.req) : "",  message: `[REDIRECT BACK] ${data.message || ""}` }
    );
    return this.save();
 }

PaymentSchema.methods.log4Callback = async function(data: {status?:string, req?:unknown, message?:string}): Promise<IPaymentEntity>  {
    if(typeof data.status != "undefined")
    {
        this.status = data.status;
    }
    this.paymentLog.push(
        { status: this.status, content: data.req ?  JSON.stringify(data.req) : "",  message: `[CALLBACK] ${data.message || ""}` }
    );
    return this.save();

 }

 PaymentSchema.methods.log4Schedule = async function(data: {status?:string, req?:unknown, message?:string}): Promise<IPaymentEntity>  {
    if(typeof data.status != "undefined")
    {
        this.status = data.status;
    }
    this.paymentLog.push(
        { status: this.status, content: data.req ?  JSON.stringify(data.req) : "",  message: `[SCHEDULE] ${data.message || ""}` }
    );
    return this.save();

 }

export default model<IPaymentEntity>("Payment", PaymentSchema)
