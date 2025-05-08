
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AssetsOverview from "./AssetsOverview";
import DashboardActions from "./DashboardActions";
import MarketSection from "./MarketSection";
import SystemOverview from "./SystemOverview";
import PendingTransactions from "./PendingTransactions";
import TransactionReceipt from "./TransactionReceipt";
import BlockchainMessagingCard from "./BlockchainMessagingCard";
import OperationalStatsCard from "./OperationalStatsCard";
import ComplianceCard from "./ComplianceCard";
import PaymentSolutionCard from "./PaymentSolutionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="flex flex-col h-full overflow-y-auto pb-6">
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
      
      <SystemOverview 
        transactions={mockTransactions} 
        onViewReceipt={handleViewReceipt} 
      />
      
      <Tabs defaultValue="market" className="mt-6">
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="market">
          <MarketSection />
        </TabsContent>
        <TabsContent value="messaging">
          <div className="grid grid-cols-1 gap-4">
            <BlockchainMessagingCard />
          </div>
        </TabsContent>
        <TabsContent value="compliance">
          <div className="grid grid-cols-1 gap-4">
            <ComplianceCard />
          </div>
        </TabsContent>
        <TabsContent value="payments">
          <div className="grid grid-cols-1 gap-4">
            <PaymentSolutionCard />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <OperationalStatsCard />
        <div className="mt-4 md:mt-0">
          <PendingTransactions />
        </div>
      </div>
      
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
