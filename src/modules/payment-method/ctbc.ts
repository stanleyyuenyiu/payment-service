import { ScheduleRedirect } from "@modules/payment-method/base/schedulable"
import { IPaymentConfig } from "@interface/payment";
import { Process } from "@type/request-response";
import { Status } from "@type/constants";
import * as CtbcType from "@type/ctbc";
import { IPaymentEntity } from "@interface/payment-entities";
import asios, { AxiosResponse } from "axios";
import Config from "config/config";
import { Settle } from "@type/order";
import { BadRequestError } from '@lib/error';
export class Ctbc extends ScheduleRedirect {

    static CODE: string = "ctbc";
    code: string = Ctbc.CODE;

    protected startDateBuffer: number = (5 * 3600);
    protected toDateBuffer: number = 0;
    protected scheduledStatus: Status[] = [Status.PENDING];
    protected testUrl: string = "https://testepos.ctbcbank.com/auth/SSLAuthUI.jsp";
    protected liveUrl: string = "https://epos.ctbcbank.com/auth/SSLAuthUI.jsp";
    protected apiTestUrl = "testepos.chinatrust.com.tw";
    protected apiLiveUrl = "epos.chinatrust.com.tw";

    protected get clientId(): string { return this.config.Get("clientId") };
    protected get merId(): string { return this.config.Get("merId") };
    protected get terminalId(): string { return this.config.Get("terminalId") };
    protected get clientSecret(): string { return this.config.Get("clientSecret") };

    constructor(config: IPaymentConfig) {
        super(config);
        config.testUrl = this.testUrl;
        config.liveUrl = this.testUrl;
    }

    private _buildEncryptRequest(req: Process.Request): CtbcType.Encrypt.Request {
        const { clientId, clientSecret, terminalId, responseURL } = this;
        const { currency, totalAmount, realOrderId, locale } = req;
        const request = {
            MerchantID: clientId,
            TerminalID: terminalId,
            OrderNo: this.FormatOrderId(realOrderId),
            AuthAmt: Math.floor(totalAmount).toString(),
            TxType: "0",
            Option: "1",
            Key: clientSecret,
            MerchantName: "Infinitus",
            AuthResURL: responseURL,
            AutoCap: "1",
            Customize: "1"
        } as CtbcType.Encrypt.Request;

        return request;
    }

    private _buildDecryptRequest(req: CtbcType.PaymentReponse.Request): CtbcType.Decrypt.Request {
        const { clientSecret } = this;
        const request = {
            URLResEnc: req.URLResEnc,
            key: clientSecret
        } as CtbcType.Decrypt.Request
        return request;
    }

    protected async _processRequest(req: Process.Request, entity: IPaymentEntity): Promise<Process.Request.Response> {
        const request = this._buildEncryptRequest(req);
        this.debug("_processRequest", request);
        const r: AxiosResponse<CtbcType.Encrypt.Response> = await asios.post(`${Config.ctbcProxyApi.host}/encrypt`, request, { headers: { "Content-Type": "application/json" } });
        if (r.data.success) {
            return {
                body: {
                    merID: this.merId,
                    URLEnc: r.data.result
                }
            } as Process.Request.Response;
        }
        throw new BadRequestError({ code: 400, message: `[${this.code}] Cant Encrypt data , because ${r.data.error}` });
    }

    protected async _processResponse(req: CtbcType.PaymentReponse.Request, entity: IPaymentEntity): Promise<Process.Response.Response> {
        const request: CtbcType.Decrypt.Request = this._buildDecryptRequest(req);

        const r: AxiosResponse<CtbcType.Decrypt.Response> = await asios.post(`${Config.ctbcProxyApi.host}/decrypt`, request, { headers: { "Content-Type": "application/json" } });

        if (r.data.success && r.data.result.status == CtbcType.Status.CANCEL && r.data.result.errCode == CtbcType.ErrCode.CANCEL) {
            return { status: Status.CANCEL };
        }
        if (r.data.success && this._validateResponse(r.data, entity)) {
            return {
                status: Status.PAYMENT_REVIEW, data: {
                    authCode: r.data.result.authCode,
                    lastFourDigitPAN: r.data.result.last4digitPAN
                }
            };
        }
        return { status: Status.FAIL };
    }

    private _validateResponse(req: CtbcType.Decrypt.Response, entity: IPaymentEntity): boolean {
        if (
            req.error != null ||
            parseInt(req.result.authAmt) - entity.totalAmount != 0
        ) {
            return false;
        }
        return true;
    }

    protected async _processSchedule(entities: IPaymentEntity[]): Promise<void> {
        let error: any[] = [];

        await entities.forEach(async (e: IPaymentEntity) => {

            const request = {
                ServerName: this.getAPIUrl(),
                Amt: Math.floor(e.totalAmount),
                MerID: 3435,
                OrderNo: this.FormatOrderId(e.realOrderId)
            } as CtbcType.Query.Request;

            const r: AxiosResponse<CtbcType.Query.Response> = await asios.post(`${Config.ctbcProxyApi.host}/query`, request, { headers: { "Content-Type": "application/json" } });

            this.debug("_processSchedule", this.FormatOrderId(e.realOrderId), JSON.stringify(r.data, null, 4));

            let status = Status.FAIL;
            let data: Settle | undefined = undefined;
            if (r.data.success && (r.data.result.queryCode == CtbcType.Query.Status.FIND || r.data.result.queryCode == CtbcType.Query.Status.FIND_MORE_THAN_ONE)) {
                if (r.data.result.errCode == CtbcType.ErrCode.CANCEL) {
                    status = Status.CANCEL;
                }
                else if (r.data.result.currentState == CtbcType.State.PAID) {
                    status = Status.PAYMENT_REVIEW;
                    data = {
                        authCode: r.data.result.authCode,
                        lastFourDigitPAN: r.data.result.pan.substr(r.data.result.pan.length - 4)
                    }
                }
            }

            try {
                const retry: boolean = await this.updateOrder({ status, data, id: e.orderId });
                await e.log4Schedule({ status, req: r.data, message: "Process schedule done" });
            }
            catch (ex) {
                error.push(ex);
            }
        });

        if (error.length > 0) {
            throw new BadRequestError({ code: 400, message: `[${this.code}] Cant run schedule` });
        }
    }

    protected getAPIUrl(): string {
        return this.config.isLive ? this.apiLiveUrl : this.apiTestUrl;
    }
}

