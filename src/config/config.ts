'use strict';

export default {
    server: {
        host: '0.0.0.0',
        port: process.env.SERVER_PORT || 3000
    },
    basePath: "/payment/v1/",
    callbackPath: process.env.PAYMENT_GATEWAY_CALLPOINT_PATH || "http://localhost:3000/payment/v1/",
    cors: {
        allowOriginResponse: true,
        maxAge: 600,
    },
    mongodb: {
        uri: process.env.MONGODB_URI ,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            poolSize: 10,
        }
    },
    ignorePathPatterns: ['.*\\/documentation', '.*\\/metrics', '.*\\/swagger'],
    pino: {
        logPayload: true,
        logRequestStart: false,
        logRequestComplete: false,
        level:  process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        redact: process.env.NODE_ENV === 'production' ? ['req.headers.authorization'] : []
    },
    strapi: {
        host: process.env.STRAPI_SERVICE || 'http://localhost:1337',
        user: process.env.STRAPI_SERVICE_USER ,
        pwd: process.env.STRAPI_SERVICE_PWD ,
    },
    ctbcProxyApi: {
        host: process.env.CTBCAPI_PROXY_SERVICE || 'http://localhost:8000',
    },
    orderApi: {
        host: process.env.ORDER_SERVICE || 'http://localhost:4000/v1/orders',
    }
};
