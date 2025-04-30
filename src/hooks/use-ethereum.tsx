
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EthereumProvider, WalletState, NetworkConfig } from "@/types/ethereum";

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Ethereum Mainnet
const ETH_MAINNET_CONFIG: NetworkConfig = {
  chainId: "0x1", // 1 in hex
  chainName: "Ethereum Mainnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.infura.io/v3/"],
  blockExplorerUrls: ["https://etherscan.io"],
};

// Common tokens on Ethereum Mainnet
export const ETH_TOKENS = {
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000000", // Native ETH
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
};

export const useEthereum = () => {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    accounts: [],
    balance: "0",
    chainId: "",
    connected: false,
    provider: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Account change handler
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      setWalletState((prev) => ({ ...prev, accounts: [], connected: false }));
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      });
    } else {
      const balance = await getBalance(accounts[0]);
      setWalletState((prev) => ({
        ...prev,
        accounts,
        balance,
        connected: true,
      }));
    }
  };

  // Chain change handler
  const handleChainChanged = (chainId: string) => {
    window.location.reload();
  };

  // Get account balance
  const getBalance = async (address: string): Promise<string> => {
    try {
      if (!window.ethereum) return "0";
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      return balance;
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      if (!window.ethereum) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask or another web3 wallet",
          variant: "destructive",
        });
        return;
      }

      // Request accounts
      const provider = window.ethereum;
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      // Get chain ID
      const chainId = await provider.request({
        method: "eth_chainId",
      });

      // Check if we're on Ethereum Mainnet
      if (chainId !== ETH_MAINNET_CONFIG.chainId) {
        try {
          // Try to switch to Ethereum Mainnet
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ETH_MAINNET_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          // Network not added to wallet, suggest adding it
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: "wallet_addEthereumChain",
                params: [ETH_MAINNET_CONFIG],
              });
            } catch (addError) {
              toast({
                title: "Network Error",
                description: "Failed to add Ethereum Mainnet",
                variant: "destructive",
              });
              return;
            }
          } else {
            toast({
              title: "Network Error",
              description: "Failed to switch to Ethereum Mainnet",
              variant: "destructive",
            });
            return;
          }
        }
        // Get updated chainId after switching
        const updatedChainId = await provider.request({
          method: "eth_chainId",
        });
        if (updatedChainId !== ETH_MAINNET_CONFIG.chainId) {
          toast({
            title: "Wrong Network",
            description: "Please switch to Ethereum Mainnet",
            variant: "destructive",
          });
          return;
        }
      }

      if (accounts.length === 0) {
        toast({
          title: "Connection Failed",
          description: "No accounts found",
          variant: "destructive",
        });
        return;
      }

      // Get balance
      const balance = await getBalance(accounts[0]);

      // Update state
      setWalletState({
        accounts,
        balance,
        chainId,
        connected: true,
        provider,
      });

      toast({
        title: "Wallet Connected",
        description: `Connected to ${formatAddress(accounts[0])}`,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet - Fixed implementation
  const disconnectWallet = () => {
    try {
      console.log("Disconnecting wallet - state reset initiated");
      
      // Completely reset wallet state to initial values
      setWalletState({
        accounts: [],
        balance: "0",
        chainId: "",
        connected: false,
        provider: null,
      });
      
      // For MetaMask mobile and other wallets, we can try to clear the connection
      // using the standard method if available
      if (window.ethereum && window.ethereum.isMetaMask) {
        console.log("Attempting to force disconnect MetaMask");
        
        // Try to clear the connection state if provider has such a method
        // Some wallet providers may have custom methods for this
        try {
          // Request the wallet to disconnect if it has such a method
          if (typeof window.ethereum.request === 'function') {
            // Some wallets support this method
            window.ethereum.request({
              method: "wallet_requestPermissions",
              params: [{ eth_accounts: {} }]
            }).catch((err: any) => {
              // Ignore errors since this is just an attempt
              console.log("Permission request failed, continuing with disconnect", err);
            });
          }
        } catch (innerError) {
          console.error("Error while trying to force MetaMask disconnect:", innerError);
        }
      }
      
      console.log("Disconnecting wallet - state reset completed");
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error("Error during wallet disconnection:", error);
      return false;
    }
  };

  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Format ETH value
  const formatEth = (wei: string): string => {
    if (!wei) return "0";
    try {
      const value = parseInt(wei, 16) / 1e18;
      return value.toFixed(4);
    } catch (e) {
      return "0";
    }
  };

  // Initialize event listeners
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = window.ethereum;
      
      // Set up event listeners
      if (provider.on) {
        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);
      }

      // Check if already connected
      provider
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts.length > 0) {
            handleAccountsChanged(accounts);
          }
        })
        .catch((err) => console.error("Error checking accounts:", err));

      // Cleanup listeners
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  return {
    walletState,
    isLoading,
    connectWallet,
    disconnectWallet,
    formatAddress,
    formatEth,
  };
};
