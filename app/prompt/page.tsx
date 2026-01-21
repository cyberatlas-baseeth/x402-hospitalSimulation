"use client";

import { useState } from "react";
import Link from "next/link";

// Types
interface LabOffer {
    lab_id: string;
    lab_name: string;
    tests: string[];
    price: string;
    turnaround_time: string;
    rating: number;
}

interface TestResult {
    test_name: string;
    value: string;
    unit: string;
    reference_range: string;
    status: "normal" | "low" | "high";
}

interface ConsultationResult {
    observed_symptoms: string[];
    possible_considerations: string[];
    recommended_tests: string[];
    general_guidance: string[];
}

interface DataOffer {
    offer_id: string;
    offer_price: string;
    data_scope: string;
    usage_limitation: string;
}

interface EvaluationResult {
    interpretation: string;
    areas_of_attention: string[];
    lifestyle_guidance: string[];
}

type Step = 1 | 2 | 3 | 4 | 5;

export default function Home() {
    // Step management
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

    // Step 1: Consultation
    const [symptoms, setSymptoms] = useState("");
    const [consultationPaymentRequired, setConsultationPaymentRequired] = useState(false);
    const [consultationResult, setConsultationResult] = useState<ConsultationResult | null>(null);
    const [consultationLoading, setConsultationLoading] = useState(false);

    // Step 2: Lab Offers
    const [labOffers, setLabOffers] = useState<LabOffer[]>([]);
    const [selectedLab, setSelectedLab] = useState<LabOffer | null>(null);
    const [labOffersLoading, setLabOffersLoading] = useState(false);

    // Step 3: Lab Order
    const [orderPaymentRequired, setOrderPaymentRequired] = useState(false);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [orderLoading, setOrderLoading] = useState(false);

    // Step 4: Data Offer
    const [dataOffer, setDataOffer] = useState<DataOffer | null>(null);
    const [dataOfferLoading, setDataOfferLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Step 5: Evaluation Result
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [evaluationLoading, setEvaluationLoading] = useState(false);

    const markStepComplete = (step: Step) => {
        setCompletedSteps((prev) => new Set(Array.from(prev).concat(step)));
    };

    // Restart simulation
    const restartSimulation = () => {
        setCurrentStep(1);
        setCompletedSteps(new Set());
        setSymptoms("");
        setConsultationPaymentRequired(false);
        setConsultationResult(null);
        setLabOffers([]);
        setSelectedLab(null);
        setOrderPaymentRequired(false);
        setTestResults([]);
        setDataOffer(null);
        setAccessToken(null);
        setEvaluationResult(null);
    };

    // Step 1: Start Consultation
    const startConsultation = async (withPayment: boolean = false) => {
        setConsultationLoading(true);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (withPayment) {
            headers["X-PAYMENT"] = "simulated";
        }

        try {
            const res = await fetch("/api/assistant/consult", {
                method: "POST",
                headers,
                body: JSON.stringify({ symptoms }),
            });

            const data = await res.json();

            if (res.status === 402) {
                setConsultationPaymentRequired(true);
            } else if (data.success) {
                setConsultationPaymentRequired(false);
                setConsultationResult(data.analysis);
                markStepComplete(1);
                setCurrentStep(2);
            }
        } catch (error) {
            console.error("Consultation error:", error);
        } finally {
            setConsultationLoading(false);
        }
    };

    // Step 2: Get Lab Offers (FREE - no payment required)
    const getLabOffers = async () => {
        if (!consultationResult) return;

        setLabOffersLoading(true);

        const testsParam = encodeURIComponent(consultationResult.recommended_tests.join(","));

        try {
            const res = await fetch(`/api/labs/offers?tests=${testsParam}`);
            const data = await res.json();

            if (data.success) {
                setLabOffers(data.offers);
            }
        } catch (error) {
            console.error("Lab offers error:", error);
        } finally {
            setLabOffersLoading(false);
        }
    };

    const selectLabAndContinue = () => {
        if (selectedLab) {
            markStepComplete(2);
            setCurrentStep(3);
        }
    };

    // Step 3: Order Lab Tests
    const orderLabTests = async (withPayment: boolean = false) => {
        if (!selectedLab) return;

        setOrderLoading(true);

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (withPayment) {
            headers["X-PAYMENT"] = "simulated";
        }

        try {
            const res = await fetch("/api/labs/order", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    lab_id: selectedLab.lab_id,
                    tests: selectedLab.tests,
                    price: selectedLab.price,
                }),
            });

            const data = await res.json();

            if (res.status === 402) {
                setOrderPaymentRequired(true);
            } else if (data.success) {
                setOrderPaymentRequired(false);
                setTestResults(data.results);
                markStepComplete(3);
                setCurrentStep(4);
            }
        } catch (error) {
            console.error("Order error:", error);
        } finally {
            setOrderLoading(false);
        }
    };

    // Step 4: Get Data Offer
    const getDataOffer = async () => {
        if (testResults.length === 0) return;

        setDataOfferLoading(true);

        try {
            const res = await fetch("/api/data-evaluator/offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ test_results: testResults }),
            });

            const data = await res.json();

            if (data.success) {
                setDataOffer({
                    offer_id: data.offer_id,
                    offer_price: data.offer_price,
                    data_scope: data.data_scope,
                    usage_limitation: data.usage_limitation,
                });
            }
        } catch (error) {
            console.error("Data offer error:", error);
        } finally {
            setDataOfferLoading(false);
        }
    };

    const acceptDataOffer = async () => {
        if (!dataOffer) return;

        setDataOfferLoading(true);

        try {
            const res = await fetch("/api/data-evaluator/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    offer_id: dataOffer.offer_id,
                    offer_price: dataOffer.offer_price,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setAccessToken(data.access_token);
                markStepComplete(4);
                setCurrentStep(5);
            }
        } catch (error) {
            console.error("Accept offer error:", error);
        } finally {
            setDataOfferLoading(false);
        }
    };

    // Step 5: Get Evaluation Result
    const getEvaluationResult = async () => {
        if (!accessToken) return;

        setEvaluationLoading(true);

        const resultsParam = encodeURIComponent(JSON.stringify(testResults));

        try {
            const res = await fetch(`/api/data-evaluator/result?results=${resultsParam}`, {
                headers: {
                    "X-ACCESS-TOKEN": accessToken,
                },
            });

            const data = await res.json();

            if (data.success) {
                setEvaluationResult({
                    interpretation: data.interpretation,
                    areas_of_attention: data.areas_of_attention,
                    lifestyle_guidance: data.lifestyle_guidance,
                });
                markStepComplete(5);
            }
        } catch (error) {
            console.error("Evaluation error:", error);
        } finally {
            setEvaluationLoading(false);
        }
    };

    const isStepActive = (step: Step) => currentStep === step;
    const isStepCompleted = (step: Step) => completedSteps.has(step);

    return (
        <main className="container">
            <Link href="/" className="back-link">← Back to Home</Link>

            <header className="header">
                <h1>x402 Healthcare Simulation</h1>
                <p className="subtitle">
                    Experience pay-per-request healthcare interactions using the x402 protocol
                </p>
                <span className="badge">🔬 Educational Demo</span>
                {completedSteps.size > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                        <button className="btn btn-secondary" onClick={restartSimulation}>
                            🔄 Restart Simulation
                        </button>
                    </div>
                )}
            </header>

            <div className="steps">
                {/* Step 1: AI Health Assistant */}
                <div className={`step ${isStepActive(1) ? "active" : ""} ${isStepCompleted(1) ? "completed" : ""}`}>
                    <div className="step-header" onClick={() => setCurrentStep(1)}>
                        <div className="step-number">{isStepCompleted(1) ? "✓" : "1"}</div>
                        <div className="step-title">AI Health Assistant Consultation</div>
                        <div className="step-status">
                            {isStepCompleted(1) ? "Completed" : isStepActive(1) ? "In Progress" : "Pending"}
                        </div>
                    </div>

                    {isStepActive(1) && (
                        <div className="step-content">
                            <div className="form-group">
                                <label className="form-label">Describe your symptoms (simulation only)</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="e.g., fatigue, headache, difficulty sleeping..."
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                />
                            </div>

                            {consultationPaymentRequired && (
                                <div className="payment-banner">
                                    <h3>🔒 Payment Required (HTTP 402)</h3>
                                    <div className="price">
                                        0.002 <span className="currency">USDC</span>
                                    </div>
                                    <p>Simulated payment for AI Health Assistant consultation</p>
                                </div>
                            )}

                            <div className="button-group">
                                {!consultationPaymentRequired ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => startConsultation(false)}
                                        disabled={!symptoms.trim() || consultationLoading}
                                    >
                                        {consultationLoading ? (
                                            <span className="loading">
                                                <span className="spinner"></span> Processing...
                                            </span>
                                        ) : (
                                            "Start Consultation"
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => startConsultation(true)}
                                        disabled={consultationLoading}
                                    >
                                        {consultationLoading ? (
                                            <span className="loading">
                                                <span className="spinner"></span> Processing...
                                            </span>
                                        ) : (
                                            "💳 Simulate Payment (0.002 USDC)"
                                        )}
                                    </button>
                                )}
                            </div>

                            {consultationResult && (
                                <div className="results">
                                    <div className="disclaimer">
                                        <span className="disclaimer-icon">⚠️</span>
                                        This is NOT a medical diagnosis. For informational and demonstration purposes only.
                                    </div>

                                    <h4>Observed Symptoms</h4>
                                    <ul className="results-list">
                                        {consultationResult.observed_symptoms.map((symptom, i) => (
                                            <li key={i}>
                                                <span className="icon">•</span>
                                                {symptom}
                                            </li>
                                        ))}
                                    </ul>

                                    <h4 style={{ marginTop: "1rem" }}>Recommended Tests</h4>
                                    <ul className="results-list">
                                        {consultationResult.recommended_tests.map((test, i) => (
                                            <li key={i}>
                                                <span className="icon">🔬</span>
                                                {test}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 2: Laboratory Offers */}
                <div className={`step ${isStepActive(2) ? "active" : ""} ${isStepCompleted(2) ? "completed" : ""}`}>
                    <div className="step-header" onClick={() => isStepCompleted(1) && setCurrentStep(2)}>
                        <div className="step-number">{isStepCompleted(2) ? "✓" : "2"}</div>
                        <div className="step-title">Browse Laboratory Offers</div>
                        <div className="step-status">
                            {isStepCompleted(2) ? "Completed" : isStepActive(2) ? "In Progress" : "Pending"}
                        </div>
                    </div>

                    {isStepActive(2) && (
                        <div className="step-content">
                            {labOffers.length === 0 && (
                                <div className="button-group">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => getLabOffers()}
                                        disabled={labOffersLoading}
                                    >
                                        {labOffersLoading ? (
                                            <span className="loading">
                                                <span className="spinner"></span> Loading...
                                            </span>
                                        ) : (
                                            "🔍 Get Lab Offers (Free)"
                                        )}
                                    </button>
                                </div>
                            )}

                            {labOffers.length > 0 && (
                                <>
                                    <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                                        Select a laboratory for your tests:
                                    </p>
                                    <div className="lab-offers">
                                        {labOffers.map((offer) => (
                                            <div
                                                key={offer.lab_id}
                                                className={`lab-offer ${selectedLab?.lab_id === offer.lab_id ? "selected" : ""}`}
                                                onClick={() => setSelectedLab(offer)}
                                            >
                                                <div className="lab-offer-header">
                                                    <span className="lab-offer-name">{offer.lab_name}</span>
                                                    <span className="lab-offer-price">{offer.price} USDC</span>
                                                </div>
                                                <div className="lab-offer-details">
                                                    <span>⏱️ {offer.turnaround_time}</span>
                                                    <span>⭐ {offer.rating}/5</span>
                                                    <span>🧪 {offer.tests.length} test(s)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="button-group" style={{ marginTop: "1.5rem" }}>
                                        <button
                                            className="btn btn-success"
                                            onClick={selectLabAndContinue}
                                            disabled={!selectedLab}
                                        >
                                            Continue with Selected Lab
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 3: Order Lab Tests */}
                <div className={`step ${isStepActive(3) ? "active" : ""} ${isStepCompleted(3) ? "completed" : ""}`}>
                    <div className="step-header" onClick={() => isStepCompleted(2) && setCurrentStep(3)}>
                        <div className="step-number">{isStepCompleted(3) ? "✓" : "3"}</div>
                        <div className="step-title">Order Lab Tests & View Results</div>
                        <div className="step-status">
                            {isStepCompleted(3) ? "Completed" : isStepActive(3) ? "In Progress" : "Pending"}
                        </div>
                    </div>

                    {isStepActive(3) && selectedLab && (
                        <div className="step-content">
                            <div className="results" style={{ marginBottom: "1.5rem" }}>
                                <h4>Order Summary</h4>
                                <p>
                                    <strong>Lab:</strong> {selectedLab.lab_name}
                                </p>
                                <p>
                                    <strong>Tests:</strong> {selectedLab.tests.join(", ")}
                                </p>
                                <p>
                                    <strong>Turnaround:</strong> {selectedLab.turnaround_time}
                                </p>
                            </div>

                            {orderPaymentRequired && (
                                <div className="payment-banner">
                                    <h3>🔒 Payment Required (HTTP 402)</h3>
                                    <div className="price">
                                        {selectedLab.price} <span className="currency">USDC</span>
                                    </div>
                                    <p>Simulated payment for lab test order</p>
                                </div>
                            )}

                            {testResults.length === 0 && (
                                <div className="button-group">
                                    {!orderPaymentRequired ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => orderLabTests(false)}
                                            disabled={orderLoading}
                                        >
                                            {orderLoading ? (
                                                <span className="loading">
                                                    <span className="spinner"></span> Processing...
                                                </span>
                                            ) : (
                                                "Place Order"
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => orderLabTests(true)}
                                            disabled={orderLoading}
                                        >
                                            {orderLoading ? (
                                                <span className="loading">
                                                    <span className="spinner"></span> Processing...
                                                </span>
                                            ) : (
                                                `💳 Simulate Payment (${selectedLab.price} USDC)`
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {testResults.length > 0 && (
                                <>
                                    <div className="disclaimer">
                                        <span className="disclaimer-icon">⚠️</span>
                                        These are simulated test results for demonstration purposes only.
                                    </div>

                                    <h4>Test Results</h4>
                                    <div className="test-results">
                                        {testResults.map((result, i) => (
                                            <div key={i} className={`test-result ${result.status}`}>
                                                <span className="test-name">{result.test_name}</span>
                                                <div className="test-value">
                                                    <span>
                                                        {result.value} {result.unit}
                                                    </span>
                                                    <span className={`test-status ${result.status}`}>{result.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 4: Data Evaluation Offer */}
                <div className={`step ${isStepActive(4) ? "active" : ""} ${isStepCompleted(4) ? "completed" : ""}`}>
                    <div className="step-header" onClick={() => isStepCompleted(3) && setCurrentStep(4)}>
                        <div className="step-number">{isStepCompleted(4) ? "✓" : "4"}</div>
                        <div className="step-title">Data Evaluation Offer (Reverse Payment)</div>
                        <div className="step-status">
                            {isStepCompleted(4) ? "Completed" : isStepActive(4) ? "In Progress" : "Pending"}
                        </div>
                    </div>

                    {isStepActive(4) && (
                        <div className="step-content">
                            {!dataOffer && (
                                <div className="button-group">
                                    <button
                                        className="btn btn-primary"
                                        onClick={getDataOffer}
                                        disabled={dataOfferLoading}
                                    >
                                        {dataOfferLoading ? (
                                            <span className="loading">
                                                <span className="spinner"></span> Loading...
                                            </span>
                                        ) : (
                                            "Request Data Evaluation Offer"
                                        )}
                                    </button>
                                </div>
                            )}

                            {dataOffer && !accessToken && (
                                <div className="data-offer">
                                    <h3>🤖 Data Evaluation Bot Offer</h3>
                                    <p>The bot wants to BUY your anonymized health data for analysis:</p>

                                    <div className="offer-price">+{dataOffer.offer_price} USDC</div>

                                    <ul className="offer-details">
                                        <li>
                                            <strong>Data Scope:</strong> {dataOffer.data_scope}
                                        </li>
                                        <li>
                                            <strong>Usage:</strong> {dataOffer.usage_limitation}
                                        </li>
                                        <li>
                                            <strong>You retain:</strong> Full data ownership, can revoke anytime
                                        </li>
                                    </ul>

                                    <div className="button-group">
                                        <button
                                            className="btn btn-success"
                                            onClick={acceptDataOffer}
                                            disabled={dataOfferLoading}
                                        >
                                            {dataOfferLoading ? (
                                                <span className="loading">
                                                    <span className="spinner"></span> Processing...
                                                </span>
                                            ) : (
                                                `✓ Accept & Get Paid (+${dataOffer.offer_price} USDC)`
                                            )}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setDataOffer(null)}
                                            disabled={dataOfferLoading}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            )}

                            {accessToken && (
                                <div className="results">
                                    <h4 style={{ color: "var(--success)" }}>✓ Payment Received!</h4>
                                    <p>You have been paid for your data. Access token generated.</p>
                                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                                        Token: {accessToken.substring(0, 20)}...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 5: Evaluation Result */}
                <div className={`step ${isStepActive(5) ? "active" : ""} ${isStepCompleted(5) ? "completed" : ""}`}>
                    <div className="step-header" onClick={() => isStepCompleted(4) && setCurrentStep(5)}>
                        <div className="step-number">{isStepCompleted(5) ? "✓" : "5"}</div>
                        <div className="step-title">View Data Evaluation Results</div>
                        <div className="step-status">
                            {isStepCompleted(5) ? "Completed" : isStepActive(5) ? "In Progress" : "Pending"}
                        </div>
                    </div>

                    {isStepActive(5) && (
                        <div className="step-content">
                            {!evaluationResult && (
                                <div className="button-group">
                                    <button
                                        className="btn btn-primary"
                                        onClick={getEvaluationResult}
                                        disabled={evaluationLoading}
                                    >
                                        {evaluationLoading ? (
                                            <span className="loading">
                                                <span className="spinner"></span> Loading...
                                            </span>
                                        ) : (
                                            "View Evaluation Results"
                                        )}
                                    </button>
                                </div>
                            )}

                            {evaluationResult && (
                                <>
                                    <div className="disclaimer">
                                        <span className="disclaimer-icon">⚠️</span>
                                        This evaluation is for informational purposes only and does not constitute medical
                                        advice. Always consult healthcare professionals.
                                    </div>

                                    <div className="results">
                                        <h4>Interpretation</h4>
                                        <p>{evaluationResult.interpretation}</p>

                                        {evaluationResult.areas_of_attention.length > 0 && (
                                            <>
                                                <h4 style={{ marginTop: "1rem" }}>Areas of Attention</h4>
                                                <ul className="results-list">
                                                    {evaluationResult.areas_of_attention.map((area, i) => (
                                                        <li key={i}>
                                                            <span className="icon" style={{ color: "var(--warning)" }}>
                                                                ⚠️
                                                            </span>
                                                            {area}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </div>

                                    <div className="guidance">
                                        <h4>Lifestyle Guidance</h4>
                                        <ul>
                                            {evaluationResult.lifestyle_guidance.map((guidance, i) => (
                                                <li key={i}>{guidance}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="results" style={{ marginTop: "1.5rem", background: "rgba(99, 102, 241, 0.1)" }}>
                                        <h4 style={{ color: "var(--secondary)" }}>🎉 Simulation Complete!</h4>
                                        <p>
                                            You have successfully completed the full x402 healthcare payment simulation
                                            flow, demonstrating:
                                        </p>
                                        <ul className="results-list" style={{ marginTop: "1rem" }}>
                                            <li>
                                                <span className="icon">✓</span>
                                                HTTP 402 Payment Required responses
                                            </li>
                                            <li>
                                                <span className="icon">✓</span>
                                                Pay-per-request API access
                                            </li>
                                            <li>
                                                <span className="icon">✓</span>
                                                Reverse payments (service pays user for data)
                                            </li>
                                            <li>
                                                <span className="icon">✓</span>
                                                Data ownership and consent management
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <footer className="footer">
                <p>
                    This is an educational simulation demonstrating the x402 protocol concept.
                    <br />
                    No real payments, medical data, or health advice is involved.
                </p>
                <p style={{ marginTop: "1rem" }}>
                    Learn more about{" "}
                    <a href="https://www.x402.org/" target="_blank" rel="noopener noreferrer">
                        x402 Protocol
                    </a>
                </p>
            </footer>
        </main>
    );
}
