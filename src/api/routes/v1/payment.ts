'use strict';
import Config  from '@config/config';
import JoiSchema from '@joischema/payment';
import * as Joi from '@hapi/joi';
import Logger from '@helpers/logger';
import * as Boom from '@hapi/boom';
import PaymentController from '@controllers/payment';
const paymentController = new PaymentController();
const basePath = Config.basePath;
const logger = Logger('controller:payment');

export default {
    pkg: require('../../../../package.json'),
    name : 'payment_routes_v1',
    register: async (plugin : any, options: any) => {
        plugin.route([
            {
                method: 'POST',
                path: basePath + 'general/{market}/{paymentMethod}/request',
                config: {
                    description: 'response payment',
                    validate: {
                        options: {
                            allowUnknown: true
                        },
                        headers: {
                        },
                        payload: {
                            data: Joi.alternatives().try(JoiSchema.request).required()
                          },
                        failAction: async (request: any, h: any, error: any) : Promise<any> => {
                            logger.error(error, `[Request] caught exception`);
                            return Boom.boomify(error);
                        }
                    },
                    handler: paymentController.Request,
                    tags: ['api'] //swagger documentation
                }
            },
            {
                method: 'POST',
                path: basePath + 'general/{market}/{paymentMethod}/response/{paymentId}',
                config: {
                    description: 'response payment',
                    validate: {
                        options: {
                            allowUnknown: true
                        },
                        headers: {
                        },
                        payload: {
                        },
                        failAction: async (request: any, h: any, error: any) : Promise<any> => {
                            logger.error(error, `[Response] caught exception`);
                            return Boom.boomify(error);
                        }
                    },
                    handler: paymentController.Response,
                    tags: ['api'] //swagger documentation
                }
            },
            {
                method: 'GET',
                path: basePath + 'general/{market}/{paymentMethod}/response/{paymentId}',
                config: {
                    description: 'response payment',
                    validate: {
                        options: {
                            allowUnknown: true
                        },
                        headers: {
                        },
                        failAction: async (request: any, h: any, error: any) : Promise<any> => {
                            logger.error(error, `[Response] caught exception`);
                            return Boom.boomify(error);
                        }
                    },
                    handler: paymentController.Response,
                    tags: ['api'] //swagger documentation
                }
            },
            {
                method: 'GET',
                path: basePath + 'general/{market}/{paymentMethod}/cancel/{paymentId}',
                config: {
                    description: 'cancel payment',
                    validate: {
                        options: {
                            allowUnknown: true
                        },
                        headers: {
                        },
                        failAction: async (request: any, h: any, error: any) : Promise<any> => {
                            logger.error(error, `[Cancel] caught exception`);
                            return Boom.boomify(error);
                        }
                    },
                    handler: paymentController.Cancel,
                    tags: ['api'] //swagger documentation
                }
            },
            {
                method: 'POST',
                path: basePath + 'general/{market}/{paymentMethod}/callback',
                config: {
                    description: 'callback payment',
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
                    handler: paymentController.Callback,
                    tags: ['api'] //swagger documentation
                }
            },
            {
                method: 'POST',
                path: basePath + 'general/{market}/{paymentMethod}/callback/{paymentId}',
                config: {
                    description: 'callback payment',
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
                    handler: paymentController.Callback,
                    tags: ['api'] //swagger documentation
                }
            },
            
            {
                method: 'GET',
                path: basePath + 'general/{market}/{paymentMethod}/schedule',
                config: {
                    description: 'schedule payment',
                    validate: {
                        options: {
                            allowUnknown: true
                        },
                        headers: {
                        },
                        failAction: async (request: any, h: any, error: any) : Promise<any> => {
                            logger.error(error, `[Schedule] caught exception`);
                            return Boom.boomify(error);
                        }
                    },
                    handler: paymentController.Schedule,
                    tags: ['api'] //swagger documentation
                }
            }
        ]);
    }
};
