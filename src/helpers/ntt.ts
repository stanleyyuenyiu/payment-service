const crypto = require("crypto");
export class NttHelper {

    static LOCALE : Record<string, string>  = {
        "en" : "en-us",
        "ko-kr" : "ko-kr",
        "zh-tw" : "zh-tw",
        "zh-cn" : "zh-cn",
    } 

    static DEFAULT_LOCALE : string = "en-us";

    static IsZeroDecimal(currency:string) : boolean
    {
        return [
            "bif", "djf", "jpy", "krw", "pyg", "vnd", "xaf",
            "xpf", "clp", "gnf", "kmf", "mga", "rwf", "vuv", "xof"].indexOf(currency.toLowerCase()) >= 0 ;
    };

    static FormatAmt(amt:number, currency:string):number {
        return amt * (NttHelper.IsZeroDecimal(currency) ? 1: 100);
    };
    
    static GetLocale(locale : string) : string{
    	locale = locale || "en";

        let mapping : string = NttHelper.LOCALE[locale.toLowerCase()] || "";
        console.log(locale, mapping)
        return !mapping.isNullOrEmpty() ? mapping.toLowerCase() : NttHelper.DEFAULT_LOCALE.toLowerCase();
    };

    static HashVal(data : {clientId : string, clientSecret: string, txnid: string, amt?: number, txncurr?: string, hashKey: string}) : string;
    static HashVal(hashKey:string, ...args: string[]) : string;
    static HashVal(...args: any[]) : string {
       
        if(typeof args[0] == "object")
        {
            let data = args[0];
            const dataStr: string = `${data.clientId}${data.clientSecret}${data.txnid}${(data.amt || "").toString()}${data.txncurr || ""}`;
            return crypto.createHmac("sha512", data.hashKey)
            .update(dataStr)
            .digest("hex");
        }
        
        const hashKey = args.shift(); // take 1st

        return crypto.createHmac("sha512", hashKey)
                .update(args.join(""))
                .digest("hex");
    }

}
