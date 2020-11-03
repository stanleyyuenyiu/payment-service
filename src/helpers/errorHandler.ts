'use strict';

const Boom = require('@hapi/boom');
import {BaseError}  from '@lib/error';
import Logger from '@helpers/logger';
const logger = Logger('errorHandler');

export default {
    
    handleError : async (error : any) => {
        return new Promise(async (resolve: any, reject: any)=> {
            
            try {
                if(error instanceof BaseError) {
                    const _error = Boom.badImplementation(error);
                    _error.output.statusCode = error.httpStatusCode;
                    _error.output.payload = error.toJson();
                    _error.reformat();
                    return reject(_error);
                }
            
                 return reject(Boom.badImplementation(error));

            } catch (error) {
                logger.error(error);
                return reject(Boom.badImplementation(error));
            }

        });
    }
}