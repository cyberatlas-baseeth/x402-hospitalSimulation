# x402 Healthcare Payment Simulation

A Next.js application demonstrating the **x402 protocol** for pay-per-request healthcare interactions. This is an educational simulation showcasing how micropayments could enable new models for healthcare data exchange.

![x402 Protocol](https://img.shields.io/badge/Protocol-x402-blue)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Vercel Ready](https://img.shields.io/badge/Vercel-Ready-black)

## ⚠️ Important Disclaimer

**This is a SIMULATION for educational and demonstration purposes only.**

- ❌ No real medical diagnosis, treatment, or prescriptions
- ❌ No actual blockchain transactions or payments
- ❌ No real health data processing
- ✅ Educational demonstration of x402 concepts
- ✅ Simulated payment flows with mock data

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

In this simulation, we use a `X-PAYMENT: simulated` header to mock the payment flow.

---

## 🏥 Application Flow

This simulation demonstrates a multi-agent healthcare interaction:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     Patient     │────▶│  AI Health       │────▶│   Laboratory    │
│   (Human User)  │     │  Assistant       │     │   Agents        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                        ┌──────────────────┐              ▼
                        │  Data Evaluation │◀─────────────┘
                        │  Bot (Pays User) │
                        └──────────────────┘
```

### Steps

1. **AI Health Assistant Consultation** (0.002 USDC)
   - Patient describes symptoms
   - Receives general observations and recommended tests

2. **Laboratory Offers** (0.001 USDC)
   - Browse multiple lab offers
   - Compare prices and turnaround times

3. **Lab Test Order** (Variable USDC)
   - Place order with selected lab
   - Receive mock test results

4. **Data Evaluation Offer** (Reverse Payment)
   - Bot offers to BUY patient's anonymized data
   - Patient retains data ownership

5. **Evaluation Results**
   - Access analysis after accepting payment
   - Receive lifestyle guidance (non-diagnostic)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cyberatlas-baseeth/x402-hospitalSimulation.git

# Navigate to project
cd x402-hospitalSimulation

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
x402-hospitalsim/
├── app/
│   ├── api/
│   │   ├── assistant/
│   │   │   └── consult/route.ts    # AI consultation endpoint
│   │   ├── labs/
│   │   │   ├── offers/route.ts     # Lab offers endpoint
│   │   │   └── order/route.ts      # Lab order endpoint
│   │   └── data-evaluator/
│   │       ├── offer/route.ts      # Data purchase offer
│   │       ├── accept/route.ts     # Accept offer endpoint
│   │       └── result/route.ts     # Evaluation results
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main application page
├── lib/
│   ├── paymentSimulator.ts         # x402 simulation utilities
│   └── mockData.ts                 # Mock data generators
├── package.json
├── tsconfig.json
└── next.config.js
```

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
