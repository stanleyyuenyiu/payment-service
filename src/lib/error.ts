'use strict';

export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 503,
}

export class BaseError extends Error {
    name : any;
    code : any;
    isServer : any;
    httpStatusCode : any

    constructor(name : any, isServer: any, code: any, message: any) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.code = code ;
        this.isServer = isServer;
        this.message = message;
        this.httpStatusCode = HttpStatusCode.INTERNAL_SERVER;
    }

    toJson = ()  => ({
            message: this.message
    })
}

export class BadRequestError extends BaseError {
    constructor(error: {code:number, message:string}, httpStatusCode: HttpStatusCode = HttpStatusCode.BAD_REQUEST) {
        super("Bad Request", false,error.code, error.message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BadRequestError);
        }        
        this.httpStatusCode =  httpStatusCode;
    }
}

export class NotFoundError extends BaseError {
    constructor(error: {code:number, message:string}) {
        super("Record Not Found", false,error.code, error.message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BadRequestError);
        }        
        this.httpStatusCode =  HttpStatusCode.NOT_FOUND;
    }
}

