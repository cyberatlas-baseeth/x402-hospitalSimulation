# x402 Healthcare Payment Simulation

A Next.js application demonstrating the **x402 protocol** with real blockchain payments on **Base Sepolia**. This project showcases an interactive visual simulation with Matrix-inspired aesthetics, MetaMask integration, and on-chain payment verification.

![x402 Protocol](https://img.shields.io/badge/Protocol-x402-00ff41)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Base Sepolia](https://img.shields.io/badge/Network-Base%20Sepolia-0052FF)
![wagmi](https://img.shields.io/badge/wagmi-v2-black)

🔗 **Live Demo:** [x402-hospital-simulation.vercel.app](https://x402-hospital-simulation.vercel.app)

---

## ⚠️ Important Disclaimer

**This is a SIMULATION for educational and demonstration purposes only.**

- ❌ No real medical diagnosis, treatment, or prescriptions
- ✅ Real blockchain transactions on Base Sepolia **testnet**
- ❌ No real health data processing
- ✅ Educational demonstration of x402 concepts
- ✅ MetaMask integration with test ETH

---

## 🆕 What's New: Real x402 Implementation

This project now features **actual x402 protocol implementation**:

| Feature | Description |
|---------|-------------|
| 🦊 **MetaMask Integration** | Connect wallet and pay with real (testnet) ETH |
| ⛓️ **Base Sepolia Network** | All payments on Base Sepolia testnet |
| 🔐 **Real 402 Responses** | APIs return HTTP 402 with payment requirements |
| ✅ **On-chain Verification** | Server verifies transactions on blockchain |
| 🔄 **Auto Chain Switch** | Automatically prompts to switch to Base Sepolia |

---

## 🔬 What is x402?

The **x402 protocol** leverages the HTTP 402 "Payment Required" status code to enable native, programmatic micropayments on the web.

### Key Concept: Who Returns 402, Pays

```
🔐 Server returns 402 → Client pays
💰 Client returns 402 → Server pays
```

### Real x402 Flow (This App)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        x402 PROTOCOL FLOW                            │
└──────────────────────────────────────────────────────────────────────┘

    CLIENT                                                    SERVER
      │                                                          │
      │  1. POST /api/assistant/consult                         │
      │     (no X-PAYMENT header)                               │
      │ ────────────────────────────────────────────────────────►│
      │                                                          │
      │  2. HTTP 402 Payment Required                           │
      │     {                                                    │
      │       "x402": {                                          │
      │         "price": "0.0002",                               │
      │         "currency": "ETH",                               │
      │         "recipient": "0x...",                            │
      │         "network": "base-sepolia"                        │
      │       }                                                  │
      │     }                                                    │
      │ ◄────────────────────────────────────────────────────────│
      │                                                          │
      │  3. ETH Transfer via MetaMask                           │
      │ ────────────────────────► Base Sepolia Blockchain        │
      │                                                          │
      │  4. POST /api/assistant/consult                         │
      │     X-PAYMENT: tx:0x123abc...                           │
      │ ────────────────────────────────────────────────────────►│
      │                                                          │
      │                    5. Verify tx on-chain                │
      │                       ✓ Recipient correct               │
      │                       ✓ Amount sufficient               │
      │                       ✓ Transaction confirmed           │
      │                                                          │
      │  6. HTTP 200 OK                                         │
      │     { "success": true, "analysis": {...} }              │
      │ ◄────────────────────────────────────────────────────────│
```

---

## 🎮 Two Payment Modes

### 🎮 Simulated Mode (Default)
- No wallet needed
- Uses mock balance (0.1 ETH)
- Perfect for testing UI/UX

### ⛓️ Base Sepolia Mode
- Requires MetaMask
- Real transactions on testnet
- On-chain payment verification

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Base Sepolia testnet ETH (from faucet)

### Installation

```bash
# Clone the repository
git clone https://github.com/cyberatlas-baseeth/x402-hospitalSimulation.git
cd x402-hospitalSimulation

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Get Test ETH

1. **Alchemy Faucet:** https://www.alchemy.com/faucets/base-sepolia
2. **QuickNode Faucet:** https://faucet.quicknode.com/base/sepolia
3. **Coinbase Faucet:** https://portal.cdp.coinbase.com/products/faucet

---

## 🏗️ Project Structure

```
x402-hospitalsim/
├── app/
│   ├── simulation/           # Interactive chat-based simulation
│   │   └── page.tsx          # Main simulation with x402 flow
│   ├── api/                  # x402 compliant API routes
│   │   ├── assistant/        # AI consultation (402 protected)
│   │   ├── expert/           # Expert selection (402 protected)
│   │   ├── labs/             # Laboratory services
│   │   └── data-evaluator/   # Data monetization (reverse 402)
│   ├── providers.tsx         # Wagmi + React Query providers
│   ├── globals.css           # Matrix-style design system
│   ├── page.tsx              # Landing page
│   └── layout.tsx            # Root layout with providers
├── components/
│   └── ConnectWallet.tsx     # MetaMask connection component
├── hooks/
│   └── useX402.ts            # x402 protocol hook (402 → pay → retry)
├── lib/
│   ├── x402.ts               # Server-side x402 middleware
│   ├── wagmiConfig.ts        # Wagmi configuration (Base Sepolia)
│   └── mockData.ts           # Healthcare data generators
├── public/
│   ├── avatars/              # AI expert avatars
│   ├── banana-client.svg     # Client icon for flow diagram
│   └── banana-server.svg     # Server icon for flow diagram
└── package.json
```

---

## 🔧 API Endpoints

All protected endpoints return **HTTP 402** without valid payment.

### `POST /api/expert/select`
Select AI expert. **Requires payment.**

```bash
# Without payment → 402
curl -X POST https://your-app.vercel.app/api/expert/select \
  -H "Content-Type: application/json" \
  -d '{"expert_id": "grok", "price": "0.0005"}'

# Response: HTTP 402
{
  "status": 402,
  "x402": {
    "version": "1.0",
    "price": "0.0005",
    "currency": "ETH",
    "network": "base-sepolia",
    "recipient": "0x..."
  }
}

# With payment → 200
curl -X POST https://your-app.vercel.app/api/expert/select \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: tx:0x123abc..." \
  -d '{"expert_id": "grok", "price": "0.0005"}'
```

### `POST /api/assistant/consult`
AI Health consultation. **Requires payment (0.0002 ETH).**

### `POST /api/labs/order`
Place lab test order. **Requires payment (0.0012-0.0025 ETH).**

### `GET /api/labs/offers`
Get laboratory offers. **Free access.**

### `POST /api/data-evaluator/accept`
Accept data offer - **Reverse x402 (Server pays Client).**

---

## 🏥 Application Flow

| Step | Action | Payment Direction | Cost (ETH) |
|------|--------|-------------------|------------|
| 1 | Select AI Expert | Client → Server | 0.0005-0.0008 |
| 2 | Describe Symptoms | Client → Server | 0.0002 |
| 3 | Browse Lab Offers | Free | - |
| 4 | Order Lab Tests | Client → Server | 0.0012-0.0025 |
| 5 | Sell Health Data | Server → Client | +0.0011 |
| 6 | Get Analysis | Free | - |

---

## 🌐 Deploy on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cyberatlas-baseeth/x402-hospitalSimulation)

### Environment Variables (Optional)

```env
# Wallet address to receive payments
NEXT_PUBLIC_RECEIVER_WALLET=0xYourWalletAddress
```

If not set, payments go to a default address.

---

## 🔐 x402 Implementation Details

### Server-Side (`lib/x402.ts`)

```typescript
// Middleware for protected routes
const { authorized, response } = await requirePayment(
  request,
  "0.0002",  // Price in ETH
  "AI Consultation Fee"
);

if (!authorized) {
  return response; // Returns 402 with payment details
}

// Payment verified - continue with request
```

### Client-Side (`hooks/useX402.ts`)

```typescript
const { x402Fetch, sendPaymentAndRetry } = useX402();

// Make request - will get 402
const result = await x402Fetch("/api/assistant/consult", {
  method: "POST",
  body: JSON.stringify({ symptoms: "..." })
});

if (result.needsPayment) {
  // Send ETH and retry automatically
  const finalResult = await sendPaymentAndRetry();
}
```

---

## 🎨 Design System

The UI features a **Matrix-inspired** aesthetic:

| Element | Value |
|---------|-------|
| Primary Color | Neon Green `#00ff41` |
| Background | Dark terminal `#0d1117` |
| Client Accent | Blue `#3b82f6` |
| Server Accent | Purple `#8b5cf6` |
| Font | Courier New (monospace) |
| Effects | Glow animations, pulse effects |

---

## 🛡️ Security Features

- ✅ On-chain transaction verification
- ✅ Replay attack protection (tx hash caching)
- ✅ Amount validation with tolerance
- ✅ Recipient address verification
- ✅ Chain ID enforcement (Base Sepolia only)

---

## 📚 Learn More

- [x402 Protocol](https://www.x402.org/) - Official documentation
- [HTTP 402 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402) - MDN
- [Base Sepolia](https://docs.base.org/docs/network-information) - Network info
- [wagmi Documentation](https://wagmi.sh/) - React hooks for Ethereum
- [viem Documentation](https://viem.sh/) - TypeScript Ethereum library

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework |
| wagmi v2 | Ethereum React hooks |
| viem | Ethereum interactions |
| Base Sepolia | Testnet blockchain |
| Vercel | Deployment |

---

## 📄 License

MIT License - This project is for educational purposes.

---

<p align="center">
  <strong>[ x402 ]</strong><br>
  <em>Real pay-per-request healthcare simulation on Base Sepolia</em>
</p>
