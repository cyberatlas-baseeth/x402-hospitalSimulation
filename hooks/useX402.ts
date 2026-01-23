'use client';

import { useState, useCallback, useRef } from 'react';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

interface X402PaymentInfo {
  price: string;
  currency: string;
  recipient: string;
  description: string;
}

interface X402Result {
  success: boolean;
  data?: unknown;
  needsPayment?: boolean;
  paymentInfo?: X402PaymentInfo;
}

export function useX402() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<X402PaymentInfo | null>(null);
  const [txHash, setTxHash] = useState<string | undefined>();

  // Store pending request in ref to avoid state timing issues
  const pendingRequestRef = useRef<{
    url: string;
    init: RequestInit;
    paymentInfo: X402PaymentInfo;
  } | null>(null);

  const { sendTransactionAsync } = useSendTransaction();

  /**
   * Makes a fetch request and handles 402 response
   */
  const x402Fetch = useCallback(async (
    url: string,
    init: RequestInit = {},
    paymentHeader?: string
  ): Promise<X402Result> => {
    try {
      const headers = new Headers(init.headers);
      if (paymentHeader) {
        headers.set('X-PAYMENT', paymentHeader);
      }

      const response = await fetch(url, {
        ...init,
        headers,
      });

      // Handle 402 Payment Required
      if (response.status === 402) {
        const data = await response.json();
        const info: X402PaymentInfo = {
          price: data.x402?.price || response.headers.get('X-Price') || '0',
          currency: data.x402?.currency || 'ETH',
          recipient: data.x402?.recipient || response.headers.get('X-Recipient') || '',
          description: data.x402?.description || 'API Access',
        };

        setPaymentInfo(info);
        
        // Store in ref for immediate access
        pendingRequestRef.current = { url, init, paymentInfo: info };

        return { success: false, needsPayment: true, paymentInfo: info };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, data: errorData };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('x402Fetch error:', error);
      return { success: false, data: { error: 'Request failed' } };
    }
  }, []);

  /**
   * Sends real payment and retries the pending request
   */
  const sendPaymentAndRetry = useCallback(async (): Promise<X402Result> => {
    const pending = pendingRequestRef.current;
    if (!pending) {
      return { success: false, data: { error: 'No pending payment' } };
    }

    setIsProcessing(true);

    try {
      const value = parseEther(pending.paymentInfo.price);
      const hash = await sendTransactionAsync({
        to: pending.paymentInfo.recipient as `0x${string}`,
        value,
      });

      setTxHash(hash);

      // Wait for transaction to be indexed
      await new Promise(r => setTimeout(r, 3000));

      // Retry with payment header
      const result = await x402Fetch(
        pending.url,
        pending.init,
        `tx:${hash}`
      );

      pendingRequestRef.current = null;
      setPaymentInfo(null);
      setIsProcessing(false);

      return { ...result, data: { ...result.data as object, txHash: hash } };
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      return { success: false, data: { error: 'Payment failed' } };
    }
  }, [sendTransactionAsync, x402Fetch]);

  /**
   * Simulates payment and retries the pending request
   */
  const simulatePaymentAndRetry = useCallback(async (): Promise<X402Result> => {
    const pending = pendingRequestRef.current;
    if (!pending) {
      return { success: false, data: { error: 'No pending request' } };
    }

    setIsProcessing(true);

    try {
      const result = await x402Fetch(
        pending.url,
        pending.init,
        'simulated'
      );

      pendingRequestRef.current = null;
      setPaymentInfo(null);
      setIsProcessing(false);

      return result;
    } catch (error) {
      console.error('Simulate error:', error);
      setIsProcessing(false);
      return { success: false, data: { error: 'Request failed' } };
    }
  }, [x402Fetch]);

  /**
   * Direct x402 call - handles the full flow in one call
   * Useful when you want simpler integration
   */
  const x402Call = useCallback(async (
    url: string,
    init: RequestInit = {},
    options: { 
      mode: 'simulated' | 'real';
      isConnected?: boolean;
      isCorrectNetwork?: boolean;
    }
  ): Promise<X402Result> => {
    // First try without payment
    const initialResult = await x402Fetch(url, init);
    
    if (!initialResult.needsPayment) {
      return initialResult;
    }

    // Need payment - use appropriate method
    if (options.mode === 'real' && options.isConnected && options.isCorrectNetwork) {
      return sendPaymentAndRetry();
    } else {
      return simulatePaymentAndRetry();
    }
  }, [x402Fetch, sendPaymentAndRetry, simulatePaymentAndRetry]);

  return {
    x402Fetch,
    x402Call,
    sendPaymentAndRetry,
    simulatePaymentAndRetry,
    isProcessing,
    paymentInfo,
    txHash,
    clearPayment: () => {
      setPaymentInfo(null);
      pendingRequestRef.current = null;
    },
  };
}
