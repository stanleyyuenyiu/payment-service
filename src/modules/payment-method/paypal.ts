'use strict';
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
import { ICancelable, ICallbackable, IPaymentConfig } from '@interface/payment';
import { PaymentRedirect } from '@modules/payment-method/base/redirect'
import { Callback, Response, Process } from '@type/request-response';
import { PaypalHelper } from '@helpers/paypal';
import { PaymentMethod, Status } from '@type/constants';
import { IPaymentEntity } from "@interface/payment-entities";
import * as PaypalType from '@type/paypal';
import { BadRequestError } from '@lib/error';
export class Paypal extends PaymentRedirect implements ICancelable, ICallbackable {

    static CODE = 'paypal';
    code = Paypal.CODE;
    methodType: PaymentMethod = PaymentMethod.REDIRECT;

    private _response: PaypalType.Capture.Response = {} as PaypalType.Capture.Response;
    protected get clientId(): string { return this.config.Get("clientId") };
    protected get clientSecret(): string { return this.config.Get("clientSecret") };

    constructor(config: IPaymentConfig) {
        super(config);
    }

    async Callback(request: Callback<PaypalType.Callback.Main>, paymentId?: string): Promise<boolean> {
        try {
            const callback = request.payload;

            this.debug("Callback", "callback body", JSON.stringify(callback, null, 4));
            //TODO verify callback

            //only handle capture ,as we set auto capture
            switch (callback.event_type) {
                case PaypalType.Event.PAYMENT_CAPTURE_COMPLETED:
                    await this._registerCapture(callback as PaypalType.Callback.Capture);
                    break;
                case PaypalType.Event.PAYMENT_CAPTURE_REFUNDED:
                    await this._registerRefund(callback as PaypalType.Callback.Refund);
                    break;
            }
            return true;
        }
        catch (e) {
            this.debug("Callback", "Error", e);

            if (e instanceof BadRequestError) {
                return false;
            }

            throw new BadRequestError({ code: 400, message: `[${this.code}] Process callback error` });
        }
    }

    async Cancel(request: Response, paymentId: string): Promise<Process.Response.Response> {

        const req: PaypalType.PaymentResponse.Request = request.query;

        this.debug("ProcessCancel", JSON.stringify(req, null, 4));

        const entity = await this.getEntityById(paymentId);

        const status: Status = Status.CANCEL;

        try {
            const retry: boolean = await this.updateOrder({ status, id: entity.orderId });
            await entity.log4Redirect({ status, req, message: "redirect back from payment gateway" });
        }
        catch (e) {
            this.debug("Cancel", "Error", e)
        }

        return { status };
    }

    private _client() {
        return new checkoutNodeJssdk.core.PayPalHttpClient(this._environment());
    }

    private _environment(): unknown {
        const { clientId, clientSecret } = this;
        const { isLive } = this.config;
        return isLive ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret) : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
    }

    private _buildRequestBody(req: Process.Request, entity: IPaymentEntity): PaypalType.Payment.Request {
        const { realOrderId, currency, totalAmount, locale } = req;

        return {
            intent: PaypalType.Intent.CAPTURE,
            application_context: {
                return_url: this.responseURL,
                cancel_url: this.cancelURL,
                locale: PaypalHelper.GetLocale(locale, this.market),
                user_action: PaypalType.UserAction.PAY_NOW
            },
            purchase_units: [{
                custom_id: entity._id.toString(),
                invoice_id: this.FormatOrderId(realOrderId),
                description: this.config.paymentDescription || 'Infinitus Payment',
                amount: {
                    currency_code: currency,
                    value: totalAmount
                }
            }
            ]
        } as PaypalType.Payment.Request
    }

    protected async _processRequest(req: Process.Request, entity: IPaymentEntity): Promise<Process.Request.Response> {

        const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();

        const body = this._buildRequestBody(req, entity);

        this.debug("_makeOrder", "paypalRequest", JSON.stringify(body, null, 4));

        request.prefer("return=representation");

        request.requestBody(body);

        const response = await this._client().execute(request) as PaypalType.Payment.Response;

        const redirectUrl = response.result.links.find((e: any) => e.rel.toLowerCase() == "approve");

        return { body: response.result, redirectEndPoint: redirectUrl?.href || '' };

    }

    protected async _processResponse(data: PaypalType.PaymentResponse.Request, entity: IPaymentEntity): Promise<Process.Response.Response> {

        const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(data.token);

        request.requestBody({});

        this._response = await this._client().execute(request) as PaypalType.Capture.Response;

        this.debug("_processResponse", "capture response", JSON.stringify(this._response, null, 4));

        if (this._isSuccess && this._validateResponse(entity)) {
            return {
                status: Status.PAYMENT_REVIEW,
                data: {
                    authCode: this._response.result.purchase_units[0].payments.captures[0].id
                }
            };
        }

        return { status: Status.FAIL };
    }

    private async _registerCapture(req: PaypalType.Callback.Capture): Promise<void> {
        const entity: IPaymentEntity = await this.getEntityById(req.resource.custom_id) as IPaymentEntity;

        const status: Status = Status.PAYMENT_REVIEW;

        const retry: boolean = await this.updateOrder({
            status,
            data: { authCode: req.resource.id },
            id: entity.orderId
        });

        await entity.log4Callback({ status, req, message: `CAPTURED AMOUNT - ${req.resource.amount.currency_code} ${req.resource.amount.value}` });
    }

    private async _registerRefund(req: PaypalType.Callback.Refund): Promise<void> {
        const entity: IPaymentEntity = await this.getEntityById(req.resource.custom_id) as IPaymentEntity;

        const status: Status = Status.PAYMENT_REFUND;

        const retry: boolean = await this.updateOrder({
            status,
            id: entity.orderId
        });

        await entity.log4Callback({ status, req, message: `REFUND AMOUNT - ${req.resource.seller_payable_breakdown.total_refunded_amount?.currency_code} ${req.resource.seller_payable_breakdown.total_refunded_amount?.value}` });
    }
    private _validateResponse(entity: IPaymentEntity, token?: string) {
        const result = this._response.result.purchase_units[0];
        return !(
            typeof result.payments.captures == "undefined" ||
            typeof result.payments.captures[0].amount == "undefined" ||
            result.payments.captures[0].amount.value != entity.totalAmount);
    }

    private get _isSuccess() {
        return this._response.result.status === PaypalType.Status.COMPLETED;
    }

}