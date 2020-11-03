'use strict';
import * as Hapi from "@hapi/hapi";
import errHandler from '@helpers/errorHandler';
import { PaymentFactory } from '@modules/factory';
import { Request , Response, Callback} from '@type/request-response';
import { IPayment, IRedirectable, ICallbackable, ICancelable, ISchedulable } from '@interface/payment'

export default class PaymentController {
    constructor() {
    }

    public async Request(request: Request, h: Hapi.ResponseToolkit) {
        const {paymentMethod, market} = request.params;

        try {
            const driver = await PaymentFactory.getInstance<IPayment>().driver(paymentMethod, market);
            const result = await driver.Request(request)
            return h.response({data:result}).code(200);
        } catch (error) {
            return errHandler.handleError(error);
        }
    }

    public async Response(request: Response , h: Hapi.ResponseToolkit) {
        const {paymentMethod, market, paymentId} = request.params;

        try {
            const driver = await PaymentFactory.getInstance<IRedirectable>().driver(paymentMethod, market);
            const result = await driver.Response(request ,paymentId);
            return h.response({data:result}).code(200);
        } catch (error) {
            return errHandler.handleError(error);
        }
    }

    public async Cancel(request: Response , h: Hapi.ResponseToolkit) {
        const {paymentMethod, market, paymentId} = request.params;

        try {
            const driver = await PaymentFactory.getInstance<ICancelable>().driver(paymentMethod, market);
            const result = await driver.Cancel(request ,paymentId);
            return h.response({data:result}).code(200);
        } catch (error) {
            return errHandler.handleError(error);
        }
    }

    public async Callback(request: Callback<unknown>, h: Hapi.ResponseToolkit) {
        const {paymentMethod, market, paymentId} = request.params;

        try {
            const driver = await PaymentFactory.getInstance<ICallbackable>().driver(paymentMethod, market);
            const result = await driver.Callback(request ,paymentId);
            return h.response({data:result}).code(200);
        } catch (error) {
            return errHandler.handleError(error);
        }
    }

    public async Schedule(request: Request, h: Hapi.ResponseToolkit) {
        const {paymentMethod, market} = request.params;

        try {
            const driver = await PaymentFactory.getInstance<ISchedulable>().driver(paymentMethod, market);
            await driver.Schedule();
            return h.response().code(200);
        } catch (error) {
            return errHandler.handleError(error);
        }
    }
}