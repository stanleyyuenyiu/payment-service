"use strict"
import Logger from "helpers/logger";
const logger = Logger('rspHandler');

export default {

  transform : async function (request : any) {
    return new Promise(async (resolve: any, reject : any)=> {
        try{
            const { url, headers, method, params, payload, info, response } = request;
            const { statusCode, data, source, output } = response;
            const rspHeaders = response.headers;
            const _source  = source ? (typeof source === 'string'? JSON.parse(source) : source ) : null;
            const id = info ? info.id : null;

            let _requestToLog = {
                'request': {
                    id, url, headers, method, params, payload, info
                }
            };
            let _responseToLog = {
                'response': {
                    id, headers: rspHeaders, statusCode, data, source: _source, output
                }
            };

            //let _h = request.ALERT === true ? logger.alert(_requestToLog) : logger.info(_requestToLog);
            //_h = logger.info(_responseToLog);
            
            const _response = {
                statusCode: null,
                body: {
                    data: null,
                    error: null
                }
            } as any;

            if(response.isBoom) {
                _response.body.error = output.payload;
                _response.statusCode = output.statusCode;
              //  _response.body.message = output.payload ? output.payload.error : 'Failed to process request';

                request.response.output.payload  = _response.body;
            }
            else if(response.statusCode >= 500) {
                _response.body.error = _source;
                _response.statusCode = response.statusCode;
               // _response.body.message = _source.status ? _source.status.message : `Server was unable to process request`;

                request.response.output.payload  = _response.body;
            }
            else{
                _response.statusCode = response.statusCode;
                _response.body.data = _source.data;
                //_response.body.success = true;
                //_response.body.message = _source.status ? _source.status.message : `Request has been processed successfully`;
                
                delete _response.body.status;
                request.response.source  = _response.body;
            }
            
            request.response.statusCode = _response.statusCode;
        }
        catch(err){
            logger.error(err, `[handleResponse]`);
        }
        finally{
            return resolve();
        }

    });
},

  alert : function (request : any) {
    const source  = JSON.parse(request.response.source);
    let message = {
        ALERT: request.ALERT,
        type: request.ALERT_TYPE,
        message: [
            request.url,
            request.auth,
            request.headers,
            request.info,
            { payload : JSON.stringify(request.payload)}
        ],
        error: source ? source.stacktrace : request.response.data
    }
    console.log(message);
  }
}