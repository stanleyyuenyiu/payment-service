export enum Intent {
    CAPTURE = "CAPTURE",
    AUTHORIZE = "AUTHORIZE"
}
export enum UserAction {
    CONTINUE = "CONTINUE",
    PAY_NOW = "PAY_NOW"
}
export enum Status {
    CREATED = "CREATED",
    SAVED = "SAVED",
    APPROVED = "APPROVED",
    VOIDED = "VOIDED",
    COMPLETED = "COMPLETED"
}
export enum DisbursementMode {
    INSTANT = "INSTANT",
    DELAYED = "DELAYED"
}

export enum Event {
    CHECKOUT_ORDER_APPROVED = "CHECKOUT.ORDER.APPROVED",
    PAYMENT_CAPTURE_COMPLETED = "PAYMENT.CAPTURE.COMPLETED",
    PAYMENT_CAPTURE_REFUNDED = "PAYMENT.CAPTURE.REFUNDED"
}


export namespace Payment {
    export type Request = {
        intent: Intent;
        application_context: AapplicationContext,
        purchase_units : PurchaseUnits[]
    }

    export type Response = {
        result: {
            id: string,
            intent: Intent,
            status: Status,
            purchase_units : PurchaseUnits[],
            links: Link[]
        }
    }

    export type AapplicationContext = {
        return_url: string,
        cancel_url: string,
        locale: string,
        user_action: UserAction,
    }  
}

export namespace PaymentResponse {
    export type Request = {
        token?:string
    }
}

export namespace Capture {
    
    export type Response = object & {
        result: {
            id: string,
            status: Status,
            purchase_units : Capture.CapturePurchaseUnits[],
            payer: Paypee,
            links: Link[]
        }
    } 

    export type CapturePurchaseUnits = PurchaseUnits & {
        payments : {
            captures : {
                id:  string,
                status : Status,
                amount ?: Amount,
                invoice_id: string,
                custom_id: string,
                links: Link[]
                seller_protection ?: {status:string,dispute_categories : string[]}
                final_capture: boolean,
                disbursement_mode: DisbursementMode,
                seller_receivable_breakdown ?: SellerBreakdown
            }[]
        }
    }
    
}

export namespace Callback {

    export type Main = Approve | Capture | Refund

    export type Approve = {
        event_type : Event,
        resource: {
            purchase_units : PurchaseUnits[],
            links: Link[],
            id:string,
            intent: Intent,
            payer: Paypee,
            status: Status
        },
        status: Status,
        links: Link[]
    }

    export type Capture = {
        event_type : Event,
        resource: {
            amount: Amount,
            final_capture: boolean,
            custom_id:string,
            invoice_id:string,
            links: Link[],
            id:string,
            status: Status
        },
        status: Status,
        links: Link[]
    }

    export type Refund = {
        event_type : Event,
        resource: {
            amount: Amount,
            custom_id:string,
            invoice_id:string,
            links: Link[],
            id:string,
            status: Status
            seller_payable_breakdown: SellerBreakdown
        },
        status: Status,
        links: Link[]
    }
}

export type PurchaseUnits = {
    custom_id: string,
    invoice_id: string,
    description: string,
    amount: Amount,
    reference_id ?: string,
    payee ?: Paypee
}

export type Amount = {
    currency_code: string,
    value: number
}

export type Paypee = {
    email_address: string,
    merchant_id?: string,
    name ?: { given_name:string, surname: string },
    address?: { country_code:  string }
    payer_id ?: string,
}

export type Link = {
    href: string,
    rel: string,
    method: string
}

export type SellerBreakdown = { gross_amount ?: Amount, paypal_fee ?: Amount , net_amount ?: Amount, total_refunded_amount ?:Amount}

