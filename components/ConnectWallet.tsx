'use client';

import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { formatEther } from 'viem';

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId(); // Alternative way to get chain ID
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Get native ETH balance on Base Sepolia
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: baseSepolia.id,
  });

  // Format balance from bigint to string
  const formattedBalance = ethBalance ? formatEther(ethBalance.value) : '0';

  // Use chainId from useChainId hook as fallback
  const currentChainId = chain?.id || chainId;
  const isWrongNetwork = currentChainId !== baseSepolia.id;

  if (isConnected && address) {
    // Debug chain detection
    console.log('[Wallet] Chain detection:', {
      chainFromAccount: chain?.id,
      chainFromHook: chainId,
      currentChainId,
      expectedChainId: baseSepolia.id,
      isWrongNetwork,
    });
    
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-network" title={`Chain ID: ${currentChainId || 'unknown'}`}>
            {isWrongNetwork ? `⚠️ Wrong Network (${currentChainId})` : '🟢 Base Sepolia'}
          </span>
          <span className="wallet-address">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {ethBalance && (
            <span className="wallet-balance">
              {parseFloat(formattedBalance).toFixed(6)} ETH
            </span>
          )}
        </div>
        <button className="btn-disconnect" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  // Find MetaMask connector (or first available injected wallet)
  const metaMaskConnector = connectors.find(c => c.name === 'MetaMask') || connectors[0];

  return (
    <div className="wallet-connect">
      {metaMaskConnector && (
        <button
          className="btn-connect"
          onClick={() => connect({ connector: metaMaskConnector })}
          disabled={isPending}
        >
          {isPending ? 'Connecting...' : '🦊 Connect MetaMask'}
        </button>
      )}
    </div>
  );
}

export function useWalletStatus() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId(); // Alternative way to get chain ID
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: baseSepolia.id,
  });

  // Format balance from bigint to number
  const balanceInEth = ethBalance ? parseFloat(formatEther(ethBalance.value)) : 0;

  // Use chainId from useChainId hook as fallback
  const currentChainId = chain?.id || chainId;

  return {
    address,
    isConnected,
    isCorrectNetwork: currentChainId === baseSepolia.id,
    ethBalance: balanceInEth,
  };
}

