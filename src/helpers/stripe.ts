export class StripeHelper {

    static FormatAmt(amt:number, currency:string):number {
        return amt * (StripeHelper.IsZeroDecimal(currency) ? 1: 100);
    };

    static DeFormatAmt(amt:number, currency:string):number {
        return amt / (StripeHelper.IsZeroDecimal(currency) ? 1: 100);
    };

    static IsZeroDecimal(currency:string) : boolean
    {
        return [
            "bif", "djf", "jpy", "krw", "pyg", "vnd", "xaf",
            "xpf", "clp", "gnf", "kmf", "mga", "rwf", "vuv", "xof"].indexOf(currency.toLowerCase()) >= 0 ;
    };
}