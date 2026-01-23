# x402 Healthcare Payment Simulation

A Next.js application demonstrating the **x402 protocol** for pay-per-request healthcare interactions. This project showcases an interactive visual simulation with Matrix-inspired aesthetics and real-time payment flow visualization.

![x402 Protocol](https://img.shields.io/badge/Protocol-x402-00ff41)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Aesthetics](https://img.shields.io/badge/Aesthetics-Matrix--Core-00ff41)
![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-black)

🔗 **Live Demo:** [x402-hospital-simulation.vercel.app](https://x402-hospital-simulation.vercel.app)

---

## ⚠️ Important Disclaimer

**This is a SIMULATION for educational and demonstration purposes only.**

- ❌ No real medical diagnosis, treatment, or prescriptions
- ❌ No actual blockchain transactions or payments
- ❌ No real health data processing
- ✅ Educational demonstration of x402 concepts
- ✅ Simulated payment flows with mock data

---

## 🔬 What is x402?

The **x402 protocol** leverages the HTTP 402 "Payment Required" status code to enable native, programmatic micropayments on the web.

### Key Concept: Who Returns 402, Pays

```
🔐 Server returns 402 → Client pays
💰 Client returns 402 → Server pays
```

This simple rule enables bidirectional payments - services can charge users, OR users can charge services for their data!

### Standard Flow (Client Pays)

```
┌─────────┐                              ┌─────────┐
│ Client  │ ──── POST /api/resource ───► │ Server  │
│         │ ◄─────── HTTP 402 ────────── │         │
│         │     { price: "0.01 USDC" }   │         │
│         │                              │         │
│         │ ── POST + X-PAYMENT header ─►│         │
│         │ ◄─────── HTTP 200 ────────── │         │
│         │     { data: "..." }          │         │
└─────────┘                              └─────────┘
```

### Reverse Flow (Server Pays)

```
┌─────────┐                              ┌─────────┐
│ Client  │ ◄──── GET /user/data ─────── │ Server  │
│         │ ──────── HTTP 402 ─────────► │         │
│         │     { price: "0.01 USDC" }   │         │
│         │                              │         │
│         │ ◄─── X-PAYMENT header ────── │         │
│         │ ──────── HTTP 200 ─────────► │         │
│         │     { data: "..." }          │         │
└─────────┘                              └─────────┘
```

---

## 🎮 Simulation Features

### 🤖 AI Expert Selection
Choose your AI medical assistant with different consultation fees:
- **Grok** - 0.005 USDC
- **ChatGPT** - 0.008 USDC  
- **Claude** - 0.006 USDC

### 💬 Interactive Chat Interface
- Real-time typing effects
- Character avatars and speech bubbles
- Dynamic USDC balance tracking

### 📊 Payment Flow Visualization
Every payment triggers a visual modal showing the x402 protocol in action:

```
┌─────────────────────────────────────────────────────┐
│  🔐 x402 Payment Protocol                       [✕] │
│  Endpoint: /api/assistant/consult                   │
├─────────────────────────────────────────────────────┤
│  💻 Client          ──────►          🖥️ Server      │
│                                                     │
│  [POST] Request (no payment)         ────►          │
│                                      ◄────          │
│              [402] Payment Required                 │
│              { price: "0.002 USDC" }                │
│                                                     │
│  [POST] + X-PAYMENT: simulated       ────►          │
│                                      ◄────          │
│              [200] Success!                         │
├─────────────────────────────────────────────────────┤
│  ✅ Payment verified! Receiving data...             │
└─────────────────────────────────────────────────────┘
```

### 💰 Data Monetization (Reverse Payment)
Users can SELL their health data - the server pays the client:

```
┌─────────────────────────────────────────────────────┐
│  🔐 x402 Protocol (Client → 402)                [✕] │
│  Endpoint: /api/data-evaluator/accept               │
├─────────────────────────────────────────────────────┤
│  💻 Client          ◄──────          🖥️ Server      │
│                                                     │
│              [GET] Request user data                │
│  [402] Payment Required              ────►          │
│  { price: "0.011 USDC" }                            │
│                                                     │
│              [X-PAYMENT] +0.011 USDC ◄────          │
│  [200] Data access granted           ────►          │
├─────────────────────────────────────────────────────┤
│  ✅ Payment received! Granting data access.         │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Project Structure

```
x402-hospitalsim/
├── app/
│   ├── simulation/         # Interactive chat-based simulation
│   ├── api/                # x402 compliant API routes
│   │   ├── assistant/      # AI consultation (402 protected)
│   │   ├── labs/           # Laboratory services
│   │   └── data-evaluator/ # Data monetization (reverse 402)
│   ├── globals.css         # Matrix-style design system
│   ├── page.tsx            # Landing page
│   └── layout.tsx          # Root layout
├── lib/
│   ├── paymentSimulator.ts # x402 payment simulation logic
│   └── mockData.ts         # Healthcare data generators
├── public/
│   ├── avatars/            # AI expert avatars
│   ├── banana-client.svg   # Client icon for flow diagram
│   └── banana-server.svg   # Server icon for flow diagram
└── package.json
```

---

## 🏥 Application Flow

| Step | Action | Payment Direction | Cost |
|------|--------|-------------------|------|
| 1 | Select AI Expert | Client → Server | 0.005-0.008 USDC |
| 2 | Describe Symptoms | Client → Server | 0.002 USDC |
| 3 | Browse Lab Offers | Free | - |
| 4 | Order Lab Tests | Client → Server | 0.012-0.025 USDC |
| 5 | Sell Health Data | Server → Client | +0.011 USDC |
| 6 | Get Analysis | Free (with access token) | - |

---

## 🔧 API Endpoints

### `POST /api/assistant/consult`
AI Health Assistant consultation. **Requires payment.**

```json
// Request (without X-PAYMENT header)
{ "symptoms": "fatigue, headache" }

// Response: HTTP 402
{
  "status": 402,
  "payment_info": {
    "price": "0.002",
    "currency": "USDC",
    "payment_required": true
  }
}

// Request (with X-PAYMENT: simulated)
// Response: HTTP 200
{
  "success": true,
  "analysis": {
    "recommended_tests": ["Complete Blood Count", "Vitamin D"]
  }
}
```

### `GET /api/labs/offers`
Get laboratory offers. **Free access.**

### `POST /api/labs/order`
Place lab test order. **Requires payment.**

### `POST /api/data-evaluator/offer`
Request data purchase offer from bot. **Free.**

### `POST /api/data-evaluator/accept`
Accept offer - **Client returns 402, Server pays.**

### `GET /api/data-evaluator/result`
Get evaluation results. **Requires X-ACCESS-TOKEN.**

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/cyberatlas-baseeth/x402-hospitalSimulation.git

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 🌐 Deploy on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cyberatlas-baseeth/x402-hospitalSimulation)

### Manual Deployment

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Deploy (no environment variables needed)

---

## 🎨 Design System

The UI features a **Matrix-inspired** aesthetic:

- **Primary Color:** Neon Green `#00ff41`
- **Background:** Dark terminals `#0d1117`
- **Accents:** Blue `#3b82f6` (Client), Purple `#8b5cf6` (Server)
- **Font:** Courier New (monospace)
- **Effects:** Glow animations, pulse effects

---

## 🛡️ Ethical Constraints

- ✅ All outputs are informational only
- ✅ No real medical advice or diagnosis
- ✅ Patient retains full data control
- ✅ Clear consent flow for data sharing
- ✅ Every response includes disclaimers

---

## 📚 Learn More

- [x402 Protocol](https://www.x402.org/) - Official documentation
- [HTTP 402 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402) - MDN
- [x402-open](https://github.com/VanshSahay/x402-open) - Decentralized facilitator toolkit
- [Next.js Documentation](https://nextjs.org/docs)

---

## 📄 License

MIT License - This project is for educational purposes.

---

<p align="center">
  <strong>[ x402 ]</strong><br>
  <em>Pay-per-request healthcare simulation</em>
</p>
