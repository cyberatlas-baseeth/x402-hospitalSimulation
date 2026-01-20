import { NextRequest, NextResponse } from "next/server";
import { create402Response, hasValidPayment } from "@/lib/paymentSimulator";
import { generateTestResults } from "@/lib/mockData";

/**
 * POST /api/labs/order
 * 
 * Lab Test Order Endpoint
 * 
 * x402 Flow:
 * 1. First request without payment → Returns 402 with lab price
 * 2. Request with X-PAYMENT: simulated → Processes order and returns results
 * 
 * Cost: Varies based on selected lab
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lab_id, tests, price } = body;

        if (!lab_id || !tests || !Array.isArray(tests)) {
            return NextResponse.json(
                { error: "Missing required fields: lab_id, tests" },
                { status: 400 }
            );
        }

        const orderPrice = price || "0.015";

        // Check for payment header
        if (!hasValidPayment(request.headers)) {
            const paymentResponse = create402Response(
                orderPrice,
                `Lab Test Order - ${tests.length} test(s)`,
                `lab-${lab_id}`
            );

            return NextResponse.json(paymentResponse, { status: 402 });
        }

        // Payment received - process the order and return results
        const results = generateTestResults(tests);

        return NextResponse.json({
            success: true,
            order_id: `order_${Date.now()}`,
            lab_id: lab_id,
            tests_ordered: tests,
            results: results,
            payment_confirmed: true,
            amount_paid: `${orderPrice} USDC`,
            result_date: new Date().toISOString(),
            disclaimer:
                "These are simulated test results for demonstration purposes only. " +
                "They do not represent actual medical test results.",
            note: "Your data belongs to you. You have full control over how it is used.",
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}
