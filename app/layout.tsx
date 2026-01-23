import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "x402 Healthcare Simulation - Pay-per-Request Medical Demo",
    description:
        "A demonstration of x402 protocol for healthcare payments. " +
        "Simulates pay-per-request interactions between patients, AI assistants, labs, and data evaluators.",
    keywords: ["x402", "healthcare", "simulation", "web3", "payments", "USDC"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
