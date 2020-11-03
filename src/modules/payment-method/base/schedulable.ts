'use strict';
import PaymentEntity from "@models/payment";
import { IPaymentEntity } from "@interface/payment-entities"
import {PaymentRedirect} from "@modules/payment-method/base/redirect"
import { ISchedulable } from "@interface/payment";
import { Status} from '@type/constants';
export abstract class ScheduleRedirect extends PaymentRedirect implements ISchedulable{

    protected abstract startDateBuffer : number = (5 * 3600);
    protected abstract toDateBuffer : number = (1 * 60);

    protected scheduledStatus : Status[] = [Status.PENDING];

    protected get startDate() : Date {
        var date = new Date();
        date.setMinutes(date.getMinutes() - this.startDateBuffer);
        return date;
    }

    protected get toDate() : Date {
        var date = new Date();
        date.setMinutes(date.getMinutes() - this.toDateBuffer);
        return date;
    }

    protected abstract async _processSchedule(entities: IPaymentEntity[]) : Promise<void>;

    async Schedule() : Promise<void>{
        try {
            const entities = await PaymentEntity.find({
                createdAt : { $gte : this.startDate, $lte : this.toDate},
                status: { $in: this.scheduledStatus} ,
                method: this.code
            });

            await this._processSchedule(entities);
         }
        catch (e) {
            throw e
        }
    }
}