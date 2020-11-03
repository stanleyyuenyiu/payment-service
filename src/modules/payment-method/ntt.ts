import { ScheduleRedirect } from "@modules/payment-method/base/schedulable"
import { Process } from "@type/request-response";
import { NttHelper } from "@helpers/ntt";
import { Status, PaymentMethod } from "@type/constants";
import * as NttType from "@type/ntt";
import { IPaymentConfig } from "@interface/payment";
import asios, { AxiosResponse } from "axios";
import { IPaymentEntity } from "@interface/payment-entities"
import { BadRequestError } from '@lib/error';
export class Ntt extends ScheduleRedirect {

    static CODE: string = "ntt";
    code: string = Ntt.CODE;
    methodType: PaymentMethod = PaymentMethod.REDIRECT

    protected startDateBuffer: number = (5 * 3600);
    protected toDateBuffer: number = 0;
    protected scheduledStatus: Status[] = [Status.PENDING, Status.PENDING_PAYMENT];
    protected apiTestUrl = 'https://sandbox.ndhkpay.com/Ndhk_Api/v3/requeryRequest';
    protected apiLiveUrl = 'https://prod.ndhkpay.com/Ndhk_Api/v3/requeryRequest';

    protected get clientId(): string { return this.config.Get("clientId") };
    protected get clientSecret(): string { return this.config.Get("clientSecret") };
    protected get hashKey(): string { return this.config.Get("hashKey") };


    constructor(config: IPaymentConfig) {
        super(config);
        this.config.prefix = "UAT";
    }

    private _buildRequest(req: Process.Request): NttType.Payment.Request {
        const { clientId, clientSecret, hashKey, responseURL, callbackURL } = this;
        const { currency, totalAmount, realOrderId, locale } = req;
        const request = {
            login: clientId,
            pass: clientSecret,
            txncurr: currency,
            amt: NttHelper.FormatAmt(totalAmount, currency),
            txnid: this.FormatOrderId(realOrderId),
            od: this.config.paymentDescription || "Infinitus Order",
            ru: responseURL,
            callbackUrl: callbackURL,
            useLimit: 1,
            lang: NttHelper.GetLocale(locale)
        } as NttType.Payment.Request;

        const signature: string = NttHelper.HashVal(
            { clientId, clientSecret, txnid: request.txnid, amt: request.amt, txncurr: request.txncurr, hashKey });

        request.signature = signature;

        return request;
    }

    protected async _processRequest(req: Process.Request, entity: IPaymentEntity): Promise<Process.Request.Response> {
        const request = this._buildRequest(req);
        let url = this.config.isLive ? this.liveEnv : this.testEnv;
        url = `${url}/hostPage/createPaymentLink`;
        const r: AxiosResponse<NttType.Payment.Response> = await asios.post(url, request, { headers: { "Content-Type": "application/json" } });

        this.debug("_processRequest", r.status, r.data);

        if (r.data.respcode == NttType.Status.SUCCESS && typeof r.data.result != "undefined") {
            return {
                body: r.data,
                redirectEndPoint: r.data.result
            } as Process.Request.Response;
        }
        throw new BadRequestError({ code: 400, message: `[${this.code}] Cant Encrypt data , because ${r.data.respdesc}` });
    }

    protected async _processResponse(req: NttType.PaymentReponse.Request, entity: IPaymentEntity): Promise<Process.Response.Response> {
        let status = Status.FAIL

        if (this._validateResponse(req, entity)) {
            switch (req.respcode) {
                case NttType.Status.CANCEL:
                    status = Status.CANCEL;
                    break;
                case NttType.Status.SUCCESS:
                    status = Status.PAYMENT_REVIEW;
                    return {
                        status, data: {
                            authCode: req.auth_code
                        }
                    }
                case NttType.Status.OFFLINE:
                    status = Status.PENDING_PAYMENT;
                    break;
            }
        }
        return { status };
    }

    private _validateResponse(req: NttType.PaymentReponse.Request, entity: IPaymentEntity): boolean {
        const { respcode, txncurr, amt, txnid, signature } = req;

        const { clientId, clientSecret, hashKey } = this;

        if (
            typeof respcode == "undefined" ||
            typeof txncurr == "undefined" ||
            typeof amt == "undefined" ||
            typeof txnid == "undefined" ||
            typeof signature == "undefined" ||
            amt != entity.totalAmount
        ) {
            return false;
        }
        const hashVal = NttHelper.HashVal(hashKey, clientId, clientSecret, txnid || "", (amt || "").toString(), txncurr).toLowerCase();

        return hashVal == signature.toLowerCase();
    }

    protected getAPIUrl(): string {
        return this.config.isLive ? this.apiLiveUrl : this.apiTestUrl;
    }

    protected async _processSchedule(entities: IPaymentEntity[]): Promise<void> {

        const { clientId, clientSecret, hashKey } = this;

        let error: any[] = [];

        await entities.forEach(async (e: IPaymentEntity) => {

            const querySignature = NttHelper.HashVal(hashKey, clientId, clientSecret, this.FormatOrderId(e.realOrderId)).toLowerCase();

            const request = {
                login: clientId,
                pass: clientSecret,
                txnid: this.FormatOrderId(e.realOrderId),
                signature: querySignature
            } as NttType.Query.Request;

            const r: AxiosResponse<NttType.Query.Response> = await asios.post(this.getAPIUrl(), request, { headers: { "Content-Type": "application/json" } });

            this.debug("_processSchedule", this.FormatOrderId(e.realOrderId), JSON.stringify(r.data, null, 4));

            if (r.data.respcode == NttType.Query.RespCode.COMPLETED) {
                const signature = NttHelper.HashVal(hashKey, clientId, clientSecret, r.data.txnid || "", r.data.respcode || "").toLowerCase();

                if (signature != r.data.signature) {
                    await e.log4Schedule({ message: "signature invalid" });
                    return;
                }

                try {
                    const status = Status.PAYMENT_REVIEW;
                    const retry: boolean = await this.updateOrder({
                        status,
                        data: {
                            authCode: r.data.auth_code
                        },
                        id: e.orderId
                    });
                    await e.log4Schedule({ status, req: r.data, message: "Process schedule success" });
                }
                catch (ex) {
                    error.push(ex);
                }

            } else {

                try {
                    const status = Status.FAIL;
                    const retry: boolean = await this.updateOrder({ status, id: e.orderId });
                    await e.log4Redirect({ status, req: r.data, message: `Payment was failed - response desc:${r.data.respdesc}` });
                }
                catch (ex) {
                    error.push(ex);
                }
            }
        })

        if (error.length > 0) {
            throw new BadRequestError({ code: 400, message: `[${this.code}] Cant run schedule` });
        }

    }
}
