"use client";

import { useState } from "react";
import Image from "next/image";
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

interface Message {
    id: number;
    sender: "patient" | "doctor" | "labtech" | "databot";
    text: string;
    isTyping?: boolean;
}

type SimStep = 1 | 2 | 3 | 4 | 5;

const AVATARS = {
    patient: "/avatars/patient.png",
    doctor: "/avatars/doctor.png",
    labtech: "/avatars/labtech.png",
    databot: "/avatars/databot.png",
};

const NAMES = {
    patient: "Patient",
    doctor: "AI Doctor",
    labtech: "Lab Tech",
    databot: "Data Bot",
};

export default function SimulationPage() {
    const [step, setStep] = useState<SimStep>(1);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [labOffers, setLabOffers] = useState<LabOffer[]>([]);
    const [selectedLab, setSelectedLab] = useState<LabOffer | null>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [dataOfferPrice, setDataOfferPrice] = useState("");
    const [showComplete, setShowComplete] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const addMessage = (sender: Message["sender"], text: string) => {
        setMessages((prev) => [...prev, { id: Date.now(), sender, text }]);
    };

    const simulateTyping = async (sender: Message["sender"], text: string, delay = 1000) => {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, delay));
        setIsTyping(false);
        addMessage(sender, text);
    };

    // Step 1: Start consultation
    const startConsultation = async () => {
        setActionLoading(true);
        addMessage("patient", "Hello doctor, I've been feeling very tired lately, having headaches, and trouble sleeping.");

        await simulateTyping("doctor", "I understand. Let me analyze your symptoms...", 1500);

        // Simulate API call
        try {
            const res = await fetch("/api/assistant/consult", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-PAYMENT": "simulated" },
                body: JSON.stringify({ symptoms: "fatigue, headache, trouble sleeping" }),
            });
            const data = await res.json();

            if (data.success) {
                await simulateTyping(
                    "doctor",
                    `Based on your symptoms, I recommend these tests: ${data.analysis.recommended_tests.join(", ")}. Let me connect you with our lab network.`,
                    2000
                );
                setStep(2);
            }
        } catch (error) {
            console.error(error);
        }
        setActionLoading(false);
    };

    // Step 2: Get lab offers
    const getLabOffers = async () => {
        setActionLoading(true);
        await simulateTyping("doctor", "Connecting to laboratory network...", 1000);

        try {
            const res = await fetch("/api/labs/offers?tests=Complete Blood Count,Vitamin D,Thyroid Panel");
            const data = await res.json();

            if (data.success) {
                setLabOffers(data.offers);
                await simulateTyping("labtech", "Here are the available lab options for your tests:", 1000);
            }
        } catch (error) {
            console.error(error);
        }
        setActionLoading(false);
    };

    // Step 2b: Select lab and continue
    const selectLabAndContinue = async () => {
        if (!selectedLab) return;
        setActionLoading(true);

        addMessage("patient", `I'll go with ${selectedLab.lab_name}.`);
        await simulateTyping("labtech", `Great choice! ${selectedLab.lab_name} will process your tests. Please proceed to payment.`, 1500);
        setStep(3);
        setActionLoading(false);
    };

    // Step 3: Order tests
    const orderTests = async () => {
        if (!selectedLab) return;
        setActionLoading(true);

        addMessage("patient", `Here's my payment of ${selectedLab.price} USDC.`);

        try {
            const res = await fetch("/api/labs/order", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-PAYMENT": "simulated" },
                body: JSON.stringify({
                    lab_id: selectedLab.lab_id,
                    tests: selectedLab.tests,
                    price: selectedLab.price,
                }),
            });
            const data = await res.json();

            if (data.success) {
                setTestResults(data.results);
                await simulateTyping("labtech", "Payment received! Here are your test results:", 2000);
                setStep(4);
            }
        } catch (error) {
            console.error(error);
        }
        setActionLoading(false);
    };

    // Step 4: Data offer
    const getDataOffer = async () => {
        setActionLoading(true);

        try {
            const res = await fetch("/api/data-evaluator/offer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ test_results: testResults }),
            });
            const data = await res.json();

            if (data.success) {
                setDataOfferPrice(data.offer_price);
                await simulateTyping(
                    "databot",
                    `Hello! I'm a research data evaluator. I'd like to purchase your anonymized health data for ${data.offer_price} USDC. In return, I'll also provide you with a detailed health analysis.`,
                    2000
                );
            }
        } catch (error) {
            console.error(error);
        }
        setActionLoading(false);
    };

    // Step 4b: Accept offer
    const acceptDataOffer = async () => {
        setActionLoading(true);
        addMessage("patient", "I accept your offer.");

        await simulateTyping("databot", `Thank you! I've sent ${dataOfferPrice} USDC to your wallet. Let me analyze your data...`, 1500);
        setStep(5);
        setActionLoading(false);
    };

    // Step 5: Get evaluation
    const getEvaluation = async () => {
        setActionLoading(true);

        try {
            const res = await fetch(`/api/data-evaluator/result?results=${encodeURIComponent(JSON.stringify(testResults))}`, {
                headers: { "X-ACCESS-TOKEN": "sim-token-12345" },
            });
            const data = await res.json();

            if (data.success) {
                await simulateTyping(
                    "databot",
                    `Here's my analysis: ${data.interpretation}. Recommendations: ${data.lifestyle_guidance.slice(0, 2).join(", ")}.`,
                    2500
                );
                await simulateTyping("doctor", "Thank you for using our x402 healthcare simulation! This demonstrates how pay-per-request APIs work.", 2000);
                setShowComplete(true);
            }
        } catch (error) {
            console.error(error);
        }
        setActionLoading(false);
    };

    // Restart
    const restart = () => {
        setStep(1);
        setMessages([]);
        setLabOffers([]);
        setSelectedLab(null);
        setTestResults([]);
        setDataOfferPrice("");
        setShowComplete(false);
    };

    return (
        <main className="simulation-container">
            <Link href="/" className="back-link">← Back to Home</Link>

            <div className="simulation-header">
                <h1>🎭 Simulation Mode</h1>
                <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    Watch the x402 healthcare flow unfold with animated conversations
                </p>
            </div>

            {/* Chat Container */}
            <div className="chat-container">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender === "patient" ? "left" : "right"}`}>
                        <Image
                            src={AVATARS[msg.sender]}
                            alt={NAMES[msg.sender]}
                            width={60}
                            height={60}
                            className="avatar"
                        />
                        <div className="bubble">
                            <div className="bubble-name">{NAMES[msg.sender]}</div>
                            <div className="bubble-text">{msg.text}</div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message right">
                        <div className="bubble">
                            <div className="typing">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lab Offers Display */}
            {step === 2 && labOffers.length > 0 && (
                <div className="sim-lab-cards">
                    {labOffers.map((offer) => (
                        <div
                            key={offer.lab_id}
                            className={`sim-lab-card ${selectedLab?.lab_id === offer.lab_id ? "selected" : ""}`}
                            onClick={() => setSelectedLab(offer)}
                        >
                            <span className="lab-name">{offer.lab_name}</span>
                            <span className="lab-price">{offer.price} USDC</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Test Results Display */}
            {step >= 4 && testResults.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                    {testResults.map((result, i) => (
                        <div key={i} className={`sim-test-result ${result.status}`}>
                            <span>{result.test_name}</span>
                            <span>{result.value} {result.unit} ({result.status})</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Area */}
            <div className="action-area">
                {step === 1 && messages.length === 0 && (
                    <>
                        <h3>👋 Start the Simulation</h3>
                        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                            Click below to begin the healthcare consultation
                        </p>
                        <button className="btn btn-primary" onClick={startConsultation} disabled={actionLoading}>
                            {actionLoading ? "Starting..." : "🩺 Start Consultation"}
                        </button>
                    </>
                )}

                {step === 2 && labOffers.length === 0 && (
                    <button className="btn btn-primary" onClick={getLabOffers} disabled={actionLoading}>
                        {actionLoading ? "Connecting..." : "🔬 Get Lab Offers"}
                    </button>
                )}

                {step === 2 && labOffers.length > 0 && (
                    <button className="btn btn-success" onClick={selectLabAndContinue} disabled={!selectedLab || actionLoading}>
                        {actionLoading ? "Processing..." : "✓ Confirm Selection"}
                    </button>
                )}

                {step === 3 && (
                    <>
                        <div className="payment-banner" style={{ marginBottom: "1rem" }}>
                            <h3>🔒 Payment Required</h3>
                            <div className="price">{selectedLab?.price} <span className="currency">USDC</span></div>
                        </div>
                        <button className="btn btn-warning" onClick={orderTests} disabled={actionLoading}>
                            {actionLoading ? "Processing..." : "💳 Pay & Get Results"}
                        </button>
                    </>
                )}

                {step === 4 && !dataOfferPrice && (
                    <button className="btn btn-primary" onClick={getDataOffer} disabled={actionLoading}>
                        {actionLoading ? "Connecting..." : "🤖 Check Data Offers"}
                    </button>
                )}

                {step === 4 && dataOfferPrice && (
                    <button className="btn btn-success" onClick={acceptDataOffer} disabled={actionLoading}>
                        {actionLoading ? "Processing..." : `✓ Accept & Get Paid (+${dataOfferPrice} USDC)`}
                    </button>
                )}

                {step === 5 && !showComplete && (
                    <button className="btn btn-primary" onClick={getEvaluation} disabled={actionLoading}>
                        {actionLoading ? "Analyzing..." : "📊 Get Health Analysis"}
                    </button>
                )}

                {showComplete && (
                    <>
                        <h3 style={{ color: "var(--success)" }}>🎉 Simulation Complete!</h3>
                        <p style={{ color: "var(--text-muted)", margin: "1rem 0" }}>
                            You&apos;ve completed the full x402 healthcare payment simulation.
                        </p>
                        <button className="btn btn-secondary" onClick={restart}>
                            🔄 Restart Simulation
                        </button>
                    </>
                )}
            </div>

            {/* Progress */}
            <div className="progress-bar">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div
                        key={s}
                        className={`progress-dot ${s === step ? "active" : ""} ${s < step ? "completed" : ""}`}
                    />
                ))}
            </div>
        </main>
    );
}
