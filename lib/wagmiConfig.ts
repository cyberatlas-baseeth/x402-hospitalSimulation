import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(), // MetaMask, etc.
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

// Base Sepolia USDC Contract (Test)
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

// USDC ABI (minimal for transfer)
export const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

// Receiver wallet (where payments go) - set via environment variable
export const RECEIVER_WALLET = (process.env.NEXT_PUBLIC_RECEIVER_WALLET || '0x0000000000000000000000000000000000000000') as `0x${string}`;

