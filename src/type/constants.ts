"use strict";

export enum Status {
     PENDING  = "PEND",
     CANCEL = "CANCEL",
     FAIL = "FAIL",
     ERROR = "ERROR",
     PROCESS = "PROCESSING",
     PAYMENT_REVIEW = "PAYMENT_REVIEW",
     PENDING_PAYMENT = "PENDING_PAYMENT",
     PAYMENT_REFUND = "PAYMENT_REFUND"
}

export enum PaymentMethod {
    DIRECT = "direct",
    REDIRECT = "redirect",
    REDIRECT_POST = "redirect_post",
    OFFLINE = "offline"
}

