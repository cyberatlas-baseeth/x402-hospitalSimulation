/**
 * Mock data for the healthcare simulation
 * All data is fictional and for demonstration purposes only
 */

export interface LabOffer {
    lab_id: string;
    lab_name: string;
    tests: string[];
    price: string;
    turnaround_time: string;
    rating: number;
}

export interface TestResult {
    test_name: string;
    value: string;
    unit: string;
    reference_range: string;
    status: "normal" | "low" | "high";
}

/**
 * Generate mock lab offers based on requested tests
 */
export function generateLabOffers(requestedTests: string[]): LabOffer[] {
    return [
        {
            lab_id: "lab_001",
            lab_name: "HealthFirst Diagnostics",
            tests: requestedTests,
            price: "0.015",
            turnaround_time: "24 hours",
            rating: 4.8,
        },
        {
            lab_id: "lab_002",
            lab_name: "QuickTest Labs",
            tests: requestedTests,
            price: "0.012",
            turnaround_time: "48 hours",
            rating: 4.5,
        },
        {
            lab_id: "lab_003",
            lab_name: "Premium Medical Center",
            tests: requestedTests,
            price: "0.025",
            turnaround_time: "12 hours",
            rating: 4.9,
        },
    ];
}

/**
 * Generate mock test results
 */
export function generateTestResults(tests: string[]): TestResult[] {
    const mockResults: Record<string, TestResult> = {
        "Complete Blood Count": {
            test_name: "Complete Blood Count",
            value: "Within normal limits",
            unit: "-",
            reference_range: "See detailed report",
            status: "normal",
        },
        "Hemoglobin": {
            test_name: "Hemoglobin",
            value: "14.2",
            unit: "g/dL",
            reference_range: "12.0-16.0",
            status: "normal",
        },
        "Vitamin D": {
            test_name: "Vitamin D (25-OH)",
            value: "28",
            unit: "ng/mL",
            reference_range: "30-100",
            status: "low",
        },
        "Iron Panel": {
            test_name: "Serum Iron",
            value: "85",
            unit: "μg/dL",
            reference_range: "60-170",
            status: "normal",
        },
        "Thyroid Panel": {
            test_name: "TSH",
            value: "2.1",
            unit: "mIU/L",
            reference_range: "0.4-4.0",
            status: "normal",
        },
        "Blood Glucose": {
            test_name: "Fasting Blood Glucose",
            value: "95",
            unit: "mg/dL",
            reference_range: "70-100",
            status: "normal",
        },
        "Lipid Panel": {
            test_name: "Total Cholesterol",
            value: "195",
            unit: "mg/dL",
            reference_range: "<200",
            status: "normal",
        },
    };

    return tests.map((test) => {
        if (mockResults[test]) {
            return mockResults[test];
        }
        // Default result for unknown tests
        return {
            test_name: test,
            value: "Within normal limits",
            unit: "-",
            reference_range: "See reference",
            status: "normal" as const,
        };
    });
}

/**
 * Symptom analysis response structure
 */
export interface SymptomAnalysis {
    disclaimer: string;
    observed_symptoms: string[];
    possible_considerations: string[];
    recommended_tests: string[];
    general_guidance: string[];
}

/**
 * Generate symptom analysis based on input
 */
export function analyzeSymptoms(symptoms: string): SymptomAnalysis {
    const symptomLower = symptoms.toLowerCase();

    let recommended_tests: string[] = ["Complete Blood Count"];
    let possible_considerations: string[] = [];
    let general_guidance: string[] = [
        "Maintain adequate hydration",
        "Ensure sufficient rest",
        "Consider tracking symptoms over time",
    ];

    if (symptomLower.includes("fatigue") || symptomLower.includes("tired")) {
        recommended_tests.push("Vitamin D", "Iron Panel", "Thyroid Panel");
        possible_considerations.push(
            "Fatigue can have many causes including lifestyle factors, nutrition, or underlying conditions"
        );
        general_guidance.push("Regular sleep schedule may be beneficial");
    }

    if (symptomLower.includes("headache")) {
        recommended_tests.push("Blood Glucose");
        possible_considerations.push(
            "Headaches can be related to hydration, stress, sleep, or other factors"
        );
        general_guidance.push("Monitor hydration and screen time");
    }

    if (symptomLower.includes("weight") || symptomLower.includes("appetite")) {
        recommended_tests.push("Thyroid Panel", "Blood Glucose", "Lipid Panel");
        possible_considerations.push(
            "Changes in weight or appetite may be influenced by various factors"
        );
    }

    // Remove duplicates
    recommended_tests = [...new Set(recommended_tests)];

    return {
        disclaimer: "This is NOT a medical diagnosis. For informational purposes only.",
        observed_symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
        possible_considerations,
        recommended_tests,
        general_guidance,
    };
}

/**
 * Data evaluation analysis
 */
export interface DataEvaluationResult {
    interpretation: string;
    lifestyle_guidance: string[];
    areas_of_attention: string[];
    disclaimer: string;
}

export function generateDataEvaluation(results: TestResult[]): DataEvaluationResult {
    const lowResults = results.filter((r) => r.status === "low");
    const highResults = results.filter((r) => r.status === "high");

    const areasOfAttention: string[] = [];
    const lifestyleGuidance: string[] = [
        "Regular physical activity is generally beneficial for overall wellness",
        "A balanced diet rich in fruits, vegetables, and whole grains supports health",
        "Adequate sleep (7-9 hours) is important for recovery and well-being",
        "Stress management techniques may support overall health",
    ];

    if (lowResults.length > 0) {
        lowResults.forEach((r) => {
            if (r.test_name.includes("Vitamin D")) {
                areasOfAttention.push("Vitamin D levels appear below reference range");
                lifestyleGuidance.push("Consider discussing Vitamin D supplementation with a healthcare provider");
                lifestyleGuidance.push("Safe sun exposure may support Vitamin D levels");
            }
            if (r.test_name.includes("Iron")) {
                areasOfAttention.push("Iron levels may warrant attention");
                lifestyleGuidance.push("Iron-rich foods include leafy greens, legumes, and fortified cereals");
            }
        });
    }

    return {
        interpretation: lowResults.length > 0 || highResults.length > 0
            ? "Some values are outside reference ranges. Consider discussing with a healthcare provider."
            : "Values appear within normal reference ranges based on this limited dataset.",
        lifestyle_guidance: [...new Set(lifestyleGuidance)],
        areas_of_attention: areasOfAttention,
        disclaimer: "This evaluation is for informational purposes only and does not constitute medical advice.",
    };
}
