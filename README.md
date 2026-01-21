# x402 Healthcare Payment Simulation

A Next.js application demonstrating the **x402 protocol** for pay-per-request healthcare interactions. This project showcases two distinct simulation experiences, visual aesthetics inspired by futuristic "Matrix" themes, and multi-agent AI interactions.

![x402 Protocol](https://img.shields.io/badge/Protocol-x402-00ff41)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![Aesthetics](https://img.shields.io/badge/Aesthetics-Matrix--Core-00ff41)
![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-black)

## ⚠️ Important Disclaimer

**This is a SIMULATION for educational and demonstration purposes only.**

- ❌ No real medical diagnosis, treatment, or prescriptions
- ❌ No actual blockchain transactions or payments
- ❌ No real health data processing
- ✅ Educational demonstration of x402 concepts
- ✅ Simulated payment flows with mock data

---

## 🎮 Simulation Experiences

Users can choose between two ways to experience the x402 protocol:

### 1. 🎭 Simulation Version (Visual Experience)
A rich, terminal-inspired chat interface where you interact with specialized AI experts:
- **Expert Selection**: Choose between **Grok**, **ChatGPT**, or **Claude** (each with custom avatars).
- **Interactive Chat**: Real-time typing effects and visual message flow.
- **Dynamic Balance**: Watch your USDC balance update in real-time as you pay for services or get paid for your data.

### 2. 📝 Prompt Version (Workflow Focus)
A structured, step-by-step workflow for users who want to see the programmatic flow:
- Clear step-by-step progress tracking.
- Detailed JSON-like interaction responses.
- Integrated x402 status code demonstration.

---

## 🔬 What is x402?

The **x402 protocol** leverages the HTTP 402 "Payment Required" status code to enable native, programmatic payments on the web. Instead of subscriptions or API keys, services can require micropayments per request.

### How x402 Works

```
1. Client makes request to protected endpoint
2. Server returns HTTP 402 with payment instructions
3. Client submits payment (on-chain)
4. Client retries request with payment proof
5. Server validates payment and returns resource
```

---

## 🏗️ Project Structure

```
x402-hospitalsim/
├── app/
│   ├── prompt/             # structured workflow simulation
│   ├── simulation/         # visual chat-based simulation
│   ├── api/                # x402 compliant API routes
│   │   ├── assistant/      # AI consultation logic
│   │   ├── labs/           # laboratory services
│   │   └── data-evaluator/ # data monetization endpoints
│   ├── globals.css         # matrix-style design system
│   ├── page.tsx            # dynamic landing page
│   └── layout.tsx          # root layout
├── lib/
│   ├── paymentSimulator.ts # x402 core logic
│   └── mockData.ts         # healthcare data generators
├── public/
│   └── avatars/            # AI expert visual assets
└── package.json
```

---

## 🏥 Application Flow

The simulation demonstrates a multi-agent healthcare economy:

1. **AI Consultation**: Describe symptoms to an AI Expert (0.005 USDC cost).
2. **Lab Discovery**: AI identifies needed tests and fetches real-time lab bids.
3. **Lab Fulfillment**: Pay for tests and receive anonymized results.
4. **Data Monetization**: Researchers (Bots) offer to BUY your data (User gets paid!).
5. **Health Analysis**: Get a final AI analysis report with lifestyle recommendations.


---

## 🔧 API Endpoints

### POST `/api/assistant/consult`
AI Health Assistant consultation.

**Request:**
```json
{
  "symptoms": "fatigue, headache"
}
```

**402 Response (without payment):**
```json
{
  "status": 402,
  "payment_info": {
    "price": "0.002",
    "currency": "USDC",
    "payment_required": true
  }
}
```

**Success Response (with `X-PAYMENT: simulated` header):**
```json
{
  "success": true,
  "analysis": {
    "observed_symptoms": ["fatigue", "headache"],
    "recommended_tests": ["Complete Blood Count", "Vitamin D"]
  }
}
```

### GET `/api/labs/offers?tests=Vitamin D,Iron Panel`
Get laboratory offers for specified tests.

### POST `/api/labs/order`
Place a lab test order.

### POST `/api/data-evaluator/offer`
Request a data purchase offer from the evaluation bot.

### POST `/api/data-evaluator/accept`
Accept the data offer and receive payment.

### GET `/api/data-evaluator/result`
Get evaluation results (requires `X-ACCESS-TOKEN` header).

---

## 🌐 Deploy on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cyberatlas-baseeth/x402-hospitalSimulation)

### Manual Deployment

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Select the repository
4. Deploy (no environment variables needed)

---

## 🛡️ Ethical & Legal Constraints

This simulation strictly adheres to:

- **No Diagnosis**: All outputs are informational only
- **No Treatment Recommendations**: No specific medical treatments suggested
- **No Prescriptions**: No medication or prescription information
- **Disclaimers**: Every response includes appropriate disclaimers
- **Data Ownership**: Patient retains full control of their data
- **Consent Management**: Clear consent flow for data sharing

---

## 📚 Learn More

- [x402 Protocol](https://www.x402.org/) - Official x402 documentation
- [HTTP 402 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402) - MDN documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework docs

---

## 📄 License

MIT License - This project is for educational purposes.

---

<p align="center">
  <em>Built for demonstration of x402 pay-per-request concepts</em>
</p>
