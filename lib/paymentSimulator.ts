/**
 * x402 Payment Simulation Library
 * 
 * This module simulates the x402 protocol behavior where APIs require
 * micropayments before providing access to resources.
 * 
 * x402 Flow:
 * 1. Client makes request without payment
 * 2. Server returns HTTP 402 Payment Required with payment info
 * 3. Client "pays" (simulated) and retries with X-PAYMENT header
 * 4. Server validates payment and returns the resource
 */

export interface PaymentInfo {
    price: string;
    currency: string;
    payment_required: boolean;
    description?: string;
    recipient?: string;
}

export interface Payment402Response {
    status: 402;
    payment_info: PaymentInfo;
    message: string;
}

/**
 * Creates a standardized 402 Payment Required response
 * following x402 protocol simulation
 */
export function create402Response(
    price: string,
    description: string,
    recipient: string = "healthcare-provider"
): Payment402Response {
    return {
        status: 402,
        payment_info: {
            price,
            currency: "USDC",
            payment_required: true,
            description,
            recipient,
        },
        message: `Payment of ${price} USDC required to access this resource.`,
    };
}

/**
 * Checks if the request contains a valid simulated payment header
 * In production x402, this would verify cryptographic payment proofs
 */
export function hasValidPayment(headers: Headers): boolean {
    const paymentHeader = headers.get("X-PAYMENT");
    return paymentHeader === "simulated";
}

/**
 * Creates a reverse payment offer (bot pays user)
 */
export interface ReversePaymentOffer {
    offer_price: string;
    currency: string;
    data_scope: string;
    usage_limitation: string;
    expires_in: string;
}

export function createReversePaymentOffer(
    price: string,
    dataScope: string,
    usageLimitation: string
): ReversePaymentOffer {
    return {
        offer_price: price,
        currency: "USDC",
        data_scope: dataScope,
        usage_limitation: usageLimitation,
        expires_in: "24 hours",
    };
}

/**
 * Simulates payment confirmation
 */
export interface PaymentConfirmation {
    success: boolean;
    transaction_id: string;
    amount: string;
    currency: string;
    timestamp: string;
    direction: "user_to_service" | "service_to_user";
}

export function createPaymentConfirmation(
    amount: string,
    direction: "user_to_service" | "service_to_user"
): PaymentConfirmation {
    return {
        success: true,
        transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency: "USDC",
        timestamp: new Date().toISOString(),
        direction,
    };
}

/**
 * Standard disclaimer to be included in all medical-related responses
 */
export const MEDICAL_DISCLAIMER =
    "⚠️ DISCLAIMER: This is NOT a medical diagnosis. " +
    "This information is for educational and demonstration purposes only. " +
    "Always consult a qualified healthcare professional for medical advice, " +
    "diagnosis, or treatment. Never disregard professional medical advice " +
    "based on information from this simulation.";

export const DATA_EVALUATION_DISCLAIMER =
    "⚠️ DISCLAIMER: This data evaluation is for informational purposes only. " +
    "The analysis provided does not constitute medical advice, diagnosis, or treatment. " +
    "Your data remains your property and is only used as specified in the data scope agreement.";
