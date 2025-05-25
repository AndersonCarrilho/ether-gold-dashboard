
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
import { EtherscanTransaction } from "@/services/etherscan";

/**
 * @interface ConnectedDashboardProps
 * @description Props for the ConnectedDashboard component.
 * @property {EtherscanTransaction[]} transactions - An array of transactions for the connected user,
 * fetched from Etherscan.
 */
interface ConnectedDashboardProps {
  transactions: EtherscanTransaction[];
}

/**
 * @component ConnectedDashboard
 * @description This component renders the main dashboard view when a user's wallet is connected.
 * It displays an overview of assets, recent transactions, and provides access to various
 * financial tools and market information.
 * @param {ConnectedDashboardProps} props - The props for the component.
 */
const ConnectedDashboard = ({ transactions }: ConnectedDashboardProps) => {
  // State to store the transaction data for which the receipt is being viewed.
  // 'any' is used for flexibility, but can be narrowed down if receipt structure is fixed.
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  // State to control the visibility of the TransactionReceipt modal.
  const [showReceipt, setShowReceipt] = useState(false);
  
  /**
   * @function handleViewReceipt
   * @description Handles the action of viewing a transaction receipt.
   * It sets the selected transaction data and makes the receipt modal visible.
   * @param {EtherscanTransaction | any} tx - The transaction object whose receipt is to be viewed.
   *        It can be an EtherscanTransaction or a more generic object if other tx types are handled.
   */
  const handleViewReceipt = (tx: EtherscanTransaction | any) => { 
    setSelectedReceipt({
      ...tx,
      // Etherscan API returns blockNumber as a string.
      // It's parsed to an integer here if needed by the TransactionReceipt component.
      // A fallback or more robust error handling might be needed if blockNumber can be invalid.
      blockNumber: tx.blockNumber ? parseInt(tx.blockNumber) : undefined, 
    });
    setShowReceipt(true); // Trigger the display of the TransactionReceipt modal.
  };
  
  return (
    // Main container for the dashboard, allowing vertical scrolling.
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      {/* Dashboard Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gold-gradient">Dashboard</h1>
        {/* Network Status Indicator */}
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
      
      {/* Overview of user's assets */}
      <AssetsOverview />
      {/* Quick actions like Send, Receive, Swap */}
      <DashboardActions />
      
      {/* System and recent transactions overview */}
      <SystemOverview 
        transactions={transactions} // Pass the fetched transactions to SystemOverview
        onViewReceipt={handleViewReceipt} // Pass the handler to view transaction receipts
      />
      
      {/* Tabbed section for different financial tools and information */}
      <Tabs defaultValue="market" className="mt-6">
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        {/* Market Information Tab */}
        <TabsContent value="market">
          <MarketSection />
        </TabsContent>
        {/* Blockchain Messaging Tab */}
        <TabsContent value="messaging">
          <div className="grid grid-cols-1 gap-4">
            <BlockchainMessagingCard />
          </div>
        </TabsContent>
        {/* Compliance Tools Tab */}
        <TabsContent value="compliance">
          <div className="grid grid-cols-1 gap-4">
            <ComplianceCard />
          </div>
        </TabsContent>
        {/* Payment Solutions Tab */}
        <TabsContent value="payments">
          <div className="grid grid-cols-1 gap-4">
            <PaymentSolutionCard />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Additional dashboard cards: Operational Stats and Pending Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <OperationalStatsCard />
        <div className="mt-4 md:mt-0">
          {/* Placeholder or component for pending transactions */}
          <PendingTransactions />
        </div>
      </div>
      
      {/* Transaction Receipt Modal: Conditionally rendered when a receipt is selected */}
      {selectedReceipt && (
        <TransactionReceipt
          open={showReceipt} // Controls visibility
          onOpenChange={setShowReceipt} // Allows the modal to close itself
          transactionData={selectedReceipt} // The data for the receipt
        />
      )}
    </div>
  );
};

export default ConnectedDashboard;
