'use strict';
import { IPaymentConfig, ICallbackable } from '@interface/payment';
import { PaymentAbstract } from '@modules/payment-method/base/abstract'
import { Process } from '@type/request-response';
import StripeSDK from "stripe";
import { Status } from '@type/constants';
import PaymentEntity from 'models/payment';
import { IPaymentEntity } from "@interface/payment-entities"
const ObjectId = require('mongodb').ObjectID;
import { eEventType } from '@type/stripe';
import { StripeHelper } from '@helpers/stripe';
import * as Hapi from "@hapi/hapi";
import { Settle } from '@type/order';
import { BadRequestError, HttpStatusCode } from "@lib/error";
export class StripeCard extends PaymentAbstract implements ICallbackable {
  static CODE = 'stripe_card';
  code = StripeCard.CODE;

  protected get clientId(): string { return this.config.Get("clientId") };
  protected get webhookSecret(): string { return this.config.Get("webhookSecret") };
  protected stripe: StripeSDK;

  constructor(config: IPaymentConfig) {
    super(config);
    this.stripe = new StripeSDK(this.clientId, {
      apiVersion: '2020-03-02',
    });
  }

  async Callback(request: Hapi.Request, paymentId?: string): Promise<boolean> {
    try {
      this.debug("Callback", "callback body", request.payload.toString('utf8'));
      try {
        const signature = request.headers['stripe-signature'];
        let event = this.stripe.webhooks.constructEvent(
          request.payload as Buffer,
          signature,
          this.webhookSecret
        );
      } catch (err) {
        //  console.log(`Webhook signature verification failed.`, err);
      }

      const payload = JSON.parse(request.payload.toString("utf-8")) as StripeSDK.Event;

      switch (payload.type) {
        case eEventType.CHARGE_SUCCESS:
          await this._registerCapture(payload.data.object as StripeSDK.Charge);
          break;
        case eEventType.CHARGE_FAIL:
          await this._registerFail(payload.data.object as StripeSDK.Charge);
          break;
        case eEventType.CHARGE_REFUND:
          await this._registerRefund(payload.data.object as StripeSDK.Charge);
          break;
        case eEventType.DISPUTE_CREATED:
          await this._registerDispute(payload.data.object as StripeSDK.Dispute);
          break;
        case eEventType.DISPUTE_CLOSED:
          await this._registerDisputeClose(payload.data.object as StripeSDK.Dispute);
          break;
        //wechatpay
        case eEventType.SOURCE_CHARGEABLE:
          await this._registerCharge(payload.data.object as StripeSDK.Source);
          break;
        //wechatpay
        case eEventType.SOURCE_FAILED:
        case eEventType.SOURCE_CANCEL:
          await this._registerChargeFail(payload.data.object as StripeSDK.Source);
          break;
        //alipay
        case eEventType.INTENT_PAID_FAIL:
          await this._registerIntentFail(payload.data.object as StripeSDK.PaymentIntent);
          break;
      }
      return true;
    }
    catch (e) {
      this.debug(e);
      if (e instanceof BadRequestError) {
        return false;
      }
      throw e;
    }
  }

  protected _buildIntentRequest(req: Process.Request, entity: IPaymentEntity): StripeSDK.PaymentIntentCreateParams {
    const { currency, totalAmount, realOrderId } = req;

    return {
      amount: StripeHelper.FormatAmt(totalAmount, currency),
      currency: currency,
      payment_method_types: ['card'],
      description: `Order #: ${this.FormatOrderId(realOrderId)}`,
      payment_method_options: {
        card: { request_three_d_secure: "any" }
      },
      metadata: { id: entity._id.toString() }
    } as StripeSDK.PaymentIntentCreateParams;
  }

  protected _buildChargeRequest(req: StripeSDK.Source, entity: IPaymentEntity): StripeSDK.ChargeCreateParams {
    return {
      amount: req.amount,
      currency: req.currency,
      source: req.id,
      description: `Order #: ${this.FormatOrderId(entity.realOrderId)}`,
      metadata: { id: entity._id.toString() }
    } as StripeSDK.ChargeCreateParams;
  }

  protected async _processRequest(req: Process.Request, entity: IPaymentEntity): Promise<Process.Request.Response> {
    try {
      const param = this._buildIntentRequest(req, entity);
      let response = await this.stripe.paymentIntents.create(param);
      return { body: response } as Process.Request.Response;
    } catch (err) {

      if (typeof err.type != undefined) {
        this.debug("ProcessRequest", "Error", err)
        throw new BadRequestError({ code: 400, message: `[${this.code}] Process Request Error, because ${err.type}` });
      }
      throw err;
      switch (err.type) {
        case 'StripeCardError':
          // A declined card error
          err.message; // => e.g. "Your card's expiration year is invalid."
          break;
        case 'StripeRateLimitError':
          // Too many requests made to the API too quickly
          break;
        case 'StripeInvalidRequestError':
          // Invalid parameters were supplied to Stripe's API
          break;
        case 'StripeAPIError':
          // An error occurred internally with Stripe's API
          break;
        case 'StripeConnectionError':
          // Some kind of error occurred during the HTTPS communication
          break;
        case 'StripeAuthenticationError':
          // You probably used an incorrect API key
          break;
        default:
          // Handle any other types of unexpected errors
          break;
      }
    }
  }

  private async _getEntityById(id: string): Promise<IPaymentEntity> {
    const entity = await PaymentEntity.findOne(
      {
        _id: ObjectId(id),
        method: this.code
      }
    ) as IPaymentEntity;

    if (!entity || !entity._id) {
      throw new BadRequestError({ code: 404, message: `[${this.code}] Record not found` }, HttpStatusCode.NOT_FOUND);
    }

    return entity
  }

  private async _registerCapture(req: StripeSDK.Charge): Promise<void> {
    const entity: IPaymentEntity = await this._getEntityById(req.metadata["id"]) as IPaymentEntity;

    const status: Status = Status.PAYMENT_REVIEW;

    let data: Settle = {};

    if (req.payment_method_details?.type == "card") {
      data.lastFourDigitPAN = req.payment_method_details?.card?.last4;
      data.authCode = req.id;
    }

    const retry: boolean = await this.updateOrder({ status, data, id: entity.orderId });

    await entity.log4Callback({ status, req, message: `CAPTURED AMOUNT - ${req.currency} ${StripeHelper.DeFormatAmt(req.amount, req.currency)}` });
  }

  private async _registerCharge(req: StripeSDK.Source): Promise<void> {

    if (!req.metadata || !req.metadata["id"]) {
      throw new BadRequestError({ code: 400, message: `[${this.code}] No Record Id Provided` });
    }
    if (req.amount == null || req.currency == null) {
      throw new BadRequestError({ code: 400, message: `[${this.code}] No Charge information [amount][currency] Provided` });
    }

    const entity: IPaymentEntity = await this._getEntityById(req.metadata["id"]) as IPaymentEntity;

    const result = await this.stripe.charges.create(this._buildChargeRequest(req, entity));

    this.debug("_registerCharge", result);

    await entity.log4Callback({ req, message: `CHARGE SUCCESS - ${req.currency} ${StripeHelper.DeFormatAmt(req.amount, req.currency)}` });
  }

  private async _registerChargeFail(req: StripeSDK.Source): Promise<void> {

    if (!req.metadata || !req.metadata["id"]) {
      throw new BadRequestError({ code: 400, message: `[${this.code}] No Record Id Provided` });
    }
    if (req.amount == null || req.currency == null) {
      throw new BadRequestError({ code: 400, message: `[${this.code}] No Charge information [amount][currency] Provided` });
    }

    const entity: IPaymentEntity = await this._getEntityById(req.metadata["id"]) as IPaymentEntity;

    const status: Status = Status.FAIL;

    const retry: boolean = await this.updateOrder({ status, id: entity.orderId });

    await entity.log4Callback({ status, req, message: `CHARGE FAIL/CANCEL - ${req.currency} ${StripeHelper.DeFormatAmt(req.amount, req.currency)}` });
  }

  private async _registerFail(req: StripeSDK.Charge): Promise<void> {
    const entity: IPaymentEntity = await this._getEntityById(req.metadata["id"]) as IPaymentEntity;

    const status: Status = Status.FAIL;

    const retry: boolean = await this.updateOrder({ status, id: entity.orderId });

    await entity.log4Callback({ status, req, message: `CAPTURED FAIL - ${req.outcome?.seller_message}` });
  }

  private async _registerIntentFail(req: StripeSDK.PaymentIntent): Promise<void> {
    const entity: IPaymentEntity = await this._getEntityById(req.metadata["id"]) as IPaymentEntity;

    const status: Status = Status.FAIL;

    const retry: boolean = await this.updateOrder({ status, id: entity.orderId });

    await entity.log4Callback({ status, req, message: `CAPTURED FAIL - ${req.last_payment_error?.message}` });
  }

  private async _registerRefund(req: StripeSDK.Charge): Promise<void> {
    const entity: IPaymentEntity = await this._getEntityById(req.metadata["id"]) as IPaymentEntity;

    const status: Status = req.amount - req.amount_refunded == 0 ? Status.CANCEL : entity.status as Status;

    const retry: boolean = await this.updateOrder({ status, id: entity.orderId });

    await entity.log4Callback({ status, req, message: `Refund Amount - ${req.currency} ${StripeHelper.DeFormatAmt(req.amount_refunded, req.currency)}, remained ${req.currency} ${StripeHelper.DeFormatAmt(req.amount - req.amount_refunded, req.currency)}` });
  }

  private async _registerDispute(req: StripeSDK.Dispute): Promise<void> {
    const entity: IPaymentEntity = await this._getEntityById(req.metadata["id"]) as IPaymentEntity;
    await entity.log4Callback({ req, message: `Disputed - ${req.reason}, dispute status : ${req.status.toString()} ` });
  }

  private async _registerDisputeClose(req: StripeSDK.Dispute): Promise<void> {
    const entity: IPaymentEntity = await this._getEntityById(req.metadata["id"]) as IPaymentEntity;
    await entity.log4Callback({ req, message: `Disputed - ${req.reason}, dispute status : ${req.status.toString()} ` });
  }
}