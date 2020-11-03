import { PaymentRedirect } from '@modules/payment-method/base/redirect'
import { Callback, Process } from '@type/request-response';
import { Payment2c2pHelper } from '@helpers/payment2c2p';
import { Status } from '@type/constants';
import { IPaymentEntity } from "@interface/payment-entities";
import * as Type2c2p from '@type/payment2c2p';
import { ICallbackable, IPaymentConfig } from '@interface/payment';
import { BadRequestError, HttpStatusCode } from '@lib/error';
export class Payment2c2pOnline extends PaymentRedirect implements ICallbackable {

    static CODE: string = '2c2p_online';
    code: string = Payment2c2pOnline.CODE;


    private _response: Type2c2p.PaymentResponse.Request = {} as Type2c2p.PaymentResponse.Request;
    protected get clientId(): string { return this.config.Get("clientId") };
    protected get clientSecret(): string { return this.config.Get("clientSecret") };

    constructor(config: IPaymentConfig) {
        super(config);
    }

    async Callback(req: Callback<Type2c2p.PaymentResponse.Request>, paymentId: string): Promise<boolean> {
        try {
            const callback = req.payload;

            this.debug("Callback", JSON.stringify(callback, null, 4));

            const entity: IPaymentEntity = await this.getEntityById(paymentId) as IPaymentEntity;

            const response = await this._processResponse(callback, entity);
            //MAY CALL ORDER DOUBLE
            const retry = await this.updateOrder({
                status: response.status,
                data: response.data,
                id: entity.orderId
            });

            await entity.log4Callback({ status, req: callback });

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

    protected _buildOrderRequest(req: Process.Request): Type2c2p.Payment.Request {
        const { clientId, responseURL, callbackURL } = this;
        const { realOrderId, currency, totalAmount, locale, email } = req;

        let request = {
            version: "7.5",
            merchant_id: clientId,
            payment_description: this.config.paymentDescription || 'Infinitus Order',
            order_id: this.FormatOrderId(realOrderId),
            invoice_no: this.FormatOrderId(realOrderId),
            currency: Payment2c2pHelper.GetCurrencyNumber(currency),
            amount: Payment2c2pHelper.FormatAmt(totalAmount, currency),
            customer_email: email,
            request_3ds: Type2c2p.Request3ds.N,
            result_url_1: responseURL,
            result_url_2: callbackURL,
            default_lang: Payment2c2pHelper.GetLocale(locale),
            payment_option: Type2c2p.PaymentOption.WITHOUT_INSTALLMENT
        } as Type2c2p.Payment.Request

        return request;
    }

    protected async _processRequest(req: Process.Request, entity: IPaymentEntity): Promise<Process.Request.Response> {
        const { clientSecret } = this;
        let orderRequest = this._buildOrderRequest(req);
        let hash = Payment2c2pHelper.HashVal(orderRequest, clientSecret);
        return { body: { ...orderRequest, hash_value: hash } } as Process.Request.Response;
    }

    protected async _processResponse(req: Type2c2p.PaymentResponse.Request, entity: IPaymentEntity): Promise<Process.Response.Response> {
        this._response = req;

        let status = Status.FAIL

        if (this._validateResponse(req, entity)) {
            if (this._isCancel) {
                status = Status.CANCEL
            } else if (this._isSuccess) {
                status = Status.PAYMENT_REVIEW;
                return {
                    status, data: {
                        authCode: req.approval_code,
                        authDate: req.transaction_datetime
                    }
                }
            } else if (this._isPending) {
                status = Status.PENDING_PAYMENT
            }
        }
        return { status };
    }

    private _validateResponse(req: Type2c2p.PaymentResponse.Request, entity: IPaymentEntity): boolean {
        if (!req.order_id || req.amount != Payment2c2pHelper.FormatAmt(entity.totalAmount, entity.currency)) {
            return false;
        }
        return Payment2c2pHelper.IsValidHash(req, this.clientSecret)
    }

    private get _isCancel(): boolean {
        return this._response.payment_status == Type2c2p.Status.CANCEL;
    }

    private get _isSuccess(): boolean {
        return this._response.payment_status == Type2c2p.Status.SUCCESS;
    }

    private get _isPending(): boolean {
        return this._response.payment_status == Type2c2p.Status.PENIND;
    }
}

