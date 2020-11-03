'use strict';
import Config from 'config/config';
const Confidence = require('confidence');
const Pack = require('../../package');
const Prom = require('epimetheus').hapi;
const HapiPino = require('hapi-pino');
const HapiCors = require('hapi-modern-cors');
import MongoDB from '@lib/mongodb';
import PaymentRoute from '@routes/v1/payment';
import StripeRoute from '@routes/v1/stripe';


let internals = {
    criteria: {
        env: process.env.NODE_ENV
    }
} as any;

internals.manifest = {
    server: {
        host : Config.server.host,
        port: Config.server.port
    },
    register: {
        plugins : [
        // Debugging
        {
            plugin:  require('hapi-dev-errors'),
            options: {
                showErrors: process.env.NODE_ENV !== 'production'
            }
        },
        //prometheus
        {
            plugin : Prom,
            option: {}
        },
        //mongodb
      
        {
            plugin : MongoDB,
            options: Config.mongodb
        },
       
        // Logging pino
        {
            plugin: HapiPino,
            options: Config.pino
        },
        // Static file and directory handlers
        {
            plugin: '@hapi/inert'
        },
        {
            plugin: '@hapi/vision'
        },
        // Swagger support
        {
            plugin: 'hapi-swagger',
            options: {
                documentationPage: process.env.NODE_ENV !== 'production',
                documentationPath: Config.basePath + 'documentation',
                swaggerUIPath: Config.basePath + 'swaggerui/',
                jsonPath: Config.basePath + 'swagger.json',
                info: {
                    title: 'member service API',
                    version: Pack.version,
                },
                host: Config.server.host,
                securityDefinitions: {
                    'jwt': {
                        'type': 'apiKey',
                        'name': 'Authorization',
                        'in': 'header'
                    }
                },
                security: [{ 'jwt': [] }]
            }
        },
        /* Basic authentication
        {
            plugin: '@hapi/basic'
        },
         JWT authentication
        {
            plugin: 'hapi-auth-jwt2'
        },
          JWT-Authentication strategy
        {
            plugin:  './lib/jwtAuth',
            options: Config.jwtAuthOptions
        },
        {
            plugin:  './lib/basicAuth',
            options: Config.basicAuthOptions
        },
        */
        // API routes
       
        {
            plugin: PaymentRoute,
        },
        {
            plugin: StripeRoute,
        },
        // API routes cors
        {
            plugin: HapiCors,
            options: Config.cors
        },
        ]
    }
};

internals.store = new Confidence.Store(internals.manifest);

export default {
    get : (key : any) =>  internals.store.get(key, internals.criteria),
    meta : (key : any) =>  internals.store.meta(key, internals.criteria)
}