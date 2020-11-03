

export enum eEventType {
    CHARGE_SUCCESS = "charge.succeeded",
    CHARGE_FAIL = "charge.failed",
    CHARGE_REFUND = "charge.refunded",
    DISPUTE_CREATED = "charge.dispute.created",
    DISPUTE_CLOSED = "charge.dispute.closed",
    SOURCE_CHARGEABLE = "source.chargeable",
    SOURCE_FAILED = "source.failed",
    SOURCE_CANCEL = "source.canceled",
    INTENT_PAID_FAIL = "payment_intent.payment_failed"
}

export class CustomError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}