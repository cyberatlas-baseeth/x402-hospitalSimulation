"use client";

import { useState, useRef } from "react";
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
}

interface AIExpert {
    id: string;
    name: string;
    avatar: string;
    color: string;
    price: string;
}

type SimStep = 0 | 1 | 2 | 3 | 4 | 5;

const AI_EXPERTS: AIExpert[] = [
    { id: "grok", name: "Grok", avatar: "/avatars/grok.png", color: "#1DA1F2", price: "0.005" },
    { id: "chatgpt", name: "ChatGPT", avatar: "/avatars/chatgpt.png", color: "#10a37f", price: "0.008" },
    { id: "claude", name: "Claude", avatar: "/avatars/claude.png", color: "#D97757", price: "0.006" },
];

const AVATARS: Record<string, string> = {
    patient: "/avatars/patient.png",
    doctor: "/avatars/doctor.png",
    labtech: "/avatars/labtech.png",
    databot: "/avatars/databot.png",
};

const NAMES: Record<string, string> = {
    patient: "Patient",
    doctor: "AI Doctor",
    labtech: "Lab Tech",
    databot: "Data Bot",
};

export default function SimulationPage() {
    const [step, setStep] = useState<SimStep>(0);
    const [selectedExpert, setSelectedExpert] = useState<AIExpert | null>(null);
    const [balance, setBalance] = useState(1.0); // Starting balance: 1 USDC
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [labOffers, setLabOffers] = useState<LabOffer[]>([]);
    const [selectedLab, setSelectedLab] = useState<LabOffer | null>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [dataOfferPrice, setDataOfferPrice] = useState("");
    const [showComplete, setShowComplete] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [healthAnalysis, setHealthAnalysis] = useState<{ interpretation: string; guidance: string[] } | null>(null);

    // Payment Flow Modal State
    const [showPaymentFlow, setShowPaymentFlow] = useState(false);
    const [paymentFlowStep, setPaymentFlowStep] = useState(0);
    const [paymentFlowEndpoint, setPaymentFlowEndpoint] = useState("");
    
    // Ref to resolve the payment flow promise when user closes modal
    const paymentFlowResolveRef = useRef<(() => void) | null>(null);

    // Wait for user to close the payment flow modal
    const waitForPaymentFlowClose = (): Promise<void> => {
        return new Promise((resolve) => {
            paymentFlowResolveRef.current = resolve;
        });
    };

    // Close payment flow and continue the process
    const closePaymentFlow = () => {
        setShowPaymentFlow(false);
        setPaymentFlowStep(0);
        if (paymentFlowResolveRef.current) {
            paymentFlowResolveRef.current();
            paymentFlowResolveRef.current = null;
        }
    };

    const deductBalance = (amount: number) => {
        setBalance((prev) => Math.max(0, prev - amount));
    };

    const addBalance = (amount: number) => {
        setBalance((prev) => prev + amount);
    };

    const addMessage = (sender: Message["sender"], text: string) => {
        setMessages((prev) => [...prev, { id: Date.now(), sender, text }]);
    };

    const simulateTyping = async (sender: Message["sender"], text: string, delay = 1000) => {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, delay));
        setIsTyping(false);
        addMessage(sender, text);
    };

    // Step 0: Select AI Expert
    const selectExpert = async (expert: AIExpert) => {
        setActionLoading(true);
        setSelectedExpert(expert);

        const price = parseFloat(expert.price);

        // Start payment flow visualization for expert selection
        setPaymentFlowEndpoint(`/api/expert/${expert.id}`);
        setShowPaymentFlow(true);
        setPaymentFlowStep(1);
        await new Promise(r => setTimeout(r, 600));
        setPaymentFlowStep(2);
        await new Promise(r => setTimeout(r, 800));
        setPaymentFlowStep(3);
        await new Promise(r => setTimeout(r, 600));
        setPaymentFlowStep(4);
        
        // Wait for user to close the modal before continuing
        await waitForPaymentFlowClose();

        deductBalance(price);

        NAMES.doctor = expert.name;
        AVATARS.doctor = expert.avatar;

        await new Promise((r) => setTimeout(r, 500));
        addMessage("patient", `I'd like to consult with ${expert.name} today.`);
        await simulateTyping("doctor", `Hello! I'm ${expert.name}, your AI medical assistant. I'm ready to help you. What symptoms are you experiencing?`, 1500);

        setStep(1);
        setActionLoading(false);
    };

    // Consultation fee
    const CONSULTATION_FEE = "0.002";

    // Step 1: Start consultation
    const startConsultation = async () => {
        setActionLoading(true);
        addMessage("patient", "Hello doctor, I've been feeling very tired lately, having headaches, and trouble sleeping.");

        await simulateTyping("doctor", "I understand. Let me analyze your symptoms...", 1500);

        // Start payment flow visualization for consultation
        setPaymentFlowEndpoint("/api/assistant/consult");
        setShowPaymentFlow(true);
        setPaymentFlowStep(1);
        await new Promise(r => setTimeout(r, 600));
        setPaymentFlowStep(2);
        await new Promise(r => setTimeout(r, 800));
        setPaymentFlowStep(3);
        await new Promise(r => setTimeout(r, 600));
        setPaymentFlowStep(4);
        
        // Wait for user to close the modal before continuing
        await waitForPaymentFlowClose();

        // Deduct consultation fee after user confirms
        deductBalance(parseFloat(CONSULTATION_FEE));

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

        const price = parseFloat(selectedLab.price);
        addMessage("patient", `Here's my payment of ${selectedLab.price} USDC.`);

        // Start payment flow visualization
        setPaymentFlowEndpoint("/api/labs/order");
        setShowPaymentFlow(true);
        setPaymentFlowStep(1);
        await new Promise(r => setTimeout(r, 600));
        setPaymentFlowStep(2);
        await new Promise(r => setTimeout(r, 800));
        setPaymentFlowStep(3);
        await new Promise(r => setTimeout(r, 600));
        setPaymentFlowStep(4);

        // Wait for user to close the modal before continuing
        await waitForPaymentFlowClose();

        // Deduct balance after user confirms
        deductBalance(price);

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

    const [accessToken, setAccessToken] = useState<string>("");

    // Step 4b: Accept offer
    const acceptDataOffer = async () => {
        setActionLoading(true);
        addMessage("patient", "I accept your offer.");

        try {
            const res = await fetch("/api/data-evaluator/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ offer_id: "data-sell-123", offer_price: dataOfferPrice }),
            });
            const data = await res.json();

            if (data.success) {
                setAccessToken(data.access_token);
                const price = parseFloat(dataOfferPrice);
                addBalance(price);
                await simulateTyping("databot", `Thank you! I've sent ${dataOfferPrice} USDC to your wallet. Let me analyze your data...`, 1500);
                setStep(5);
            }
        } catch (error) {
            console.error(error);
        }
        setActionLoading(false);
    };

    // Step 5: Get evaluation
    const getEvaluation = async () => {
        setActionLoading(true);

        try {
            const res = await fetch(`/api/data-evaluator/result?results=${encodeURIComponent(JSON.stringify(testResults))}`, {
                headers: { "X-ACCESS-TOKEN": accessToken || "access_sim_default" },
            });
            const data = await res.json();

            if (data.success) {
                setHealthAnalysis({
                    interpretation: data.interpretation,
                    guidance: data.lifestyle_guidance || [
                        "Maintain a balanced diet rich in whole foods.",
                        "Aim for 7-9 hours of quality sleep per night.",
                        "Engage in at least 30 minutes of moderate exercise daily.",
                        "Stay hydrated by drinking plenty of water throughout the day."
                    ]
                });

                await simulateTyping(
                    "databot",
                    `Analysis complete! ${data.interpretation}`,
                    2000
                );
            } else {
                throw new Error("Analysis failed");
            }
        } catch (error) {
            console.error(error);
            // Fallback Health Analysis if API fails
            setHealthAnalysis({
                interpretation: "Based on our general health patterns, we recommend focusing on preventative care and consistent monitoring of your vital signs.",
                guidance: [
                    "General: Stay active with at least 150 minutes of moderate activity per week.",
                    "Nutrition: Increase intake of leafy greens and reduce processed sugars.",
                    "Sleep: Establish a consistent sleep-wake cycle even on weekends.",
                    "Stress: Practice mindfulness or meditation for 10 minutes daily.",
                    "Monitoring: Regularly check blood pressure and keep a symptom diary."
                ]
            });
            await simulateTyping("databot", "I've completed a general analysis based on standard health protocols.", 1500);
        }
        await simulateTyping("doctor", "This demonstrates how the x402 protocol enables secure, automated health data transactions with instant analysis.", 2000);
        setShowComplete(true);
        setActionLoading(false);
    };

    // Restart
    const restart = () => {
        setStep(0);
        setSelectedExpert(null);
        setBalance(1.0);
        setMessages([]);
        setLabOffers([]);
        setSelectedLab(null);
        setTestResults([]);
        setDataOfferPrice("");
        setShowComplete(false);
        setHealthAnalysis(null);
        NAMES.doctor = "AI Doctor";
        AVATARS.doctor = "/avatars/doctor.png";
    };

    return (
        <main className="simulation-container">
            <Link href="/" className="back-link">← Back to Home</Link>

            {/* Balance Display */}
            <div className="balance-display">
                <span className="balance-label">💰 Balance:</span>
                <span className="balance-value">{balance.toFixed(3)} USDC</span>
            </div>

            <div className="simulation-header matrix-style">
                <div className="matrix-title">
                    <span className="matrix-bracket">[</span>
                    <h1>x402</h1>
                    <span className="matrix-bracket">]</span>
                </div>
                <p className="matrix-subtitle">Healthcare Payment Simulation</p>
            </div>

            {/* Step 0: AI Expert Selection */}
            {step === 0 && (
                <div className="expert-selection">
                    <h2>🤖 Choose Your AI Medical Expert</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                        Each expert has different consultation fees
                    </p>
                    <div className="expert-cards">
                        {AI_EXPERTS.map((expert) => (
                            <div
                                key={expert.id}
                                className="expert-card"
                                style={{ borderColor: expert.color }}
                                onClick={() => !actionLoading && selectExpert(expert)}
                            >
                                <div className="expert-avatar-container">
                                    <Image
                                        src={expert.avatar}
                                        alt={expert.name}
                                        width={80}
                                        height={80}
                                        className="expert-avatar-img"
                                    />
                                </div>
                                <h3>{expert.name}</h3>
                                <div className="expert-price">{expert.price} USDC</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Container */}
            {step > 0 && (
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
            )}

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

            {/* Health Analysis Display */}
            {healthAnalysis && (
                <div className="health-analysis">
                    <h3>📋 Health Analysis Report</h3>
                    <p className="analysis-interpretation">{healthAnalysis.interpretation}</p>
                    {healthAnalysis.guidance.length > 0 && (
                        <>
                            <h4>💡 Recommendations:</h4>
                            <ul className="analysis-guidance">
                                {healthAnalysis.guidance.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}

            {/* Action Area */}
            {step > 0 && (
                <div className="action-area">
                    {step === 1 && !messages.some(m => m.sender === "patient" && m.text.includes("tired")) && (
                        <>
                            <h3>💬 Describe Your Symptoms</h3>
                            <button className="btn btn-primary" onClick={startConsultation} disabled={actionLoading}>
                                {actionLoading ? "Processing..." : "🩺 Share Symptoms"}
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
                                Final Balance: <strong>{balance.toFixed(3)} USDC</strong>
                            </p>
                            <button className="btn btn-secondary" onClick={restart}>
                                🔄 Restart Simulation
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Progress */}
            {step > 0 && (
                <div className="progress-bar">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={`progress-dot ${s === step ? "active" : ""} ${s < step ? "completed" : ""}`}
                        />
                    ))}
                </div>
            )}

            {/* Payment Flow Visualization Modal */}
            {showPaymentFlow && (
                <div className="payment-flow-overlay" onClick={paymentFlowStep === 4 ? closePaymentFlow : undefined}>
                    <div className="payment-flow-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-flow-header">
                            <h3 className="payment-flow-title">🔐 x402 Payment Protocol</h3>
                            {paymentFlowStep === 4 && (
                                <button className="payment-flow-close" onClick={closePaymentFlow}>✕</button>
                            )}
                        </div>
                        <p className="payment-flow-endpoint">Endpoint: <code>{paymentFlowEndpoint}</code></p>
                        
                        <div className="payment-flow-diagram">
                            {/* Client */}
                            <div className="flow-actor client">
                                <div className="actor-icon">
                                    <Image src="/banana-client.svg" alt="Client Banana" width={60} height={60} />
                                </div>
                                <span className="actor-label">Client</span>
                            </div>

                            {/* Connection Lines & Messages */}
                            <div className="flow-connection">
                                {/* Step 1: Initial Request */}
                                <div className={`flow-message request ${paymentFlowStep >= 1 ? "active" : ""}`}>
                                    <div className="message-arrow right">→</div>
                                    <div className="message-content">
                                        <span className="message-method">POST</span>
                                        <span className="message-text">Request (no payment header)</span>
                                    </div>
                                </div>

                                {/* Step 2: 402 Response */}
                                <div className={`flow-message response error ${paymentFlowStep >= 2 ? "active" : ""}`}>
                                    <div className="message-arrow left">←</div>
                                    <div className="message-content">
                                        <span className="message-status">402</span>
                                        <span className="message-text">Payment Required</span>
                                    </div>
                                </div>

                                {/* Step 3: Payment Request */}
                                <div className={`flow-message request ${paymentFlowStep >= 3 ? "active" : ""}`}>
                                    <div className="message-arrow right">→</div>
                                    <div className="message-content">
                                        <span className="message-method">POST</span>
                                        <span className="message-text">+ X-PAYMENT: simulated</span>
                                    </div>
                                </div>

                                {/* Step 4: Success Response */}
                                <div className={`flow-message response success ${paymentFlowStep >= 4 ? "active" : ""}`}>
                                    <div className="message-arrow left">←</div>
                                    <div className="message-content">
                                        <span className="message-status success">200</span>
                                        <span className="message-text">Success!</span>
                                    </div>
                                </div>
                            </div>

                            {/* Server */}
                            <div className="flow-actor server">
                                <div className="actor-icon">
                                    <Image src="/banana-server.svg" alt="Server Banana" width={60} height={60} />
                                </div>
                                <span className="actor-label">Server</span>
                            </div>
                        </div>

                        {/* HTTP 402 Response Code Block */}
                        {paymentFlowStep >= 2 && (
                            <div className="http-response-block">
                                <div className="response-header">
                                    <span className="response-status-badge error">HTTP 402 Response</span>
                                </div>
                                <pre className="response-code">{`{
  "status": 402,
  "payment_info": {
    "price": "${paymentFlowEndpoint.includes("consult") ? CONSULTATION_FEE : (paymentFlowEndpoint.includes("expert") ? selectedExpert?.price : (selectedLab?.price || "0.015"))}",
    "currency": "USDC",
    "payment_required": true,
    "description": "${paymentFlowEndpoint.includes("consult") ? "AI Health Assistant Consultation Fee" : (paymentFlowEndpoint.includes("expert") ? `AI Expert Selection - ${selectedExpert?.name}` : "Lab Test Order")}",
    "recipient": "${paymentFlowEndpoint.includes("consult") ? "ai-health-assistant" : (paymentFlowEndpoint.includes("expert") ? `expert-${selectedExpert?.id}` : "lab-" + (selectedLab?.lab_id || "001"))}"
  },
  "message": "Payment of ${paymentFlowEndpoint.includes("consult") ? CONSULTATION_FEE : (paymentFlowEndpoint.includes("expert") ? selectedExpert?.price : (selectedLab?.price || "0.015"))} USDC required to access this resource."
}`}</pre>
                            </div>
                        )}

                        <div className="payment-flow-status">
                            {paymentFlowStep === 1 && <span className="status-text">📤 Sending request...</span>}
                            {paymentFlowStep === 2 && <span className="status-text warning">⚠️ Payment required! HTTP 402</span>}
                            {paymentFlowStep === 3 && <span className="status-text">💳 Attaching payment proof...</span>}
                            {paymentFlowStep === 4 && <span className="status-text success">✅ Payment verified! Receiving data...</span>}
                        </div>

                        {paymentFlowStep === 4 && (
                            <p className="payment-flow-hint">✨ Click anywhere or press ✕ to continue</p>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
