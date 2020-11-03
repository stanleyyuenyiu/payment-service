'use strict';
import Config  from '@config/config';
import Logger from '@helpers/logger';
import * as Boom from '@hapi/boom';
import PaymentController from '@controllers/payment';

const paymentController = new PaymentController();
const basePath = Config.basePath;
const logger = Logger('controller:stripe');

export default {
    pkg: require('../../../../package.json'),
    name : 'stripe_routes_v1',
    register: async (plugin : any, options: any) => {
        plugin.route([
            {
                method: 'POST',
                path: basePath + '{market}/{paymentMethod}/callback',
                config: {
                    description: 'stripe webhook',
                    validate: {
                        options: {
                            allowUnknown: true
                        },
                        headers: {
                        },
                        failAction: async (request: any, h: any, error: any) : Promise<any> => {
                            logger.error(error, `[Callback] caught exception`);
                            return Boom.boomify(error);
                        }
                    },
                    payload:{parse:false},
                    handler: paymentController.Callback,
                    tags: ['api'] //swagger documentation
                }
            }
        ]);
    }
};
