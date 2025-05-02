
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AssetCard from "@/components/dashboard/AssetCard";
import TransactionRow from "@/components/dashboard/TransactionRow";
import TransactionReceipt from "@/components/dashboard/TransactionReceipt";
import PendingTransactions from "@/components/dashboard/PendingTransactions";
import { useEthereum, ETH_TOKENS } from "@/hooks/use-ethereum";
import { TransactionService } from "@/services/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

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
      <div className="flex flex-col gap-4">
        {!connected ? (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold mb-2 gold-gradient">Welcome to EtherGold Dashboard</h2>
            <p className="text-muted-foreground mb-4 text-center">
              Connect your wallet to view your assets and transaction history.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold gold-gradient">Dashboard</h1>
            
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
            
            {/* Add the new Pending Transactions component */}
            <div className="mt-4">
              <PendingTransactions />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <Card className="card-hover lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#888', fontSize: 12 }}
                          axisLine={{ stroke: '#333' }}
                        />
                        <YAxis 
                          tick={{ fill: '#888', fontSize: 12 }}
                          axisLine={{ stroke: '#333' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#222', 
                            borderColor: '#444',
                            color: '#fff'
                          }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#D4AF37"
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-hover">
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
    </DashboardLayout>
  );
};

export default Index;
