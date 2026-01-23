'use client';

import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

// Receiver wallet (where payments go) - set via environment variable
const RECEIVER_WALLET = (process.env.NEXT_PUBLIC_RECEIVER_WALLET || '0x0000000000000000000000000000000000000000') as `0x${string}`;

export function usePayment() {
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sendPayment = async (amount: string, recipient?: `0x${string}`) => {
    const to = recipient || RECEIVER_WALLET;
    
    if (to === '0x0000000000000000000000000000000000000000') {
      throw new Error('Receiver wallet not configured. Please set NEXT_PUBLIC_RECEIVER_WALLET environment variable.');
    }

    // Convert amount (in ETH) to wei
    const value = parseEther(amount);

    sendTransaction({
      to,
      value,
    });
  };

  return {
    sendPayment,
    isPending,
    isConfirming,
    isSuccess,
    error,
    txHash: hash,
  };
}
