'use strict';

const Pino = require('pino');

const defaultOptions = {
    logPayload: true,
    logRequestStart: false,
    logRequestComplete: false,
    level:  process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    redact: process.env.NODE_ENV === 'production' ? ['req.headers.authorization'] : [],
    customLevels: {
        alert: 45
    }
};

class Logger extends Pino {
    constructor(options = defaultOptions) {
        super(options);
    }
  
    logHttpCall = async (request : any, response : any) => {
        if(response) {
            const { statusCode, body } = response;
            this.info({request, statusCode, body });
        }
        else {
            this.info({request});
        }
    }
}

export default (child: any, options: any = {}) => {
    const activeOptions = {...defaultOptions, ...options };
    const logger = new Logger(activeOptions);
    if(child) {
        return logger.child({module: child});
    }

    return logger;
};
