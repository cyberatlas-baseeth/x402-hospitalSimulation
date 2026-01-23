'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Get native ETH balance on Base Sepolia
  const { data: ethBalance } = useBalance({
    address: address,
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
          {ethBalance && (
            <span className="wallet-balance">
              {parseFloat(ethBalance.formatted).toFixed(6)} ETH
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
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: baseSepolia.id,
  });

  return {
    address,
    isConnected,
    isCorrectNetwork: chain?.id === baseSepolia.id,
    ethBalance: ethBalance ? parseFloat(ethBalance.formatted) : 0,
  };
}

