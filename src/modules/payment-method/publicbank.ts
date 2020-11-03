import { ScheduleRedirect } from "@modules/payment-method/base/schedulable"
import { IPaymentConfig } from '@interface/payment';
import { Process } from '@type/request-response';
import { PublicbankHelper } from '@helpers/publicbank';
import { Status } from '@type/constants';
import { IPaymentEntity } from "@interface/payment-entities";
import * as PbType from '@type/publicbank';
import asios, { AxiosResponse } from "axios";
import { BadRequestError } from '@lib/error';
export class Publicbank extends ScheduleRedirect {

    static CODE = 'publicbank';
    code = Publicbank.CODE;

    protected startDateBuffer: number = (5 * 3600);
    protected toDateBuffer: number = 0;
    protected scheduledStatus: Status[] = [Status.PENDING];
    protected apiTestUrl = 'https://uattds2.pbebank.com/PGW/Pay/Check';
    protected apiLiveUrl = 'https://ecom.pbebank.com/PGW/Pay/Check';

    private _parsedResponse: PbType.PaymentResponse.Request = {} as PbType.PaymentResponse.Request;
    protected get clientSecret(): string { return this.config.Get("clientSecret") };

    constructor(config: IPaymentConfig) {
        super(config);
    }

    protected async _processRequest(req: Process.Request, entity: IPaymentEntity): Promise<Process.Request.Response> {
        const { paymentType, realOrderId, totalAmount } = req;
        const { clientSecret } = this;
        const clientId = this.config.Get(`clientId_${paymentType}`) || '';

        if (!clientId) {
            throw new BadRequestError({ code: 400, message: `[${this.code}] clientId missing for [${Publicbank.CODE}][${paymentType}]` });
        }

        const invoiceNo = PublicbankHelper.FormatOrderId(this.FormatOrderId(realOrderId));

        const amount = PublicbankHelper.FormatAmt(totalAmount);

        const response = {
            merID: clientId,
            invoiceNo,
            amount,
            postURL: this.responseURL,
            securityMethod: "",
            securityKeyReq: PublicbankHelper.HashVal(`${invoiceNo}${amount}${clientSecret}${clientId}`)
        } as PbType.Payment.Request;

        return { body: response } as Process.Request.Response;
    }

    protected async _processResponse(req: { result: string, securityKeyRes: string }, entity: IPaymentEntity): Promise<Process.Response.Response> {
        this._parsedResponse = this._parseResponse(req);

        if (this._isCancel) {
            return { status: Status.CANCEL }
        } else if (this._isSuccess && await this._validateResponse(entity)) {
            return {
                status: Status.PAYMENT_REVIEW,
                data: {
                    authCode: this._parsedResponse.authCode,
                    lastFourDigitPAN: this._parsedResponse.PAN
                }
            }
        } else {
            return { status: Status.FAIL }
        };
    }

    protected async _processSchedule(entities: IPaymentEntity[]): Promise<void> {
        const { clientSecret } = this;

        let error: any[] = [];

        await entities.forEach(async (e: IPaymentEntity) => {
            if (!e.reference) {
                return;
            }
            const reference = JSON.parse(e.reference) as { body: { merID: string } };
            const request = {
                merID: reference.body.merID,
                invoiceNo: PublicbankHelper.FormatOrderId(this.FormatOrderId(e.realOrderId)),
                amount: PublicbankHelper.FormatAmt(e.totalAmount)
            } as PbType.Query.Request;

            const r: AxiosResponse<PbType.Query.Response> = await asios.post(this.getAPIUrl(), request, { headers: { "Content-Type": "application/json" } });

            const result = r.data;

            this.debug("_processSchedule", this.FormatOrderId(e.realOrderId), result);

            if (r.status != 200 || result.substr(0, 1) == PbType.Query.RespCode.NOT_FOUND) {
                return;
            }

            let response = {} as PbType.PaymentResponse.Request;

            response.status = result.substr(2, 2);
            response.errdesc = PublicbankHelper.DESC[response.status] || '';
            response.expiryDate = result.substr(34, 4) || '';
            response.invoiceNo = result.substr(10, 20) || '';
            response.PAN = result.substr(30, 4) || '';
            response.expiryDate = result.substr(34, 4) || '';
            response.amount = result.substr(38, 12) || '';
            response.authCode = result.substr(4, 6) || '';
            this._parsedResponse = response;
            if (this._isSuccess) {
                try {
                    const status = Status.PAYMENT_REVIEW;
                    const retry: boolean = await this.updateOrder({
                        status,
                        data: {
                            authCode: this._parsedResponse.authCode,
                            lastFourDigitPAN: this._parsedResponse.PAN
                        },
                        id: e.orderId
                    });
                    await e.log4Schedule({ status, req: response, message: "Process schedule done" });
                }
                catch (ex) {
                    error.push(ex);
                }
            } else {
                try {
                    const status = Status.FAIL;
                    const retry: boolean = await this.updateOrder({
                        status,
                        id: e.orderId
                    });
                    await e.log4Schedule({ status, req: response, message: `Payment was failed - response desc:${response.errdesc}` });
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

    private _parseResponse(req: { result: string, securityKeyRes: string }): PbType.PaymentResponse.Request {
        const { result, securityKeyRes } = req;

        let response = {} as PbType.PaymentResponse.Request;

        if (result.indexOf(";") > 0) {
            const err = result.split(";");
            response.error = err[1];
        }
        response.status = result.substr(0, 2);
        response.errdesc = PublicbankHelper.DESC[response.status] || '';
        response.expiryDate = result.substr(2, 6) || '';
        response.invoiceNo = result.substr(8, 20) || '';
        response.PAN = result.substr(28, 4) || '';
        response.expiryDate = result.substr(32, 4) || '';
        response.expiryDate = result.substr(36, 12) || '';
        response.ECI = result.substr(48, 2) || '';
        response.securityKeyRes = securityKeyRes || '';

        this.debug("#_parseResponse", response);

        return response;
    }

    private _validateResponse(entity: IPaymentEntity): boolean {

        const { authCode, invoiceNo, PAN, expiryDate, amount, securityKeyRes } = this._parsedResponse;

        if (!invoiceNo || amount != PublicbankHelper.FormatAmt(entity.totalAmount)) {
            return false;
        }

        return PublicbankHelper.IsValidHash(securityKeyRes, `${authCode}${invoiceNo}${this.clientSecret}${PAN}${expiryDate}${amount}`);
    }

    private get _isCancel(): boolean {
        return this._parsedResponse.status == PbType.Status.FAIL && (this._parsedResponse.error.indexOf("Cancel") > -1 || this._parsedResponse.error.indexOf("Auto cancelled") > -1);
    }

    private get _isSuccess(): boolean {
        return this._parsedResponse.status == PbType.Status.SUCCESS;
    }

    protected getAPIUrl(): string {
        return this.config.isLive ? this.apiLiveUrl : this.apiTestUrl;
    }
}

