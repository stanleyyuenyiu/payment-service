'use strict';
const Config = require('../config/node_modules/config/config');

exports.plugin = {
    register: (server, options) => {
        server.auth.strategy('jwt', 'jwt', {
            key: options.publicKey,
            validate: validate, // validate function defined above
            verifyOptions: {
                algorithms: options.algorithms
            }
        });
    },
    name: 'jwt-auth'
};

//for demo 2

// validation function
const validate = async (decoded, request) => {
    let isValid = false;
    try {
        // do your checks to see if the person is valid
        let memberId_jwt = decoded.id;
        let memberId_param = request.params.memberId;

        if(memberId_jwt && memberId_param ) {
            if(Config.jwtAuthOptions.checkId ) {
                if(memberId_jwt.toString() == memberId_param.toString()) {
                    isValid = true;
                }
            }
            else {
                isValid = true;
            }
        }
        else {
            console.log(`Invalid Credential: memberId [${memberId_param}] in parameters does not match memberId [${memberId_jwt}] in token`);
        }
    } catch (error) {
        console.log(`[jwt][validate] error: ${error.message}`);
    } finally {
        return {
            isValid: isValid
        };
    }
};