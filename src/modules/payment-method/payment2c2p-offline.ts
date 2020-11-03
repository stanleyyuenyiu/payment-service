'use strict';
import { Payment2c2pOnline } from '@modules/payment-method/payment2c2p-online';
import { Process } from '@type/request-response';
import * as Type2c2p from '@type/payment2c2p';
export class Payment2c2pOffline extends Payment2c2pOnline {

    static CODE = '2c2p_offline';
    code = Payment2c2pOffline.CODE;

    protected _buildOrderRequest(req: Process.Request): Type2c2p.Payment.Request {
        let orderRequest = super._buildOrderRequest(req);
        orderRequest.request_3ds = Type2c2p.Request3ds.EMPTY;
        return orderRequest;
    }
}