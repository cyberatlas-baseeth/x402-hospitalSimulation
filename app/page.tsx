"use client";

import Link from "next/link";

export default function Home() {
    return (
        <main className="container landing">
            <header className="header">
                <div className="matrix-logo-lg">
                    <span className="matrix-bracket-lg">[</span>
                    <span className="matrix-text-lg">x402</span>
                    <span className="matrix-bracket-lg">]</span>
                </div>
                <h1>Healthcare Payment Simulation</h1>
                <p className="subtitle">
                    Experience pay-per-request healthcare interactions using the x402 protocol
                </p>
                <span className="badge">🔬 Educational Demo</span>
            </header>

            <div className="hero-section">
                <div className="hero-content">
                    <h2>What is x402?</h2>
                    <p>
                        The x402 protocol leverages HTTP 402 &quot;Payment Required&quot; status code 
                        to enable native, programmatic micropayments on the web.
                    </p>
                    <ul className="hero-features">
                        <li>🔐 Server returns 402 → Client pays</li>
                        <li>💰 Client returns 402 → Server pays</li>
                        <li>⚡ Instant micropayments per request</li>
                        <li>🏥 Healthcare data monetization demo</li>
                    </ul>
                </div>

                <Link href="/simulation" className="start-button">
                    <span className="start-icon">▶</span>
                    <span className="start-text">Start Simulation</span>
                </Link>
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
