
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEthereum, ETH_TOKENS } from "@/hooks/use-ethereum";
import { TransactionService } from "@/services/transaction";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";

const TokensPage = () => {
  const { walletState } = useEthereum();
  const { connected, provider, accounts } = walletState;
  
  const [tokenBalances, setTokenBalances] = useState({
    ETH: { balance: "0", value: "$0.00" },
    USDT: { balance: "0", value: "$0.00" },
    USDC: { balance: "0", value: "$0.00" },
  });
  
  // Mock token prices
  const tokenPrices = {
    ETH: 3000, // $3000 per ETH
    USDT: 1,   // $1 per USDT
    USDC: 1,   // $1 per USDC
  };
  
  // Fetch token balances when connected
  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!connected || !provider || !accounts.length) return;
      
      try {
        const address = accounts[0];
        const txService = new TransactionService(provider);
        
        // Format ETH balance
        const ethBalanceWei = walletState.balance;
        const ethBalance = parseInt(ethBalanceWei, 16) / 1e18;
        const ethValue = (ethBalance * tokenPrices.ETH).toFixed(2);
        
        // Get USDT balance
        const usdtBalance = await txService.getTokenBalance(
          ETH_TOKENS.USDT.address,
          address
        );
        const usdtBalanceFormatted = parseInt(usdtBalance || "0", 16) / (10 ** ETH_TOKENS.USDT.decimals);
        const usdtValue = (usdtBalanceFormatted * tokenPrices.USDT).toFixed(2);
        
        // Get USDC balance
        const usdcBalance = await txService.getTokenBalance(
          ETH_TOKENS.USDC.address,
          address
        );
        const usdcBalanceFormatted = parseInt(usdcBalance || "0", 16) / (10 ** ETH_TOKENS.USDC.decimals);
        const usdcValue = (usdcBalanceFormatted * tokenPrices.USDC).toFixed(2);
        
        setTokenBalances({
          ETH: { 
            balance: ethBalance.toFixed(6), 
            value: `$${ethValue}` 
          },
          USDT: { 
            balance: usdtBalanceFormatted.toString(), 
            value: `$${usdtValue}` 
          },
          USDC: { 
            balance: usdcBalanceFormatted.toString(), 
            value: `$${usdcValue}` 
          },
        });
      } catch (error) {
        console.error("Error fetching token balances:", error);
      }
    };
    
    fetchTokenBalances();
  }, [connected, provider, accounts, walletState.balance]);
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold gold-gradient">Tokens</h1>
        
        {!connected ? (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground mb-4 text-center">
              Connect your wallet to view your token balances.
            </p>
          </div>
        ) : (
          <>
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">Token Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center p-3 bg-gold/10 rounded-md">
                    <Info size={16} className="text-gold mr-2 flex-shrink-0" />
                    <span className="text-xs">
                      Token balances are fetched directly from the Ethereum blockchain. Prices are for demonstration purposes only.
                    </span>
                  </div>
                  
                  <div className="divide-y divide-border/50">
                    {/* ETH */}
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-[#627EEA] flex items-center justify-center text-white font-bold mr-3">
                          ETH
                        </div>
                        <div>
                          <p className="font-medium">Ethereum</p>
                          <p className="text-xs text-muted-foreground">ETH</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{tokenBalances.ETH.balance} ETH</p>
                        <p className="text-xs text-muted-foreground">{tokenBalances.ETH.value}</p>
                      </div>
                    </div>
                    
                    {/* USDT */}
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-[#50AF95] flex items-center justify-center text-white font-bold mr-3">
                          USDT
                        </div>
                        <div>
                          <p className="font-medium">Tether USD</p>
                          <p className="text-xs text-muted-foreground">USDT</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{tokenBalances.USDT.balance} USDT</p>
                        <p className="text-xs text-muted-foreground">{tokenBalances.USDT.value}</p>
                      </div>
                    </div>
                    
                    {/* USDC */}
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-[#2775CA] flex items-center justify-center text-white font-bold mr-3">
                          USDC
                        </div>
                        <div>
                          <p className="font-medium">USD Coin</p>
                          <p className="text-xs text-muted-foreground">USDC</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{tokenBalances.USDC.balance} USDC</p>
                        <p className="text-xs text-muted-foreground">{tokenBalances.USDC.value}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-lg">Token Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Ethereum (ETH)</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Native cryptocurrency of the Ethereum blockchain.
                      </p>
                      <div className="text-xs grid grid-cols-3 gap-1">
                        <span className="text-muted-foreground">Contract:</span>
                        <span className="col-span-2 font-mono truncate">Native Currency</span>
                      </div>
                    </div>
                    
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Tether USD (USDT)</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Stablecoin pegged to the US Dollar.
                      </p>
                      <div className="text-xs grid grid-cols-3 gap-1">
                        <span className="text-muted-foreground">Contract:</span>
                        <span className="col-span-2 font-mono truncate">{ETH_TOKENS.USDT.address.substring(0, 8)}...</span>
                      </div>
                    </div>
                    
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">USD Coin (USDC)</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        Regulated stablecoin backed by US dollars.
                      </p>
                      <div className="text-xs grid grid-cols-3 gap-1">
                        <span className="text-muted-foreground">Contract:</span>
                        <span className="col-span-2 font-mono truncate">{ETH_TOKENS.USDC.address.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TokensPage;
