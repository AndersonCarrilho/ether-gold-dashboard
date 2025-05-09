
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TransferForm from "@/components/send/TransferForm";
import LegacyTransferForm from "@/components/send/LegacyTransferForm";
import TransactionReceipt from "@/components/dashboard/TransactionReceipt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

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
      status: "Confirmado",
    };
    
    setReceiptData(mockReceiptData);
    setShowReceipt(true);
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold gold-gradient">Enviar Ativos</h1>
        
        <div className="mt-6">
          <Tabs defaultValue="standard">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="standard" className="flex-1">
                Transação Padrão (EIP-1559)
              </TabsTrigger>
              <TabsTrigger value="legacy" className="flex-1">
                Transação Legada (Tipo 0)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard">
              <TransferForm onTransactionComplete={handleTransactionComplete} />
            </TabsContent>
            
            <TabsContent value="legacy">
              <LegacyTransferForm onTransactionComplete={handleTransactionComplete} />
            </TabsContent>
          </Tabs>
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
