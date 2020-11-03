import Config  from '@config/config';
const Strapi = require('strapi-sdk-javascript').default;
const strapi = new Strapi(Config.strapi.host);
import { IPayment } from '@interface/payment'
import { Publicbank } from '@modules/payment-method/publicbank';
import { Paypal } from '@modules/payment-method/paypal';
import { Payment2c2pOnline } from '@modules/payment-method/payment2c2p-online';
import { Payment2c2pOffline } from '@modules/payment-method/payment2c2p-offline';
import { Ntt } from '@modules/payment-method/ntt';
import { Ctbc } from '@modules/payment-method/ctbc';
import { StripeCard } from '@modules/payment-method/stripe-card';
import { StripeAlipay } from '@modules/payment-method/stripe-alipay';
import { StripeWechat } from '@modules/payment-method/stripe-wechat';
import { PaymentConfig } from '@modules/payment-method/base/payment-config';
import {BadRequestError}  from '@lib/error';
type InterfaceComponent = (typeof Payment2c2pOnline) | 
(typeof Publicbank) | (typeof Paypal) | (typeof Payment2c2pOffline) | (typeof Ntt) | (typeof Ctbc) | (typeof StripeCard)
| (typeof StripeAlipay)| (typeof StripeWechat)
;

export class PaymentFactory<T extends IPayment = IPayment> {
    private static instance: any;
    private _paymentConfig: Array<any> = [];
    private _drivers: {[market:string] : { [key:string] : T } } = {};
    
    private _methods : Record<string, InterfaceComponent> = {
                    "publicbank":Publicbank,
                    "2c2p_online" : Payment2c2pOnline,
                    "2c2p_offline":Payment2c2pOffline,
                    "paypal":Paypal,
                    "ntt":Ntt,
                    "ctbc":Ctbc,
                    "stripe_card":StripeCard,
                    "stripe_alipay":StripeAlipay,
                    "stripe_wechat":StripeWechat
                };

    constructor() 
    {
    }

    async initConfig() : Promise<void> {
        console.log("-----------------------initConfig-----------------------", "call stripe api")
        await strapi.login(Config.strapi.user, Config.strapi.pwd);
        this._paymentConfig =  await strapi.getEntries('payments');
    }

    async driver(driver : string, market : string) : Promise<T>
    {
        if (driver == null) {
            throw new BadRequestError({ code: 400, message: `Unable to resolve NULL driver`});
        }

        if(this._paymentConfig.length < 1)
        {
            await this.initConfig();
        }
        
        if(typeof this._drivers[market] == "undefined")
        {
            this._drivers[market] = {};
        }

        if (typeof this._drivers[market][driver] == "undefined") {
            
            this._drivers[market][driver] = this.createDriver(driver, market);
        }

        return this._drivers[market][driver];
    }

    createDriver(driver: string, market:string ) : T
    {
        const config : any = this._paymentConfig.find((e:any) => e.identifier === driver && e.enabled 
                                                                    && e.markets.find((m:any) => m.identifier.toLowerCase() === market.toLowerCase()));

        if(typeof config != "undefined") {

            let _config = Object.assign(config, {});
            const _dynamicConfig:Record<string, string> = {};
            if(typeof _config.configuration != "undefined")
            {
                for (let e of _config.configuration) {
                    if(e.__component == "config.config"){
                        _dynamicConfig[e.key] =  e.value;
    
                    }else if(e.__component == "file.file"){
                        _dynamicConfig[e.key] =  e.file[0].url;
                    }
                }
    
                delete _config.configuration;
            }
            
            delete _config.created_by;
            delete _config.updated_by;
            delete _config.created_at;
            delete _config.updated_at;

            const obj  = this._methods[driver.toLowerCase()];
            if(obj != undefined)
            {
                return new obj( 
                    new PaymentConfig({
                        ..._config, 
                        configurations: _dynamicConfig, 
                        id: _config.identifier
                    })
                ) as any;
            } 
        }
        throw new BadRequestError({ code: 400, message: `Driver [${driver}] not supported.`});
    }

    static getInstance<K extends IPayment>(): PaymentFactory<K> {
        if (!PaymentFactory.instance) {
            PaymentFactory.instance = new PaymentFactory<K>();
        }
        return PaymentFactory.instance as PaymentFactory<K>;
    }
}
