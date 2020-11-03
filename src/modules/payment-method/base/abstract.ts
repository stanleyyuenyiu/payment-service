'use strict';
import PaymentEntity from "@models/payment";
import { IPaymentEntity } from "@interface/payment-entities"
const ObjectId = require('mongodb').ObjectID;
import Config from '@config/config';
import { IPayment, IPaymentConfig } from '@interface/payment';
import { Request, Process } from '@type/request-response';
import * as Order from '@type/order';
import { PaymentMethod, Status } from '@type/constants';
import asios, { AxiosResponse } from "axios";
import { BadRequestError, HttpStatusCode } from "@lib/error";
export abstract class PaymentAbstract
    implements IPayment {

    static readonly CODE: string = "";
    abstract readonly code: string = "";
    readonly methodType: PaymentMethod = PaymentMethod.DIRECT;

    protected market: string = "";
    protected recordId: string = "";
    protected config: IPaymentConfig;

    constructor(config: IPaymentConfig) {
        this.config = config;
        this.config.path = Config.callbackPath;
        this.config.debug = true;
    }

    FormatOrderId(orderId: string): string {
        const { prefix = "", suffix = "" } = this.config;
        return `${prefix}${orderId}${suffix}`;
    }

    UnFormatOrderId(orderId: string): string {
        const { prefix = "", suffix = "" } = this.config;
        return `${orderId}`.replace(prefix || "", "").replace(suffix || "", "");
    }

    async Request(req: Request): Promise<Process.Request.Response> {
        try {
            const request = req.payload.data;

            this.market = request.market;

            const entity = await this.initEntity(request, "init payment");

            const _result = await this._processRequest(request, entity);

            _result.method = this.methodType;

            const updated = await this.saveEntity(entity, _result);

            this.debug("makeOrder", "saveEntity", JSON.stringify(updated, null, 4));

            //TODO update order status to pending payment

            return _result;
        }
        catch (e) {
            this.debug("ProcessRequest", "error", e);

            if (e instanceof BadRequestError) {
                throw e;
            }

            throw new BadRequestError({ code: 400, message: `[${this.code}] Process Request Error` });
        }
    }

    protected abstract _processRequest(request: Process.Request, entity: IPaymentEntity): Promise<Process.Request.Response>;

    protected async initEntity(data: Process.Request, message: string): Promise<IPaymentEntity> {
        const request = new PaymentEntity(
            {
                ...data,
                paymentLog: { content: JSON.stringify(data), message },
                method: this.code.toLowerCase()
            }
        );
        this.recordId = request._id;
        return request;
    }

    protected async saveEntity(entity: IPaymentEntity, reference: unknown): Promise<IPaymentEntity> {
        entity.reference = JSON.stringify(reference || {});
        return await entity.save();
    }

    protected async updateOrder(arg: {
        status: Status,
        data?: Order.Settle,
        id: string
    }): Promise<boolean> {
        try {
            const { data, id, status } = arg;

            const request = {
                data: {
                    paymentStatus: status
                }
            } as Order.Update.Request;


            if (status == Status.PAYMENT_REVIEW) {
                if (typeof data != "undefined") {
                    var now = Date.now();
                    var d = new Date(now);
                    data.authDate = d.toISOStringWTimeZone(8);
                }
                request.data.data = data;
            }

            const r: AxiosResponse<Order.Update.Response> = await asios.put(`${Config.orderApi.host}/${id}`, request, { headers: { "Content-Type": "application/json" } });

            this.debug(r.data);

            if (r.status < 200 && r.status >= 300) {
                throw new Error("Cant update order")
            }
        }
        catch (e) {
            //TODO retry

            this.debug(e);
            return true;
        }
        return false;
    }

    protected async getEntityById(id: string): Promise<IPaymentEntity> {

        try {
            return await PaymentEntity.findById({ _id: ObjectId(id) }) as IPaymentEntity;
        } catch (e) {
            throw new BadRequestError({ code: 404, message: `[${this.code}] Record not found` }, HttpStatusCode.NOT_FOUND);
        }
    }

    protected isValidPaymentRequest = (status: string): boolean => status == Status.PENDING;

    protected debug = (...args: unknown[]): void => {
        if (this.config.debug) {
            console.log(`====================================[${this.code}]===================================`);
            console.log(...args);
            console.log(`====================================[${this.code}]===================================`);
        }
    }

}
