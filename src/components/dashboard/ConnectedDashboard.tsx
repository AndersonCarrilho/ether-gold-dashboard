
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AssetsOverview from "./AssetsOverview";
import DashboardActions from "./DashboardActions";
import MarketSection from "./MarketSection";
import SystemOverview from "./SystemOverview";
import PendingTransactions from "./PendingTransactions";
import TransactionReceipt from "./TransactionReceipt";

interface ConnectedDashboardProps {
  mockTransactions: any[];
}

const ConnectedDashboard = ({ mockTransactions }: ConnectedDashboardProps) => {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const handleViewReceipt = (tx: any) => {
    setSelectedReceipt({
      ...tx,
      blockNumber: 17126250, // Mock block number
    });
    setShowReceipt(true);
  };
  
  return (
    <div className="flex flex-col h-full">
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
      
      <AssetsOverview />
      <DashboardActions />
      <MarketSection />
      
      <div className="mt-4">
        <PendingTransactions />
      </div>
      
      <SystemOverview 
        transactions={mockTransactions} 
        onViewReceipt={handleViewReceipt} 
      />
      
      {selectedReceipt && (
        <TransactionReceipt
          open={showReceipt}
          onOpenChange={setShowReceipt}
          transactionData={selectedReceipt}
        />
      )}
    </div>
  );
};

export default ConnectedDashboard;
