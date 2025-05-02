
import { useState, useEffect } from "react";
import AssetCard from "./AssetCard";
import { useEthereum, ETH_TOKENS } from "@/hooks/use-ethereum";
import { TransactionService } from "@/services/transaction";

const AssetsOverview = () => {
  const { walletState, formatEth } = useEthereum();
  const { connected, provider, accounts } = walletState;
  
  const [tokenBalances, setTokenBalances] = useState({
    ETH: "0",
    USDT: "0",
    USDC: "0",
  });
  
  // Fetch token balances when connected
  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!connected || !provider || !accounts.length) return;
      
      try {
        const address = accounts[0];
        const txService = new TransactionService(provider);
        
        // Get ETH balance
        const ethBalance = formatEth(walletState.balance);
        
        // Get USDT balance
        const usdtBalance = await txService.getTokenBalance(
          ETH_TOKENS.USDT.address,
          address
        );
        const formattedUsdtBalance = txService.formatTokenAmount(
          usdtBalance,
          ETH_TOKENS.USDT.decimals
        );
        
        // Get USDC balance
        const usdcBalance = await txService.getTokenBalance(
          ETH_TOKENS.USDC.address,
          address
        );
        const formattedUsdcBalance = txService.formatTokenAmount(
          usdcBalance,
          ETH_TOKENS.USDC.decimals
        );
        
        setTokenBalances({
          ETH: ethBalance,
          USDT: formattedUsdtBalance,
          USDC: formattedUsdcBalance,
        });
      } catch (error) {
        console.error("Error fetching token balances:", error);
      }
    };
    
    fetchTokenBalances();
  }, [connected, provider, accounts, walletState.balance]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AssetCard
        assetName="Ethereum"
        balance={`${tokenBalances.ETH} ETH`}
        value="$3,245.67"
        change="+2.4%"
        color="#627EEA"
      />
      <AssetCard
        assetName="Tether USD"
        balance={`${tokenBalances.USDT} USDT`}
        value="$1,000.00"
        change="0%"
        color="#50AF95"
      />
      <AssetCard
        assetName="USD Coin"
        balance={`${tokenBalances.USDC} USDC`}
        value="$500.00"
        change="0%"
        color="#2775CA"
      />
    </div>
  );
};

export default AssetsOverview;
