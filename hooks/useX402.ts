'use client';

import { useState, useCallback } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

interface X402PaymentInfo {
  price: string;
  currency: string;
  recipient: string;
  description: string;
}

interface UseX402Options {
  onPaymentRequired?: (info: X402PaymentInfo) => void;
  onPaymentSent?: (txHash: string) => void;
  onPaymentConfirmed?: (txHash: string) => void;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useX402(options: UseX402Options = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<X402PaymentInfo | null>(null);
  const [pendingRequest, setPendingRequest] = useState<{
    url: string;
    init: RequestInit;
  } | null>(null);

  const { sendTransactionAsync } = useSendTransaction();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  /**
   * Makes an x402-aware fetch request
   * 1. Sends initial request
   * 2. If 402, extracts payment info and waits for payment
   * 3. After payment, retries with X-PAYMENT header
   */
  const x402Fetch = useCallback(async (
    url: string,
    init: RequestInit = {},
    paymentHeader?: string
  ): Promise<{ success: boolean; data?: unknown; needsPayment?: boolean; paymentInfo?: X402PaymentInfo }> => {
    try {
      // Add payment header if provided
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
        setPendingRequest({ url, init });
        options.onPaymentRequired?.(info);

        return { success: false, needsPayment: true, paymentInfo: info };
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      options.onSuccess?.(data);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      options.onError?.(message);
      return { success: false, data: { error: message } };
    }
  }, [options]);

  /**
   * Sends payment and retries the pending request
   */
  const sendPaymentAndRetry = useCallback(async (): Promise<{
    success: boolean;
    data?: unknown;
    txHash?: string;
  }> => {
    if (!paymentInfo || !pendingRequest) {
      return { success: false, data: { error: 'No pending payment' } };
    }

    setIsProcessing(true);

    try {
      // Send ETH payment
      const value = parseEther(paymentInfo.price);
      const hash = await sendTransactionAsync({
        to: paymentInfo.recipient as `0x${string}`,
        value,
      });

      setTxHash(hash);
      options.onPaymentSent?.(hash);

      // Wait a moment for the transaction to be indexed
      await new Promise(r => setTimeout(r, 2000));

      options.onPaymentConfirmed?.(hash);

      // Retry the original request with payment header
      const result = await x402Fetch(
        pendingRequest.url,
        pendingRequest.init,
        `tx:${hash}`
      );

      setPaymentInfo(null);
      setPendingRequest(null);
      setIsProcessing(false);

      return { ...result, txHash: hash };
    } catch (error) {
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : 'Payment failed';
      options.onError?.(message);
      return { success: false, data: { error: message } };
    }
  }, [paymentInfo, pendingRequest, sendTransactionAsync, x402Fetch, options]);

  /**
   * Simulates payment (for demo mode)
   */
  const simulatePaymentAndRetry = useCallback(async (): Promise<{
    success: boolean;
    data?: unknown;
  }> => {
    if (!pendingRequest) {
      return { success: false, data: { error: 'No pending request' } };
    }

    setIsProcessing(true);

    try {
      const result = await x402Fetch(
        pendingRequest.url,
        pendingRequest.init,
        'simulated'
      );

      setPaymentInfo(null);
      setPendingRequest(null);
      setIsProcessing(false);

      return result;
    } catch (error) {
      setIsProcessing(false);
      const message = error instanceof Error ? error.message : 'Request failed';
      return { success: false, data: { error: message } };
    }
  }, [pendingRequest, x402Fetch]);

  return {
    x402Fetch,
    sendPaymentAndRetry,
    simulatePaymentAndRetry,
    isProcessing,
    paymentInfo,
    txHash,
    isTxConfirmed,
    clearPayment: () => {
      setPaymentInfo(null);
      setPendingRequest(null);
    },
  };
}

