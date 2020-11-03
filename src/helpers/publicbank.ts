const crypto = require("crypto");

export class PublicbankHelper
{
    static DESC : Record<string,string> = {
            "RJ" : "Rejected – invalid hash value, fraud related, duplicate transaction ",
            "EP" : "Rejected – invalid input parameter",
            "N7" : "Declined – invalid CVV2",
            "00" : "Approved – transaction accepted",
            "01" : "Declined – refer to card issuer ",
            "02" : "Declined – refer to issuer special ",
            "03" : "Declined – invalid merchant ",
            "04" : "Declined – retain card",
            "05" : "Declined – do not honor",
            "06" : "Declined – error",
            "07" : "Declined – pick-up, fraud",
            "12" : "Declined – invalid",
            "13" : "Declined – invalid amount",
            "14" : "Declined – no card number found",
            "15" : "Declined – invalid issuer",
            "19" : "Declined – system time out",
            "21" : "Declined – no action taken for referral",
            "22" : "Declined – DUKPT error (Derived Unique Key Per Transaction) ",
            "30" : "Declined – format error",
            "34" : "Declined – suspected fraud",
            "38" : "Declined – number of pin tries exceeded",
            "41" : "Declined – pickup, lost",
            "43" : "Declined – pickup, stolen",
            "51" : "Declined – insufficient funds",
            "52" : "Declined – damage/upgrade to gold/erc/name",
            "53" : "Declined – no saving account",
            "54" : "Declined – card expired",
            "55" : "Declined – invalid pin",
            "57" : "Declined – transaction not permitted by issuer",
            "58" : "Declined – transaction not permitted to acquirer/terminal ",
            "61" : "Declined – exceed approval by STIP (Stand-in Processing) ",
            "62" : "Declined – restricted card",
            "63" : "Declined – security violation",
            "65" : "Declined – exceed withdraw count limit",
            "75" : "Declined – allowable number of pin tries exceeded",
            "76" : "Declined – invalid/non-existent to account specified ",
            "77" : "Declined – invalid/non-existent from account specified ",
            "78" : "Declined – invalid/non-existent to account specified ",
            "82" : "Declined – invalid CVV",
            "84" : "Declined – invalid authorization life cycle",
            "89" : "Declined – invalid terminal",
            "91" : "Declined – issuer or switch is inoperative",
            "93" : "Declined – transaction cannot be completed, violation of law ",
            "94" : "Declined – EDC duplicate settlement",
            "96" : "Declined – system malfunction",
            "97" : "Declined – encryption error",
            "98" : "Declined – SW didn‟t get reply from IS",
            "99" : "Rejected – system error"
    };

	 static HashVal(val: string) {
        return crypto.createHash("sha256")
                    .update(val)
                    .digest("base64");
    }

    static IsValidHash(hashedVal: string, hashstr: string) {
		return hashedVal == PublicbankHelper.HashVal(hashstr);
    }

    static FormatAmt(amt:number)
    {
    	return ( (Math.round( amt * 100 + Number.EPSILON ) / 100)  * 100).toString().padStart(12, "0");
    }

    static FormatOrderId(orderId : string, prefix : string = "", suffix : string = "")
    {
    	return `${prefix}${orderId.padEnd(20, "0")}${suffix}`;
    }

    static GetRealOrderId(orderId : string, prefix : string = "", suffix : string = "")
    {
    	return orderId.rtrim("0").ltrim("0").replace(prefix, "").replace(suffix, "");
    }
}
