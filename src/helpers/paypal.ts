const crypto = require('crypto');

export class PaypalHelper
{
	static LOCALE : Record<string, Record<string,string>> = {
        'us' : {
            'zh-tw' : 'en_US',
            'zh-cn' : 'zh_US',
            'en' : 'en_US',
        },
        'ca' : {
            'zh-tw' : 'CA',
            'zh-cn' : 'CA',
            'en' : 'CA',
            'fr_ca' : 'fr-CA',
        },
        'hk' : {
            'zh-tw' : 'zh-HK',
            'zh-cn' : 'zh-HK',
            'en' : 'en-HK',
        },
        'ph' : {
            'zh-tw' : 'ph-EN',
            'zh-cn' : 'ph-EN',
            'en' : 'ph-EN',
        },
        'sg' : {
            'zh-tw' : 'SG',
            'zh-cn' : 'SG',
            'en' : 'SG',
        },
        'mx' : {
            'es-es' : 'MX',
            'zh-cn' : 'en-US',
            'en' : 'en-US',
        },
        'th' : {
            'th-th' : 'th-TH',
            'en' : 'en-GB',
            'zh-cn' : 'en-GB',
        }
    }

    static DEFAULT_LOCALE = 'en-HK';

    static GetLocale(locale : string , market : string ){
    	locale = locale || 'en';
        let marketLocale = PaypalHelper.LOCALE[market.toLowerCase()] || '';

        const mapping = marketLocale ? marketLocale[locale.toLowerCase()] || '' : '';

        return mapping ? mapping : PaypalHelper.DEFAULT_LOCALE;
    }
}
