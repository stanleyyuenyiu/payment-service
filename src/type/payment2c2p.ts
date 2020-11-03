export namespace Payment  {
    export type Request = {
        version: string,
        merchant_id: string,
        payment_description:  string,
        order_id: string,
        invoice_no:string,
        currency: string,
        amount: string,
        customer_email ?:string,
        request_3ds: Request3ds,
        result_url_1: string,
        result_url_2: string,
        default_lang: string,
        payment_option: PaymentOption,
        hash_value: string
    }
}

export namespace PaymentResponse  {
    export type Request =  object & 
    {
        version:string, 
        request_timestamp:string, 
        merchant_id:string,
        order_id:string, 
        invoice_no:string, 
        currency:string, 
        amount:string, 
        transaction_ref:string,
        approval_code:string, 
        eci:string, 
        transaction_datetime:string, 
        payment_channel:string,
        payment_status:string, 
        channel_response_code:string, 
        channel_response_desc:string,
        masked_pan:string, 
        stored_card_unique_id:string, 
        backend_invoice:string, 
        paid_channel:string,
        paid_agent:string, 
        recurring_unique_id:string, 
        user_defined_1:string, 
        user_defined_2:string,
        user_defined_3:string, 
        user_defined_4:string, 
        user_defined_5:string, 
        browser_info:string, 
        ippPeriod:string, 
        ippInterestType:string,
        ippInterestRate:string, 
        ippMerchantAbsorbRate:string, 
        payment_scheme:string, 
        process_by:string,
        hash_value: string,
        mcp ?: string,
        mcp_amount ?: string,
        mcp_currency ?: string,
        mcp_exchange_rate ?: string,
    }
}

export enum Request3ds {
    Y = "Y",
    N =  "N",
    EMPTY = ""
}

export enum PaymentOption {
    WITHOUT_INSTALLMENT = "A",
    WITH_INSTALLMENT =  "B"
}

export enum Status {
    SUCCESS = "000",
    PENIND =  "001",
    CANCEL = "003" 
}
