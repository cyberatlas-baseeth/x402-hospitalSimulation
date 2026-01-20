import { NextRequest, NextResponse } from "next/server";
import { createPaymentConfirmation } from "@/lib/paymentSimulator";

/**
 * POST /api/data-evaluator/accept
 * 
 * Accept Data Evaluation Offer Endpoint
 * 
 * When the patient accepts the offer:
 * 1. Payment flows FROM the bot TO the patient
 * 2. Patient grants access to anonymized data
 * 3. Patient receives an access token for the evaluation results
 * 
 * This demonstrates the reverse payment flow in x402:
 * The service pays the user for their data.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { offer_id, offer_price } = body;

        if (!offer_id) {
            return NextResponse.json(
                { error: "Missing required field: offer_id" },
                { status: 400 }
            );
        }

        const price = offer_price || "0.011";

        // Simulate payment FROM service TO patient
        const paymentConfirmation = createPaymentConfirmation(
            price,
            "service_to_user"
        );

        // Generate access token for results
        const accessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

        return NextResponse.json({
            success: true,
            message: "Offer accepted. Payment received from Data Evaluation Bot.",
            payment: paymentConfirmation,
            access_granted: true,
            access_token: accessToken,
            data_consent: {
                granted_at: new Date().toISOString(),
                scope: "anonymized_test_results",
                revocable: true,
                expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            },
            next_step: {
                endpoint: "/api/data-evaluator/result",
                method: "GET",
                headers: {
                    "X-ACCESS-TOKEN": accessToken,
                },
            },
            disclaimer:
                "This is a simulated transaction. No real payment was made. " +
                "Your data remains private and is only used in this demonstration.",
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
