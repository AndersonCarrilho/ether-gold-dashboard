
import { useState, useEffect } from "react";
import { WalletGenerator, WalletAccount, NetworkKey } from "@/services/wallet-generator";
import { toast } from "sonner";
import { USDT_ABI } from "@/constants/token-abis";

export const useWalletGenerator = () => {
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>("ethereum");
  const [isLoading, setIsLoading] = useState(false);
  const [walletGenerator, setWalletGenerator] = useState<WalletGenerator | null>(null);

  // Initialize the wallet generator with the USDT ABI
  useEffect(() => {
    try {
      console.log("Initializing wallet generator for network:", selectedNetwork);
      const generator = new WalletGenerator(selectedNetwork, USDT_ABI);
      setWalletGenerator(generator);
    } catch (error) {
      console.error("Error initializing wallet generator:", error);
      toast.error("Failed to initialize wallet generator");
    }
  }, [selectedNetwork]);

  // Generate a specified number of wallets
  const generateWallets = async (count: number, initialBalance: string = "10.0") => {
    if (!walletGenerator) {
      console.error("Wallet generator not initialized");
      toast.error("Wallet generator not initialized");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Generating ${count} wallets with ${initialBalance} ETH each...`);
      const newWallets = await walletGenerator.generateWallets(count, initialBalance);
      console.log("Generated wallets:", newWallets);
      setWallets(newWallets);
      return newWallets;
    } catch (error) {
      console.error("Error generating wallets:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Swap ETH to USDT for a specific wallet
  const swapEthToUsdt = async (walletIndex: number, ethAmount: string) => {
    if (!walletGenerator || !wallets[walletIndex]) return;
    
    setIsLoading(true);
    try {
      const wallet = wallets[walletIndex];
      
      // Check if wallet has enough balance
      if (parseFloat(wallet.balance) < parseFloat(ethAmount)) {
        toast.error("Not enough ETH for the swap");
        setIsLoading(false);
        return;
      }
      
      // Perform the swap simulation
      const result = await walletGenerator.simulateEthToUsdtSwap(wallet, ethAmount);
      
      // Update the wallet with new balances
      const updatedWallets = [...wallets];
      updatedWallets[walletIndex] = {
        ...wallet,
        balance: (parseFloat(wallet.balance) - parseFloat(ethAmount)).toFixed(4),
        usdtBalance: result.newUsdtBalance
      };
      
      setWallets(updatedWallets);
      
      return result.txHash;
    } catch (error) {
      console.error("Error during ETH to USDT swap:", error);
      toast.error("Failed to convert ETH to USDT");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Change the selected network
  const changeNetwork = (network: NetworkKey) => {
    setSelectedNetwork(network);
    // Reset wallets when changing network
    setWallets([]);
  };

  // Get available networks
  const getAvailableNetworks = () => {
    return walletGenerator?.getAvailableNetworks() || [];
  };

  return {
    wallets,
    isLoading,
    selectedNetwork,
    generateWallets,
    swapEthToUsdt,
    changeNetwork,
    getAvailableNetworks,
  };
};
