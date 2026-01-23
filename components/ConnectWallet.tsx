'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { USDC_ADDRESS } from '@/lib/wagmiConfig';

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_ADDRESS,
    chainId: baseSepolia.id,
  });

  if (isConnected && address) {
    const isWrongNetwork = chain?.id !== baseSepolia.id;
    
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-network">
            {isWrongNetwork ? '⚠️ Wrong Network' : '🟢 Base Sepolia'}
          </span>
          <span className="wallet-address">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {usdcBalance && (
            <span className="wallet-balance">
              {parseFloat(usdcBalance.formatted).toFixed(4)} USDC
            </span>
          )}
        </div>
        <button className="btn-disconnect" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          className="btn-connect"
          onClick={() => connect({ connector })}
          disabled={isPending}
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
}

export function useWalletStatus() {
  const { address, isConnected, chain } = useAccount();
  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_ADDRESS,
    chainId: baseSepolia.id,
  });

  return {
    address,
    isConnected,
    isCorrectNetwork: chain?.id === baseSepolia.id,
    usdcBalance: usdcBalance ? parseFloat(usdcBalance.formatted) : 0,
  };
}

