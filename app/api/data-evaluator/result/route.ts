import { NextRequest, NextResponse } from "next/server";
import { DATA_EVALUATION_DISCLAIMER } from "@/lib/paymentSimulator";
import { generateDataEvaluation, TestResult } from "@/lib/mockData";

/**
 * GET /api/data-evaluator/result
 * 
 * Data Evaluation Result Endpoint
 * 
 * Returns analysis results after patient has:
 * 1. Received an offer from the Data Evaluation Bot
 * 2. Accepted the offer and received payment
 * 3. Obtained an access token
 * 
 * Requires X-ACCESS-TOKEN header for authorization.
 */
export async function GET(request: NextRequest) {
    const accessToken = request.headers.get("X-ACCESS-TOKEN");

    // In production, validate the access token
    // For simulation, we just check it exists and has the right format
    if (!accessToken || !accessToken.startsWith("access_")) {
        return NextResponse.json(
            {
                error: "Access denied",
                message:
                    "Valid access token required. " +
                    "Please accept a data evaluation offer first to obtain an access token.",
            },
            { status: 403 }
        );
    }

    // Get test results from query params (in real app, would fetch from database)
    const { searchParams } = new URL(request.url);
    const resultsParam = searchParams.get("results");

    let testResults: TestResult[] = [];

    if (resultsParam) {
        try {
            testResults = JSON.parse(decodeURIComponent(resultsParam));
        } catch {
            // Use default mock results
            testResults = [
                { test_name: "Complete Blood Count", value: "Normal", unit: "-", reference_range: "-", status: "normal" },
                { test_name: "Vitamin D (25-OH)", value: "28", unit: "ng/mL", reference_range: "30-100", status: "low" },
            ];
        }
    } else {
        testResults = [
            { test_name: "Complete Blood Count", value: "Normal", unit: "-", reference_range: "-", status: "normal" },
            { test_name: "Vitamin D (25-OH)", value: "28", unit: "ng/mL", reference_range: "30-100", status: "low" },
        ];
    }

    const evaluation = generateDataEvaluation(testResults);

    return NextResponse.json({
        success: true,
        evaluation_id: `eval_${Date.now()}`,
        interpretation: evaluation.interpretation,
        areas_of_attention: evaluation.areas_of_attention,
        lifestyle_guidance: evaluation.lifestyle_guidance,
        disclaimer: DATA_EVALUATION_DISCLAIMER,
        data_usage_summary: {
            data_processed: "anonymized test results",
            purpose: "aggregate health trend analysis",
            personal_data_stored: false,
            shared_with_third_parties: false,
        },
        important_note:
            "This evaluation is generated for demonstration purposes. " +
            "It does not constitute medical advice. " +
            "Always consult healthcare professionals for health-related decisions.",
    });
}
