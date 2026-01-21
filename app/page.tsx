"use client";

import Link from "next/link";

export default function Home() {
    return (
        <main className="container landing">
            <header className="header">
                <h1>x402 Healthcare Simulation</h1>
                <p className="subtitle">
                    Experience pay-per-request healthcare interactions using the x402 protocol
                </p>
                <span className="badge">🔬 Educational Demo</span>
            </header>

            <div className="version-selector">
                <h2>Choose Your Experience</h2>
                <p className="version-subtitle">
                    Select how you&apos;d like to explore the x402 payment simulation
                </p>

                <div className="version-cards">
                    <Link href="/prompt" className="version-card">
                        <div className="version-icon">📝</div>
                        <h3>Prompt Version</h3>
                        <p>
                            Step-by-step interface with forms and buttons.
                            Enter your symptoms and interact with each stage manually.
                        </p>
                        <div className="version-features">
                            <span>✓ Form-based input</span>
                            <span>✓ Detailed controls</span>
                            <span>✓ Technical view</span>
                        </div>
                        <span className="version-cta">Start Prompt Mode →</span>
                    </Link>

                    <Link href="/simulation" className="version-card simulation">
                        <div className="version-icon matrix-logo-sm">
                            <span className="matrix-bracket-sm">[</span>
                            <span className="matrix-text-sm">x402</span>
                            <span className="matrix-bracket-sm">]</span>
                        </div>
                        <h3>Simulation Version</h3>
                        <p>
                            Animated visual experience with character avatars
                            and speech bubble conversations.
                        </p>
                        <div className="version-features">
                            <span>✓ Character avatars</span>
                            <span>✓ Speech bubbles</span>
                            <span>✓ Animated flow</span>
                        </div>
                        <span className="version-cta">Start Simulation →</span>
                    </Link>
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
