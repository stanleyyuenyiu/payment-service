const crypto = require("crypto");
import  * as Type2c2p from "@type/payment2c2p";
import "@lib/string.extensions";
export class Payment2c2pHelper
{
    static CURRENCY_CODE : Record<string, {Num:string, exponent:number }> = {
			"CLF" : {"Num" : "990","exponent" : 4},
			"BHD" : {"Num" : "048","exponent" : 3},
			"IQD" : {"Num" : "368","exponent" : 3},
			"JOD" : {"Num" : "400","exponent" : 3},
			"KWD" : {"Num" : "414","exponent" : 3},
			"LYD" : {"Num" : "434","exponent" : 3},
			"OMR" : {"Num" : "512","exponent" : 3},
			"TND" : {"Num" : "788","exponent" : 3},
			"AED" : {"Num" : "784","exponent" : 2},
			"AFN" : {"Num" : "971","exponent" : 2},
			"ALL" : {"Num" : "008","exponent" : 2},
			"AMD" : {"Num" : "051","exponent" : 2},
			"ANG" : {"Num" : "532","exponent" : 2},
			"AOA" : {"Num" : "973","exponent" : 2},
			"ARS" : {"Num" : "032","exponent" : 2},
			"AUD" : {"Num" : "036","exponent" : 2},
			"AWG" : {"Num" : "533","exponent" : 2},
			"AZN" : {"Num" : "944","exponent" : 2},
			"BAM" : {"Num" : "977","exponent" : 2},
			"BBD" : {"Num" : "052","exponent" : 2},
			"BDT" : {"Num" : "050","exponent" : 2},
			"BGN" : {"Num" : "975","exponent" : 2},
			"BMD" : {"Num" : "060","exponent" : 2},
			"BND" : {"Num" : "096","exponent" : 2},
			"BOB" : {"Num" : "068","exponent" : 2},
			"BOV" : {"Num" : "984","exponent" : 2},
			"BRL" : {"Num" : "986","exponent" : 2},
			"BSD" : {"Num" : "044","exponent" : 2},
			"BTN" : {"Num" : "064","exponent" : 2},
			"BWP" : {"Num" : "072","exponent" : 2},
			"BYN" : {"Num" : "933","exponent" : 2},
			"BZD" : {"Num" : "084","exponent" : 2},
			"CAD" : {"Num" : "124","exponent" : 2},
			"CDF" : {"Num" : "976","exponent" : 2},
			"CHE" : {"Num" : "947","exponent" : 2},
			"CHF" : {"Num" : "756","exponent" : 2},
			"CHW" : {"Num" : "948","exponent" : 2},
			"CNY" : {"Num" : "156","exponent" : 2},
			"COP" : {"Num" : "170","exponent" : 2},
			"COU" : {"Num" : "970","exponent" : 2},
			"CRC" : {"Num" : "188","exponent" : 2},
			"CUC" : {"Num" : "931","exponent" : 2},
			"CUP" : {"Num" : "192","exponent" : 2},
			"CZK" : {"Num" : "203","exponent" : 2},
			"DKK" : {"Num" : "208","exponent" : 2},
			"DOP" : {"Num" : "214","exponent" : 2},
			"DZD" : {"Num" : "012","exponent" : 2},
			"EGP" : {"Num" : "818","exponent" : 2},
			"ERN" : {"Num" : "232","exponent" : 2},
			"ETB" : {"Num" : "230","exponent" : 2},
			"EUR" : {"Num" : "978","exponent" : 2},
			"FJD" : {"Num" : "242","exponent" : 2},
			"FKP" : {"Num" : "238","exponent" : 2},
			"GBP" : {"Num" : "826","exponent" : 2},
			"GEL" : {"Num" : "981","exponent" : 2},
			"GHS" : {"Num" : "936","exponent" : 2},
			"GIP" : {"Num" : "292","exponent" : 2},
			"GMD" : {"Num" : "270","exponent" : 2},
			"GTQ" : {"Num" : "320","exponent" : 2},
			"GYD" : {"Num" : "328","exponent" : 2},
			"HKD" : {"Num" : "344","exponent" : 2},
			"HNL" : {"Num" : "340","exponent" : 2},
			"HRK" : {"Num" : "191","exponent" : 2},
			"HTG" : {"Num" : "332","exponent" : 2},
			"HUF" : {"Num" : "348","exponent" : 2},
			"IDR" : {"Num" : "360","exponent" : 2},
			"ILS" : {"Num" : "376","exponent" : 2},
			"INR" : {"Num" : "356","exponent" : 2},
			"IRR" : {"Num" : "364","exponent" : 2},
			"JMD" : {"Num" : "388","exponent" : 2},
			"KES" : {"Num" : "404","exponent" : 2},
			"KGS" : {"Num" : "417","exponent" : 2},
			"KHR" : {"Num" : "116","exponent" : 2},
			"KPW" : {"Num" : "408","exponent" : 2},
			"KYD" : {"Num" : "136","exponent" : 2},
			"KZT" : {"Num" : "398","exponent" : 2},
			"LAK" : {"Num" : "418","exponent" : 2},
			"LBP" : {"Num" : "422","exponent" : 2},
			"LKR" : {"Num" : "144","exponent" : 2},
			"LRD" : {"Num" : "430","exponent" : 2},
			"LSL" : {"Num" : "426","exponent" : 2},
			"MAD" : {"Num" : "504","exponent" : 2},
			"MDL" : {"Num" : "498","exponent" : 2},
			"MKD" : {"Num" : "807","exponent" : 2},
			"MMK" : {"Num" : "104","exponent" : 2},
			"MNT" : {"Num" : "496","exponent" : 2},
			"MOP" : {"Num" : "446","exponent" : 2},
			"MUR" : {"Num" : "480","exponent" : 2},
			"MVR" : {"Num" : "462","exponent" : 2},
			"MWK" : {"Num" : "454","exponent" : 2},
			"MXN" : {"Num" : "484","exponent" : 2},
			"MXV" : {"Num" : "979","exponent" : 2},
			"MYR" : {"Num" : "458","exponent" : 2},
			"MZN" : {"Num" : "943","exponent" : 2},
			"NAD" : {"Num" : "516","exponent" : 2},
			"NGN" : {"Num" : "566","exponent" : 2},
			"NIO" : {"Num" : "558","exponent" : 2},
			"NOK" : {"Num" : "578","exponent" : 2},
			"NPR" : {"Num" : "524","exponent" : 2},
			"NZD" : {"Num" : "554","exponent" : 2},
			"PAB" : {"Num" : "590","exponent" : 2},
			"PEN" : {"Num" : "604","exponent" : 2},
			"PGK" : {"Num" : "598","exponent" : 2},
			"PHP" : {"Num" : "608","exponent" : 2},
			"PKR" : {"Num" : "586","exponent" : 2},
			"PLN" : {"Num" : "985","exponent" : 2},
			"QAR" : {"Num" : "634","exponent" : 2},
			"RON" : {"Num" : "946","exponent" : 2},
			"RSD" : {"Num" : "941","exponent" : 2},
			"RUB" : {"Num" : "643","exponent" : 2},
			"SAR" : {"Num" : "682","exponent" : 2},
			"SBD" : {"Num" : "090","exponent" : 2},
			"SCR" : {"Num" : "690","exponent" : 2},
			"SDG" : {"Num" : "938","exponent" : 2},
			"SEK" : {"Num" : "752","exponent" : 2},
			"SGD" : {"Num" : "702","exponent" : 2},
			"SHP" : {"Num" : "654","exponent" : 2},
			"SLL" : {"Num" : "694","exponent" : 2},
			"SOS" : {"Num" : "706","exponent" : 2},
			"SRD" : {"Num" : "968","exponent" : 2},
			"SSP" : {"Num" : "728","exponent" : 2},
			"STD" : {"Num" : "678","exponent" : 2},
			"SVC" : {"Num" : "222","exponent" : 2},
			"SYP" : {"Num" : "760","exponent" : 2},
			"SZL" : {"Num" : "748","exponent" : 2},
			"THB" : {"Num" : "764","exponent" : 2},
			"TJS" : {"Num" : "972","exponent" : 2},
			"TMT" : {"Num" : "934","exponent" : 2},
			"TOP" : {"Num" : "776","exponent" : 2},
			"TRY" : {"Num" : "949","exponent" : 2},
			"TTD" : {"Num" : "780","exponent" : 2},
			"TWD" : {"Num" : "901","exponent" : 2},
			"TZS" : {"Num" : "834","exponent" : 2},
			"UAH" : {"Num" : "980","exponent" : 2},
			"USD" : {"Num" : "840","exponent" : 2},
			"USN" : {"Num" : "997","exponent" : 2},
			"UYU" : {"Num" : "858","exponent" : 2},
			"UZS" : {"Num" : "860","exponent" : 2},
			"VEF" : {"Num" : "937","exponent" : 2},
			"WST" : {"Num" : "882","exponent" : 2},
			"XCD" : {"Num" : "951","exponent" : 2},
			"YER" : {"Num" : "886","exponent" : 2},
			"ZAR" : {"Num" : "710","exponent" : 2},
			"ZMW" : {"Num" : "967","exponent" : 2},
			"ZWL" : {"Num" : "932","exponent" : 2},
			"MGA" : {"Num" : "969","exponent" : 1},
			"MRO" : {"Num" : "478","exponent" : 1},
			"BIF" : {"Num" : "108","exponent" : 0},
			"BYR" : {"Num" : "974","exponent" : 0},
			"CLP" : {"Num" : "152","exponent" : 0},
			"CVE" : {"Num" : "132","exponent" : 0},
			"DJF" : {"Num" : "262","exponent" : 0},
			"GNF" : {"Num" : "324","exponent" : 0},
			"ISK" : {"Num" : "352","exponent" : 0},
			"JPY" : {"Num" : "392","exponent" : 0},
			"KMF" : {"Num" : "174","exponent" : 0},
			"KRW" : {"Num" : "410","exponent" : 0},
			"PYG" : {"Num" : "600","exponent" : 0},
			"RWF" : {"Num" : "646","exponent" : 0},
			"UGX" : {"Num" : "800","exponent" : 0},
			"UYI" : {"Num" : "940","exponent" : 0},
			"VND" : {"Num" : "704","exponent" : 0},
			"VUV" : {"Num" : "548","exponent" : 0},
			"XAF" : {"Num" : "950","exponent" : 0},
			"XOF" : {"Num" : "952","exponent" : 0},
			"XPF" : {"Num" : "953","exponent" : 0},
	};

	static CURRENCY_EXP : Record<string, number> = {
		"1" : 10,
		"2" : 100,
		"3" : 1000,
		"4" : 10000,
		"5" : 100000
	};

	static LOCALE : Record<string, string>  = {
        "en" : "en",
        "th-th" : "th",
        "zh-tw" : "zh",
        "zh-cn" : "zh",
    } 

    static DEFAULT_LOCALE : string = "en";


	static GetCurrencyNumber(currency: string) : string
	{
		return Payment2c2pHelper.CURRENCY_CODE[currency]?.Num || "";
    }

    static FormatAmt(amt : number, currency : string) : string
    {
		const codes = Payment2c2pHelper.CURRENCY_CODE;

		if(typeof codes[currency] != "undefined"){

			const exponent : number = codes[currency].exponent;

			if (exponent && exponent > 0) {

				let exponents  = Payment2c2pHelper.CURRENCY_EXP[exponent.toString()];
				
				if(typeof exponents != "undefined")
				{
					amt = amt * exponents;
				}
			}
		}

		return amt.toString().padStart(12, "0");
    }

    static HashVal(data : Type2c2p.Payment.Request, secretkey : string)  : string {
    	let dataStr = "";
    	
    	const sortedKey = ["version","merchant_id","payment_description",
    	"order_id","invoice_no","currency","amount","customer_email",
    	"pay_category_id","promotion","user_defined_1","user_defined_2",
    	"user_defined_3","user_defined_4","user_defined_5","result_url_1","result_url_2",
    	"enable_store_card","stored_card_unique_id","request_3ds","recurring","order_prefix",
    	"recurring_amount","allow_accumulate","max_accumulate_amount","recurring_interval","recurring_count",
    	"charge_next_date","charge_on_date","payment_option","ipp_interest_type","payment_expiry","default_lang","statement_descriptor"];
		
		let dataStrs: string[] = [];
		Object.entries(data).forEach(([k,v]) => {
			
			if(sortedKey.indexOf(k) >= 0 && typeof v != "undefined" && !v.isNullOrEmpty())
			{
				dataStrs[sortedKey.indexOf(k)] = v
			}
		});
		
		return crypto.createHmac("sha1", secretkey)
                    .update(dataStrs.join(""))
                    .digest("hex");
    }

    static IsValidHash(data : Type2c2p.PaymentResponse.Request, secretkey : string) : boolean{

    	const sortedKey : string[] = ["version","request_timestamp","merchant_id",
    	"order_id","invoice_no","currency","amount","transaction_ref",
    	"approval_code","eci","transaction_datetime","payment_channel",
    	"payment_status","channel_response_code","channel_response_desc",
    	"masked_pan","stored_card_unique_id","backend_invoice","paid_channel",
    	"paid_agent","recurring_unique_id","user_defined_1","user_defined_2",
    	"user_defined_3","user_defined_4","user_defined_5","browser_info","ippPeriod","ippInterestType",
		"ippInterestRate","ippMerchantAbsorbRate","payment_scheme","process_by"];
		
		const dataStrs: string[] = [];
		Object.entries(data).forEach(([k, v]) => {
			if(sortedKey.indexOf(k) >= 0  && typeof v != "undefined" && !v.isNullOrEmpty())
			{
				dataStrs[sortedKey.indexOf(k)] = v
			}
		});

		return data["hash_value"].toUpperCase() == crypto.createHmac("sha1", secretkey)
                    .update(dataStrs.join(""))
                    .digest("hex").toUpperCase();
    }

    
    static GetLocale(locale : string) : string{
    	locale = locale || "en";

        let mapping : string = Payment2c2pHelper.LOCALE[locale.toLowerCase()] || "";

        return !mapping.isNullOrEmpty() ? mapping : Payment2c2pHelper.DEFAULT_LOCALE;
    }
}
