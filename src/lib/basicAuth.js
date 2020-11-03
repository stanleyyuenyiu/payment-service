'use strict';

const BasicAuth = require('@hapi/basic');
const JsonPath = require('jsonpath');
const Config = require('../config/node_modules/config/config');

exports.plugin = {
    register: (server, options) => {
        server.auth.strategy('simple', 'basic', {
            validate: validate 
        });
    },
    name: 'basic-auth'
};

// validation function
const validate = async (request, key, secret) => {
    let checkValid = false;
    try {
        let auths = JsonPath.query(Config.basicAuthOptions, "$..[?(@.key==\"" + key + "\")]", 1);

        if(auths && auths.length == 1 && auths[0].secret) {
            if (auths[0].secret.toString() === secret.toString().trim()) {
                checkValid = true;
            }
        }

    } catch (error) {
        console.log(`[basicAuth]:[validate]: ${JSON.stringify(err)}`);
    } finally {
        return {
            isValid: checkValid,
            credentials: { key: key }
        };
    }
};