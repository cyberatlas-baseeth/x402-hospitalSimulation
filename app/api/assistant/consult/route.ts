import { NextRequest, NextResponse } from "next/server";
import {
    create402Response,
    hasValidPayment,
    MEDICAL_DISCLAIMER,
} from "@/lib/paymentSimulator";
import { analyzeSymptoms } from "@/lib/mockData";

/**
 * POST /api/assistant/consult
 * 
 * AI Health Assistant Consultation Endpoint
 * 
 * x402 Flow:
 * 1. First request without payment → Returns 402 with payment info
 * 2. Request with X-PAYMENT: simulated → Returns consultation results
 * 
 * Cost: 0.002 USDC (simulated)
 */
export async function POST(request: NextRequest) {
    // Check for payment header
    if (!hasValidPayment(request.headers)) {
        // Return 402 Payment Required
        const paymentResponse = create402Response(
            "0.002",
            "AI Health Assistant Consultation Fee",
            "ai-health-assistant"
        );

        return NextResponse.json(paymentResponse, { status: 402 });
    }

    // Payment received - process the consultation
    try {
        const body = await request.json();
        const symptoms = body.symptoms || "general health inquiry";

        // Generate symptom analysis
        const analysis = analyzeSymptoms(symptoms);

        return NextResponse.json({
            success: true,
            consultation_id: `consult_${Date.now()}`,
            disclaimer: MEDICAL_DISCLAIMER,
            analysis: {
                observed_symptoms: analysis.observed_symptoms,
                possible_considerations: analysis.possible_considerations,
                recommended_tests: analysis.recommended_tests,
                general_guidance: analysis.general_guidance,
            },
            payment_confirmed: true,
            amount_paid: "0.002 USDC",
            note: "This is a simulation. No actual payment was processed.",
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
