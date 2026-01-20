import { NextRequest, NextResponse } from "next/server";
import { create402Response, hasValidPayment } from "@/lib/paymentSimulator";
import { generateLabOffers } from "@/lib/mockData";

/**
 * GET /api/labs/offers
 * 
 * Laboratory Offers Endpoint
 * 
 * x402 Flow:
 * 1. First request without payment → Returns 402 with payment info
 * 2. Request with X-PAYMENT: simulated → Returns lab offers
 * 
 * Cost: 0.001 USDC (simulated)
 */
export async function GET(request: NextRequest) {
    // Check for payment header
    if (!hasValidPayment(request.headers)) {
        const paymentResponse = create402Response(
            "0.001",
            "Lab Offers Discovery Fee",
            "lab-network"
        );

        return NextResponse.json(paymentResponse, { status: 402 });
    }

    // Payment received - return lab offers
    const { searchParams } = new URL(request.url);
    const testsParam = searchParams.get("tests");

    const requestedTests = testsParam
        ? testsParam.split(",").map((t) => t.trim())
        : ["Complete Blood Count", "Vitamin D"];

    const offers = generateLabOffers(requestedTests);

    return NextResponse.json({
        success: true,
        requested_tests: requestedTests,
        offers: offers,
        payment_confirmed: true,
        amount_paid: "0.001 USDC",
        valid_for: "1 hour",
        note: "Prices shown are in simulated USDC. This is for demonstration only.",
    });
}
