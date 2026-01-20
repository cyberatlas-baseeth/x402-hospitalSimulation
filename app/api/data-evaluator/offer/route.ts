import { NextRequest, NextResponse } from "next/server";
import { createReversePaymentOffer } from "@/lib/paymentSimulator";

/**
 * POST /api/data-evaluator/offer
 * 
 * Data Evaluation Bot Offer Endpoint (Reverse Payment)
 * 
 * This endpoint demonstrates the REVERSE x402 flow:
 * The bot offers to PAY the patient for their health data.
 * This showcases data ownership and monetization concepts.
 * 
 * No payment required from user - bot is the payer.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { test_results } = body;

        if (!test_results || !Array.isArray(test_results)) {
            return NextResponse.json(
                { error: "Missing required field: test_results" },
                { status: 400 }
            );
        }

        // Calculate offer based on data value
        const basePrice = 0.005;
        const perTestBonus = 0.002;
        const totalOffer = (basePrice + test_results.length * perTestBonus).toFixed(4);

        const offer = createReversePaymentOffer(
            totalOffer,
            `Anonymized analysis of ${test_results.length} test result(s)`,
            "Data will be used for aggregate health trend analysis only. " +
            "No personal identifiers will be stored. Data will not be sold to third parties."
        );

        return NextResponse.json({
            success: true,
            offer_id: `offer_${Date.now()}`,
            ...offer,
            data_control: {
                can_revoke: true,
                retention_period: "90 days",
                anonymization: "full",
                third_party_sharing: false,
            },
            message:
                "The Data Evaluation Bot would like to purchase your anonymized health data. " +
                "You retain full ownership and can revoke consent at any time.",
            disclaimer:
                "This is a simulation demonstrating data monetization concepts. " +
                "No real data transaction will occur.",
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
