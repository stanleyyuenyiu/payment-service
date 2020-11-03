'use strict';
import { StripeCard } from '@modules/payment-method/stripe-card'
import { Process } from '@type/request-response';
import StripeSDK from "stripe";
import { IPaymentEntity } from "@interface/payment-entities";
import { StripeHelper } from '@helpers/stripe';

export class StripeAlipay extends StripeCard {
    static CODE = 'stripe_alipay';
    code = StripeAlipay.CODE;
    protected _buildIntentRequest(req: Process.Request, entity: IPaymentEntity): StripeSDK.PaymentIntentCreateParams {

        const { currency, totalAmount, realOrderId } = req;

        return {
            amount: StripeHelper.FormatAmt(totalAmount, currency),
            currency: currency,
            payment_method_types: ['alipay'],
            description: `Order #: ${this.FormatOrderId(realOrderId)}`,
            payment_method_data: {
                type: "alipay"
            },
            metadata: { id: entity._id.toString() }
        } as StripeSDK.PaymentIntentCreateParams;


    }
}