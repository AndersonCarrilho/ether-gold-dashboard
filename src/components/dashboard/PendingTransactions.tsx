
import { useState, useEffect } from "react";
import { useEthereum } from "@/hooks/use-ethereum";
import { Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PendingTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  timestamp: number;
}

const PendingTransactions = () => {
  const { walletState } = useEthereum();
  const { toast } = useToast();
  const { provider, connected } = walletState;
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format the Ethereum address for display
  const formatAddress = (address: string | null) => {
    if (!address) return "Contract Creation";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format ETH value
  const formatEth = (wei: string): string => {
    try {
      // Convert from wei to ETH
      const value = parseInt(wei, 16) / 1e18;
      return value.toFixed(value < 0.0001 ? 8 : 4);
    } catch (e) {
      return "0";
    }
  };
  
  // Format gas price in Gwei
  const formatGasPrice = (price: string): string => {
    try {
      // Convert from wei to Gwei
      const value = parseInt(price, 16) / 1e9;
      return `${value.toFixed(2)} Gwei`;
    } catch (e) {
      return "Unknown";
    }
  };
  
  // Subscribe to pending transactions
  const subscribeToPendingTransactions = async () => {
    if (!provider || !connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to monitor pending transactions",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear existing transactions when subscribing
      setPendingTxs([]);
      
      // Check if the provider supports subscriptions (WebSocket)
      if (!provider.on) {
        toast({
          title: "Provider error",
          description: "Your wallet provider doesn't support transaction monitoring",
          variant: "destructive",
        });
        setError("Provider doesn't support transaction monitoring");
        setIsLoading(false);
        return;
      }
      
      console.log("Subscribing to pending transactions...");
      
      // Create listener for new pending transactions
      provider.on("pending", async (txHash: string) => {
        try {
          // Get full transaction details
          const tx = await provider.request({
            method: "eth_getTransactionByHash",
            params: [txHash],
          });
          
          if (tx) {
            // Add the transaction to our list with a timestamp
            setPendingTxs((prev) => {
              // Prevent duplicates
              if (prev.some((p) => p.hash === tx.hash)) {
                return prev;
              }
              
              // Add new transaction to the beginning
              const newTx: PendingTransaction = {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value,
                gasPrice: tx.gasPrice || "0x0",
                maxFeePerGas: tx.maxFeePerGas,
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                timestamp: Date.now(),
              };
              
              // Keep only the most recent 10 transactions
              const updated = [newTx, ...prev];
              if (updated.length > 10) {
                return updated.slice(0, 10);
              }
              return updated;
            });
          }
        } catch (error) {
          console.error("Error fetching transaction details:", error);
        }
      });
      
      setIsSubscribed(true);
      toast({
        title: "Monitoring Active",
        description: "Now monitoring pending transactions",
      });
    } catch (err) {
      console.error("Error subscribing to pending transactions:", err);
      setError("Failed to subscribe to pending transactions");
      toast({
        title: "Subscription Error",
        description: "Failed to monitor pending transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Unsubscribe from pending transactions
  const unsubscribeFromPendingTransactions = () => {
    if (!provider) return;
    
    try {
      // Remove the listener if it exists
      if (provider.removeListener) {
        provider.removeListener("pending", () => {});
      }
      
      setIsSubscribed(false);
      toast({
        title: "Monitoring Stopped",
        description: "Stopped monitoring pending transactions",
      });
    } catch (err) {
      console.error("Error unsubscribing from pending transactions:", err);
    }
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (isSubscribed && provider) {
        unsubscribeFromPendingTransactions();
      }
    };
  }, [isSubscribed, provider]);
  
  // Stop subscription if wallet disconnects
  useEffect(() => {
    if (!connected && isSubscribed) {
      unsubscribeFromPendingTransactions();
    }
  }, [connected, isSubscribed]);
  
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Pending Transaction Monitor
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={isLoading}
                onClick={isSubscribed ? unsubscribeFromPendingTransactions : subscribeToPendingTransactions}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : isSubscribed ? (
                  "Stop Monitoring"
                ) : (
                  "Start Monitoring"
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSubscribed ? "Stop monitoring pending transactions" : "Start monitoring pending transactions"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="p-0">
        {!connected ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>Connect your wallet to monitor pending transactions</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-red-500">{error}</p>
          </div>
        ) : pendingTxs.length > 0 ? (
          <div className="max-h-64 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hash</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Gas Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTxs.map((tx) => (
                  <TableRow key={tx.hash}>
                    <TableCell className="font-mono">{formatAddress(tx.hash)}</TableCell>
                    <TableCell className="font-mono">{formatAddress(tx.from)}</TableCell>
                    <TableCell className="font-mono">{formatAddress(tx.to)}</TableCell>
                    <TableCell>{formatEth(tx.value)} ETH</TableCell>
                    <TableCell>
                      {tx.maxFeePerGas 
                        ? `${formatGasPrice(tx.maxPriorityFeePerGas || "0x0")} (Priority)`
                        : formatGasPrice(tx.gasPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : isSubscribed ? (
          <div className="p-8 text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin mb-2" />
            <p>Waiting for pending transactions...</p>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>Click "Start Monitoring" to watch pending transactions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingTransactions;
