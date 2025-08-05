import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWeb3 = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  const CROSS_FINANCE_CHAIN_ID = 4158; 

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      checkConnection();

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        setSigner(await provider.getSigner());
        
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      setSigner(await provider.getSigner());
      
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));

      
      if (Number(network.chainId) !== CROSS_FINANCE_CHAIN_ID) {
        await switchtoCrossFi();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchtoCrossFi = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CROSS_FINANCE_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${CROSS_FINANCE_CHAIN_ID.toString(16)}`,
                chainName: 'CrossFi Testnet',
                nativeCurrency: {
                  name: 'CrossFi',
                  symbol: 'XFI',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.testnet.ms'],
                blockExplorerUrls: ['https://test.xfiscan.com'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding CrossFi network:', addError);
        }
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setSigner(null);
    } else {
      setAccount(accounts[0]);
      if (provider) {
        provider.getSigner().then(setSigner);
      }
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
  };

  const disconnect = async () => {
    await window.ethereum.request({method:"wallet_revokePermissions",params:[{'eth_accounts':{}}]})
    setAccount(null);
    setSigner(null);
    setChainId(null);
  };

  return {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isConnected: !!account,
    isOnCrossFi: chainId === CROSS_FINANCE_CHAIN_ID,
    connectWallet,
    switchtoCrossFi,
    disconnect,
  };
};