import { NextRequest, NextResponse } from "next/server";
import { requirePayment } from "@/lib/x402";
import { generateTestResults } from "@/lib/mockData";

/**
 * POST /api/labs/order
 * 
 * Lab Test Order Endpoint
 * 
 * x402 Protocol Flow:
 * 1. First request without payment → Returns 402 with lab price
 * 2. Client makes payment on Base Sepolia
 * 3. Request with X-PAYMENT: tx:0x... → Verifies payment, processes order
 * 
 * Cost: Varies based on selected lab (0.0012 - 0.0025 ETH)
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

        const orderPrice = price || "0.0015";

        // x402: Check payment
        const { authorized, response } = await requirePayment(
            request,
            orderPrice,
            `Lab Test Order - ${tests.length} test(s)`
        );

        if (!authorized) {
            return response;
        }

        // Payment verified - process the order and return results
        const results = generateTestResults(tests);

        return NextResponse.json({
            success: true,
            order_id: `order_${Date.now()}`,
            lab_id: lab_id,
            tests_ordered: tests,
            results: results,
            x402: {
                payment_verified: true,
                amount: `${orderPrice} ETH`,
                network: "base-sepolia",
            },
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
