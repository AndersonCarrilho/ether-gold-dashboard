
import { useState, useEffect } from "react";
import { WalletGenerator, WalletAccount, NetworkKey } from "@/services/wallet-generator";
import { useToast } from "@/hooks/use-toast";
import { USDT_ABI } from "@/constants/token-abis";

export const useWalletGenerator = () => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>("ethereum");
  const [isLoading, setIsLoading] = useState(false);
  const [walletGenerator, setWalletGenerator] = useState<WalletGenerator | null>(null);

  // Initialize the wallet generator with the USDT ABI
  useEffect(() => {
    const generator = new WalletGenerator(selectedNetwork, USDT_ABI);
    setWalletGenerator(generator);
  }, [selectedNetwork]);

  // Generate a specified number of wallets
  const generateWallets = async (count: number, initialBalance: string = "10.0") => {
    if (!walletGenerator) return;
    
    setIsLoading(true);
    try {
      const newWallets = await walletGenerator.generateWallets(count, initialBalance);
      setWallets(newWallets);
      
      toast({
        title: "Wallets Created",
        description: `Successfully generated ${count} test wallets with ${initialBalance} ETH each`,
      });
    } catch (error) {
      console.error("Error generating wallets:", error);
      toast({
        title: "Error",
        description: "Failed to generate wallets",
        variant: "destructive",
      });
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
        toast({
          title: "Insufficient Balance",
          description: "Not enough ETH for the swap",
          variant: "destructive",
        });
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
      
      toast({
        title: "Swap Completed",
        description: `Converted ${ethAmount} ETH to USDT. Transaction: ${result.txHash.substring(0, 10)}...`,
      });
      
      return result.txHash;
    } catch (error) {
      console.error("Error during ETH to USDT swap:", error);
      toast({
        title: "Swap Failed",
        description: "Failed to convert ETH to USDT",
        variant: "destructive",
      });
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
