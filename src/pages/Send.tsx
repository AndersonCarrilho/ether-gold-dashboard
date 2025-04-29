
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransferForm from "@/components/send/TransferForm";
import TransactionReceipt from "@/components/dashboard/TransactionReceipt";

const Send = () => {
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  
  const handleTransactionComplete = (txHash: string) => {
    // In a real app, we'd fetch the receipt from blockchain
    // Showing mock data for demo purposes
    const mockReceiptData = {
      hash: txHash,
      from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      to: "0x0716a17FBAeE714f1E6aB0f9d59edbC5f09815C0",
      amount: "0.5",
      symbol: "ETH",
      timestamp: new Date().toLocaleString(),
      blockNumber: 17126250,
      gasUsed: "21000",
      status: "Confirmed",
    };
    
    setReceiptData(mockReceiptData);
    setShowReceipt(true);
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold gold-gradient">Send Assets</h1>
        
        <div className="mt-6">
          <TransferForm onTransactionComplete={handleTransactionComplete} />
        </div>
        
        {receiptData && (
          <TransactionReceipt
            open={showReceipt}
            onOpenChange={setShowReceipt}
            transactionData={receiptData}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Send;
