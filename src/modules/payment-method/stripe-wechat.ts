'use strict';
import { StripeCard } from '@modules/payment-method/stripe-card'
import { Process } from '@type/request-response';
import StripeSDK from "stripe";
import { IPaymentEntity } from "@interface/payment-entities";
import { StripeHelper } from '@helpers/stripe';
import { BadRequestError } from "@lib/error";
export class StripeWechat extends StripeCard {
  static CODE = 'stripe_wechat';
  code = StripeWechat.CODE;

  protected _buildSourceRequest(req: Process.Request, entity: IPaymentEntity): StripeSDK.SourceCreateParams {
    const { currency, totalAmount, realOrderId } = req;

    return {
      amount: StripeHelper.FormatAmt(totalAmount, currency),
      currency: currency,
      statement_descriptor: `Order #: ${this.FormatOrderId(realOrderId)}`,
      metadata: { id: entity._id.toString() },
      type: "wechat"
    } as StripeSDK.SourceCreateParams;
  }

  protected async _processRequest(req: Process.Request, entity: IPaymentEntity): Promise<Process.Request.Response> {
    try {
      const param = this._buildSourceRequest(req, entity);
      let response = await this.stripe.sources.create(param);
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
}