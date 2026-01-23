import { NextRequest, NextResponse } from "next/server";
import { requirePayment } from "@/lib/x402";

/**
 * POST /api/expert/select
 * 
 * AI Expert Selection Endpoint
 * 
 * x402 Protocol Flow:
 * 1. First request without payment → Returns 402 with expert price
 * 2. Client makes payment on Base Sepolia
 * 3. Request with X-PAYMENT: tx:0x... → Verifies payment, activates expert
 * 
 * Cost: Varies by expert (0.0005 - 0.0008 ETH)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { expert_id, expert_name, price } = body;

        if (!expert_id || !price) {
            return NextResponse.json(
                { error: "Missing required fields: expert_id, price" },
                { status: 400 }
            );
        }

        // x402: Check payment
        const { authorized, response } = await requirePayment(
            request,
            price,
            `AI Expert Access: ${expert_name || expert_id}`
        );

        if (!authorized) {
            return response;
        }

        // Payment verified - activate expert
        return NextResponse.json({
            success: true,
            session_id: `session_${Date.now()}`,
            expert_id: expert_id,
            expert_name: expert_name,
            x402: {
                payment_verified: true,
                amount: `${price} ETH`,
                network: "base-sepolia",
            },
            status: "Expert activated and ready for consultation",
            valid_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        });
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
}

