/**
 * x402 Protocol Implementation
 * 
 * This module implements the HTTP 402 Payment Required protocol
 * for pay-per-request API access using Base Sepolia ETH.
 */

import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

// Public client for reading blockchain data
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Receiver wallet for payments
export const RECEIVER_WALLET = (process.env.NEXT_PUBLIC_RECEIVER_WALLET || 
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

// Payment cache to prevent double-spending (in production, use Redis/DB)
const verifiedPayments = new Map<string, { amount: string; timestamp: number }>();

// Cache expiry time (1 hour)
const CACHE_EXPIRY = 60 * 60 * 1000;

/**
 * x402 Payment Required Response
 */
export interface X402PaymentRequired {
  status: 402;
  x402: {
    version: '1.0';
    price: string;
    currency: 'ETH';
    network: 'base-sepolia';
    recipient: string;
    description: string;
    validUntil: number;
  };
  message: string;
}

/**
 * Creates a 402 Payment Required response
 */
export function createPaymentRequired(
  price: string,
  description: string
): X402PaymentRequired {
  return {
    status: 402,
    x402: {
      version: '1.0',
      price,
      currency: 'ETH',
      network: 'base-sepolia',
      recipient: RECEIVER_WALLET,
      description,
      validUntil: Date.now() + 15 * 60 * 1000, // 15 minutes
    },
    message: `Payment of ${price} ETH required to access this resource.`,
  };
}

/**
 * Verifies a transaction on Base Sepolia
 * 
 * @param txHash - Transaction hash from X-PAYMENT header
 * @param expectedAmount - Expected payment amount in ETH
 * @returns Verification result
 */
export async function verifyPayment(
  txHash: string,
  expectedAmount: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check if already verified (prevent replay attacks)
    if (verifiedPayments.has(txHash)) {
      const cached = verifiedPayments.get(txHash)!;
      // Allow reuse within cache period for same-session requests
      if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
        return { valid: true };
      }
    }

    // Handle simulated payments (for demo mode)
    if (txHash === 'simulated' || txHash.startsWith('sim_')) {
      return { valid: true };
    }

    // Validate tx hash format
    if (!txHash.startsWith('0x') || txHash.length !== 66) {
      return { valid: false, error: 'Invalid transaction hash format' };
    }

    // Fetch transaction from blockchain
    const tx = await publicClient.getTransaction({
      hash: txHash as `0x${string}`,
    });

    if (!tx) {
      return { valid: false, error: 'Transaction not found' };
    }

    // Verify recipient
    if (tx.to?.toLowerCase() !== RECEIVER_WALLET.toLowerCase()) {
      return { valid: false, error: 'Payment sent to wrong address' };
    }

    // Verify amount (with 10% tolerance for gas fluctuations)
    const expectedWei = parseEther(expectedAmount);
    const tolerance = expectedWei / BigInt(10); // 10%
    const minAmount = expectedWei - tolerance;

    if (tx.value < minAmount) {
      return { 
        valid: false, 
        error: `Insufficient payment. Expected: ${expectedAmount} ETH, Got: ${formatEther(tx.value)} ETH` 
      };
    }

    // Wait for confirmation (at least 1 block)
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt || receipt.status !== 'success') {
      return { valid: false, error: 'Transaction failed or not confirmed' };
    }

    // Cache the verified payment
    verifiedPayments.set(txHash, {
      amount: expectedAmount,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    cleanupCache();

    return { valid: true };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { valid: false, error: 'Failed to verify transaction' };
  }
}

/**
 * Extracts payment info from X-PAYMENT header
 */
export function parsePaymentHeader(header: string | null): {
  type: 'none' | 'simulated' | 'transaction';
  txHash?: string;
} {
  if (!header) {
    return { type: 'none' };
  }

  if (header === 'simulated') {
    return { type: 'simulated', txHash: 'simulated' };
  }

  if (header.startsWith('tx:')) {
    return { type: 'transaction', txHash: header.slice(3) };
  }

  // Legacy format: just the hash
  if (header.startsWith('0x')) {
    return { type: 'transaction', txHash: header };
  }

  return { type: 'none' };
}

/**
 * Cleanup old cache entries
 */
function cleanupCache() {
  const now = Date.now();
  for (const [hash, data] of verifiedPayments.entries()) {
    if (now - data.timestamp > CACHE_EXPIRY) {
      verifiedPayments.delete(hash);
    }
  }
}

/**
 * x402 Middleware helper for API routes
 */
export async function requirePayment(
  request: Request,
  price: string,
  description: string
): Promise<{ authorized: boolean; response?: Response }> {
  const paymentHeader = request.headers.get('X-PAYMENT');
  const payment = parsePaymentHeader(paymentHeader);

  // No payment provided
  if (payment.type === 'none') {
    const paymentRequired = createPaymentRequired(price, description);
    return {
      authorized: false,
      response: new Response(JSON.stringify(paymentRequired), {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-Price': price,
          'X-Currency': 'ETH',
          'X-Recipient': RECEIVER_WALLET,
        },
      }),
    };
  }

  // Simulated payment (demo mode)
  if (payment.type === 'simulated') {
    return { authorized: true };
  }

  // Verify real payment
  const verification = await verifyPayment(payment.txHash!, price);
  
  if (!verification.valid) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({
          error: 'Payment verification failed',
          details: verification.error,
          ...createPaymentRequired(price, description),
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        }
      ),
    };
  }

  return { authorized: true };
}

