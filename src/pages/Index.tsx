
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AssetCard from "@/components/dashboard/AssetCard";
import TransactionRow from "@/components/dashboard/TransactionRow";
import TransactionReceipt from "@/components/dashboard/TransactionReceipt";
import PendingTransactions from "@/components/dashboard/PendingTransactions";
import SystemInfoCard from "@/components/dashboard/SystemInfoCard";
import NetworkStatsCard from "@/components/dashboard/NetworkStatsCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import GasCard from "@/components/dashboard/GasCard";
import BackgroundAnimation from "@/components/ui/background-animation";
import { useEthereum, ETH_TOKENS } from "@/hooks/use-ethereum";
import { TransactionService } from "@/services/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Info } from "lucide-react";

// Mock chart data
const chartData = [
  { name: "Jan", value: 1.2 },
  { name: "Feb", value: 1.8 },
  { name: "Mar", value: 2.3 },
  { name: "Apr", value: 1.9 },
  { name: "May", value: 2.7 },
  { name: "Jun", value: 2.2 },
  { name: "Jul", value: 3.5 },
];

// Mock transaction data
const mockTransactions = [
  {
    hash: "0x7ad5e39f1e40abdcee30d52a367a24481d0aeccfeb4be8dbc99ef347aab61a49",
    type: "send" as const,
    status: "confirmed" as const,
    from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    to: "0x0716a17FBAeE714f1E6aB0f9d59edbC5f09815C0",
    amount: "0.5",
    symbol: "ETH",
    timestamp: "2023-04-28 14:32",
    gasUsed: "21000",
  },
  {
    hash: "0x5ce28b03d7a58baab742e6c54295c74a0e6a114e61d59a78c41c1d5748345e83",
    type: "receive" as const,
    status: "confirmed" as const,
    from: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    amount: "1.2",
    symbol: "ETH",
    timestamp: "2023-04-25 09:17",
    gasUsed: "21000",
  }
];

const Index = () => {
  const { walletState, formatEth } = useEthereum();
  const { connected, provider, accounts } = walletState;
  
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
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
  
  const handleViewReceipt = (tx: any) => {
    setSelectedReceipt({
      ...tx,
      blockNumber: 17126250, // Mock block number
    });
    setShowReceipt(true);
  };
  
  return (
    <DashboardLayout>
      <BackgroundAnimation>
        <div className="flex flex-col gap-4">
          {!connected ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative mb-6 w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full bg-gold/30 animate-pulse"></div>
                <div className="absolute inset-4 rounded-full bg-gold/50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Info className="h-8 w-8 text-gold" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 gold-gradient">Welcome to EtherGold Dashboard</h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Connect your wallet to access advanced blockchain analytics, transaction monitoring, 
                and financial management tools powered by Ethereum.
              </p>
              <div className="p-4 border border-gold/30 rounded-lg bg-secondary/30 text-sm text-muted-foreground max-w-md">
                <p className="mb-2">🔐 Your private keys never leave your device</p>
                <p className="mb-2">📊 Real-time transaction monitoring</p>
                <p>💰 Advanced portfolio management tools</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold gold-gradient">Dashboard</h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="flex gap-1 text-xs border-gold/30">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Network: Mainnet
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Currently connected to Ethereum Mainnet</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
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

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <QuickActionsCard />
                <GasCard />
                <SystemInfoCard />
              </div>
              
              {/* Pending Transactions */}
              <div className="mt-4">
                <PendingTransactions />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <NetworkStatsCard />
                
                <Card className="card-hover lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-gold hover:text-gold-light"
                      onClick={() => window.location.href = "/transactions"}
                    >
                      View All
                      <Activity className="ml-1 h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
                      {mockTransactions.map((tx) => (
                        <TransactionRow
                          key={tx.hash}
                          {...tx}
                          onViewReceipt={() => handleViewReceipt(tx)}
                        />
                      ))}
                      {mockTransactions.length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          No recent transactions
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
        
        {selectedReceipt && (
          <TransactionReceipt
            open={showReceipt}
            onOpenChange={setShowReceipt}
            transactionData={selectedReceipt}
          />
        )}
      </BackgroundAnimation>
    </DashboardLayout>
  );
};

export default Index;
