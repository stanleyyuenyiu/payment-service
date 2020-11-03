import { IPaymentConfig } from '@interface/payment';
import { object } from '@hapi/joi';

export class PaymentConfig implements IPaymentConfig {

    id:String = "";
    prefix: string = "";
    suffix: string = "";
    path: string = "";
    debug: boolean = false;
    paymentDescription: string = "";
    enabled: boolean = false;
    isLive: boolean = false;
    config: unknown = {};
    markets: {identifier:string}[] = [];
    configurations: Record<string, string> = {}
    liveUrl:string = "";
    testUrl:string= "";


    constructor(init ?: Partial<PaymentConfig>) {
        Object.assign(this, init);
    }


    Get(key:string):string;
    Get(...args:string[]):string | {} {
        if(args.length == 1)
        {
            return this.configurations[args[0]];
        }
        let result : Record<string, string> = {};
        args.forEach((e:string)=>{
            result[e] = this.configurations[e];
        })

        return result;
    }
}