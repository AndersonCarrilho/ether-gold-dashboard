
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransactionRow from "@/components/dashboard/TransactionRow";
import TransactionReceipt from "@/components/dashboard/TransactionReceipt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEthereum } from "@/hooks/use-ethereum";
import { EtherscanService, EtherscanTransaction } from "@/services/etherscan";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ethers } from "ethers";

type FilterType = 'all' | 'send' | 'receive';

const TransactionsPage = () => {
  const { walletState } = useEthereum();
  const { address: currentUserAddress, connected } = walletState;

  const [allTransactions, setAllTransactions] = useState<EtherscanTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');
  
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null); // Consider specific type
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (connected && currentUserAddress) {
      setIsLoading(true);
      setError(null);
      // TODO: Replace 'YOUR_ETHERSCAN_API_KEY' with your actual Etherscan API key
      // or use an environment variable like import.meta.env.VITE_ETHERSCAN_API_KEY
      const etherscanService = new EtherscanService({ apiKey: 'YOUR_ETHERSCAN_API_KEY' });

      etherscanService.getTransactionsForAddress(currentUserAddress)
        .then(transactions => {
          setAllTransactions(transactions);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch transactions:", err);
          setError("Failed to load transaction history. Please try again later.");
          setIsLoading(false);
        });
    } else {
      setAllTransactions([]); // Clear transactions if wallet disconnects
    }
  }, [connected, currentUserAddress]);

  const handleViewReceipt = (tx: EtherscanTransaction) => {
    setSelectedReceipt({
      ...tx,
      // Ensure blockNumber is handled as a number if TransactionReceipt expects it
      // Etherscan's blockNumber is a string.
      blockNumber: tx.blockNumber ? parseInt(tx.blockNumber) : undefined, 
    });
    setShowReceipt(true);
  };
  
  const filteredTransactions = useMemo(() => {
    let transactions = allTransactions;
    const lowerCaseCurrentUserAddress = currentUserAddress?.toLowerCase();

    // Apply type filter
    if (filterType === 'send') {
      transactions = transactions.filter(tx => tx.from.toLowerCase() === lowerCaseCurrentUserAddress);
    } else if (filterType === 'receive') {
      transactions = transactions.filter(tx => tx.to.toLowerCase() === lowerCaseCurrentUserAddress);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      transactions = transactions.filter(tx => {
        const amountInEth = ethers.utils.formatEther(tx.value);
        return (
          tx.hash.toLowerCase().includes(query) ||
          tx.from.toLowerCase().includes(query) ||
          (tx.to && tx.to.toLowerCase().includes(query)) || // tx.to can be empty for contract creation
          amountInEth.includes(query) // Search by formatted ETH amount
          // Assuming symbol is ETH for now as per TransactionRow
        );
      });
    }
    return transactions;
  }, [allTransactions, filterType, searchQuery, currentUserAddress]);
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold gold-gradient">Transaction History</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hash, address, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <RadioGroup
            defaultValue="all"
            onValueChange={(value: string) => setFilterType(value as FilterType)}
            className="flex items-center space-x-2 sm:space-x-4"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="send" id="send" />
              <Label htmlFor="send">Sent</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="receive" id="receive" />
              <Label htmlFor="receive">Received</Label>
            </div>
          </RadioGroup>
        </div>
        
        {isLoading && <p className="text-center text-white">Loading transactions...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!isLoading && !error && (
          <Card className="card-hover w-full">
            <CardHeader>
              <CardTitle className="text-lg">Transactions ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <TransactionRow
                    key={tx.hash}
                    transaction={tx} // Pass the full EtherscanTransaction object
                    onViewReceipt={() => handleViewReceipt(tx)}
                  />
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No transactions found.
                </div>
              )}
            </CardContent>
          </Card>
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

export default TransactionsPage;
