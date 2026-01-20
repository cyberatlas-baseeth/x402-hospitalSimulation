import { NextRequest, NextResponse } from "next/server";
import { generateLabOffers } from "@/lib/mockData";

/**
 * GET /api/labs/offers
 * 
 * Laboratory Offers Endpoint
 * 
 * This endpoint is FREE - no payment required.
 * Users can browse lab offers without any cost.
 * Payment is only required when placing an actual order.
 */
export async function GET(request: NextRequest) {
    // No payment required for viewing lab offers
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
        free_access: true,
        valid_for: "1 hour",
        note: "Viewing lab offers is free. Payment is required only when placing an order.",
    });
}
