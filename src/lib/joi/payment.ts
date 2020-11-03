'use strict';

const joi = require('@hapi/joi');

export default {
    
    request: joi.object({
        market: joi.string().max(5).required().description('Market'),
        orderId: joi.string().allow('').required().description('Order Id'),
        realOrderId: joi.string().allow('').required().description('POS Order Id'),
        totalAmount: joi.number().min(1).required().description('Total Amount'),
        locale: joi.string().allow('').optional().description('Locale'),
        currency: joi.string().min(3).max(3).required().description('Currency'),
        responseUrl: joi.string().uri().optional().description('Response Url'), 
        cancelUrl: joi.string().uri().optional().description('Cancel url'),
        failUrl: joi.string().uri().optional().description('Fail url')
    }).unknown(true)
}

