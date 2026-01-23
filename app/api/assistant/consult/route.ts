import { NextRequest, NextResponse } from "next/server";
import { requirePayment } from "@/lib/x402";
import { analyzeSymptoms } from "@/lib/mockData";

/**
 * POST /api/assistant/consult
 * 
 * AI Health Assistant Consultation Endpoint
 * 
 * x402 Protocol Flow:
 * 1. First request without payment → Returns 402 with payment details
 * 2. Client makes payment on Base Sepolia
 * 3. Request with X-PAYMENT: tx:0x... → Verifies payment, returns results
 * 
 * Cost: 0.0002 ETH
 */

const CONSULTATION_PRICE = "0.0002";

export async function POST(request: NextRequest) {
    // x402: Check payment
    const { authorized, response } = await requirePayment(
        request,
        CONSULTATION_PRICE,
        "AI Health Assistant Consultation Fee"
    );

    if (!authorized) {
        return response;
    }

    // Payment verified - process the consultation
    try {
        const body = await request.json();
        const symptoms = body.symptoms || "general health inquiry";

        // Generate symptom analysis
        const analysis = analyzeSymptoms(symptoms);

        return NextResponse.json({
            success: true,
            consultation_id: `consult_${Date.now()}`,
            x402: {
                payment_verified: true,
                amount: `${CONSULTATION_PRICE} ETH`,
                network: "base-sepolia",
            },
            disclaimer: "This is NOT medical advice. For informational purposes only.",
            analysis: {
                observed_symptoms: analysis.observed_symptoms,
                possible_considerations: analysis.possible_considerations,
                recommended_tests: analysis.recommended_tests,
                general_guidance: analysis.general_guidance,
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
