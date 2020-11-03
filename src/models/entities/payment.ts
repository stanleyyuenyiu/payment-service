'use strict';

//const Mongoose = require('mongoose');
import { Document, Model, model, Types, Schema, Query } from "mongoose";
import { object } from "@hapi/joi";
const ObjectId = require('mongodb').ObjectID;
//const Schema = Mongoose.Schema;

var statusArr= ['PEND', 'CANCEL', 'PROCESSING', 'PAYMENT_REVIEW','PENDING_PAYMENT', 'FAIL','PAYMENT_REFUND'];

var PaymentLogSchema = new Schema({ 
    status: {type: String, enum: statusArr, default : 'PEND'},
    content: {type: String, trim: true, default: ''},
    message: {type: String, trim: true, default: ''},
    createdAt: { type: Date, default: Date.now }
}, {strict: false});

var PaymentSchema = new Schema({
    responseUrl: { type: String, trim: true, default: '' },
    cancelUrl: { type: String, trim: true, default: '' },
    failUrl: { type: String, trim: true, default: '' },
    orderId: { type: String, trim: true,unique: true,index:true, default: '' },
    realOrderId: { type: String, trim: true,unique: true,index:true, default: '' },
    currency: {type: String, trim: true, default: ''},
    locale: {type: String, trim: true, default: ''},
    totalAmount: {type: Number, trim: true, default: ''},
    reference: { type: String, trim: true, default: '' },
    market: { type: String,trim: true, default: '' },
    method: { type: String,trim: true, default: '' },
    paymentLog: [PaymentLogSchema],
    status: {type: String, enum:statusArr, default : 'PEND'},
    queueRetry: {type: String, enum: ['1', '0'], default : '0'},
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
}, {strict: true});

export default PaymentSchema;