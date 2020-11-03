import {PaymentAbstract} from '@modules/payment-method/base/abstract'
import {Request, Response, Process} from '@type/request-response';
import {IRedirectable, IPaymentConfig} from '@interface/payment';
import {PaymentMethod, Status} from '@type/constants';
import { IPaymentEntity } from "@interface/payment-entities";
export abstract class PaymentRedirect 
    extends PaymentAbstract
    implements IRedirectable
    {

    methodType  : PaymentMethod = PaymentMethod.REDIRECT_POST;

    protected responseURLFormat:string = `{BASE}general/{MARKET}/{METHOD}/response/{PAYMENTID}`;

    protected cancelURLFormat:string = `{BASE}general/{MARKET}/{METHOD}/cancel/{PAYMENTID}`;

    protected callbackURLFormat:string = `{BASE}general/{MARKET}/{METHOD}/callback/{PAYMENTID}`;
    
    protected get responseURL() : string { return this._formatUrl(this.responseURLFormat)}

    protected get cancelURL() : string { return this._formatUrl(this.cancelURLFormat)}   

    protected get callbackURL() : string { return this._formatUrl(this.callbackURLFormat)} 

    protected get liveEnv() : string {  return this.config.liveUrl; }

    protected get testEnv() : string { return this.config.testUrl; }

    protected get redirectEndPoint() : string { return this.config.isLive ? this.liveEnv : this.testEnv}
    
    private _formatUrl(format: string){
        return format.replace("{BASE}", this.config.path).replace("{MARKET}", this.market.toLowerCase()).replace("{METHOD}", this.code.toLowerCase()).replace("{PAYMENTID}", this.recordId.toString());
    }

    async Request(req : Request) :  Promise<Process.Request.Response>{
       const r  = await super.Request(req);
       
       if(r.method == PaymentMethod.REDIRECT)
       {
           delete r.body;
       }

       return {redirectEndPoint : this.redirectEndPoint , ...r};
    }
    
    async Response(request : Response, paymentId : string) : Promise<string> {

        const req = request.payload || request.query;

        this.debug("ProcessResponse", JSON.stringify(req, null ,4), paymentId);

        const entity = await this.getEntityById(paymentId);
        
        try {
            await entity.log4Redirect({message: "Back from payment gateway"});

            if(!this.isValidPaymentRequest(entity.status))
            {
                return this.getUrlbyStatus(entity.status as Status, entity);
            }
            
            const response = await this._processResponse(req, entity);

            const retry : boolean = await this.updateOrder({ 
                status : response.status, 
                data: response.data, 
                id:entity.orderId
            });
            
            await entity.log4Redirect({status:response.status, req, message: "Process response success"});

            return this.getUrlbyStatus(response.status, entity);
         }
        catch (e) {
            this.debug("ProcessResponse", "error", e);
            return this.getUrlbyStatus(Status.CANCEL, entity);
        }
    }

    protected getUrlbyStatus(status : Status, entity : IPaymentEntity) : string
    {
        switch(status){
            case Status.PENDING_PAYMENT:
            case Status.PAYMENT_REVIEW:
                return entity.responseUrl;
            case Status.FAIL:
                return entity.failUrl;
            default:
            case Status.CANCEL:
                return entity.cancelUrl;
        }
    }

    protected abstract _processResponse(req : unknown, entity : IPaymentEntity) : Promise<Process.Response.Response>;
   
}

