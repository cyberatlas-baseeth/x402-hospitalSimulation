'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { USDC_ADDRESS, USDC_ABI, RECEIVER_WALLET } from '@/lib/wagmiConfig';

export function usePayment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sendPayment = async (amount: string, recipient?: `0x${string}`) => {
    const amountInUnits = parseUnits(amount, 6); // USDC has 6 decimals
    const to = recipient || RECEIVER_WALLET;
    
    if (to === '0x0000000000000000000000000000000000000000') {
      throw new Error('Receiver wallet not configured. Please set RECEIVER_WALLET in wagmiConfig.ts');
    }

    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [to, amountInUnits],
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

