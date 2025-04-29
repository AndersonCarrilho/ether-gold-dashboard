
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransactionRow from "@/components/dashboard/TransactionRow";
import TransactionReceipt from "@/components/dashboard/TransactionReceipt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Mock expanded transaction data
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
  },
  {
    hash: "0x8d7da5e39f1e40abcee30d52a367a24481d0aeccfeb4be8dbc99ef347aab61a4",
    type: "send" as const,
    status: "confirmed" as const,
    from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    to: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    amount: "100",
    symbol: "USDT",
    timestamp: "2023-04-22 11:05",
    gasUsed: "65000",
  },
  {
    hash: "0x3a08b03d7a58baab742e6c54295c74a0e6a114e61d59a78c41c1d5748345e8b",
    type: "receive" as const,
    status: "confirmed" as const,
    from: "0x388C818CA8B9251b393131C08a736A67ccB19297",
    to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    amount: "50",
    symbol: "USDC",
    timestamp: "2023-04-20 16:45",
    gasUsed: "65000",
  },
  {
    hash: "0x9f4c2c95e06d7ed26221852bc8125c6e39c88917eb9360b1c231b75b9c3b8e0c",
    type: "send" as const,
    status: "pending" as const,
    from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    to: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
    amount: "0.2",
    symbol: "ETH",
    timestamp: "2023-04-29 08:12",
    gasUsed: "21000",
  }
];

const TransactionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const handleViewReceipt = (tx: any) => {
    setSelectedReceipt({
      ...tx,
      blockNumber: 17126250, // Mock block number
    });
    setShowReceipt(true);
  };
  
  const filteredTransactions = mockTransactions.filter(tx => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      tx.hash.toLowerCase().includes(query) ||
      tx.from.toLowerCase().includes(query) ||
      tx.to.toLowerCase().includes(query) ||
      tx.symbol.toLowerCase().includes(query) ||
      tx.amount.includes(query)
    );
  });
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold gold-gradient">Transaction History</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hash, address, or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Card className="card-hover w-full">
          <CardHeader>
            <CardTitle className="text-lg">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TransactionRow
                  key={tx.hash}
                  {...tx}
                  onViewReceipt={() => handleViewReceipt(tx)}
                />
              ))
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No transactions found matching your search.
              </div>
            )}
          </CardContent>
        </Card>
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
