
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TransactionReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionData: {
    hash: string;
    from: string;
    to: string;
    amount: string;
    symbol: string;
    timestamp: string;
    blockNumber: number;
    gasUsed: string;
    status: string;
  };
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  open,
  onOpenChange,
  transactionData,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (!transactionData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            Transaction Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="p-4 rounded-md bg-secondary/30 border border-border space-y-4">
            <div className="text-center">
              <p className="text-xl font-bold gold-gradient">{transactionData.amount} {transactionData.symbol}</p>
              <p className="text-sm text-muted-foreground">{transactionData.timestamp}</p>
            </div>
            
            <div className="grid gap-3">
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  {transactionData.status}
                </span>
              </div>
              
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Block:</span>
                <span className="text-sm font-medium">{transactionData.blockNumber}</span>
              </div>
              
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Hash:</span>
                <div className="flex items-center">
                  <span className="text-xs font-mono truncate">{transactionData.hash}</span>
                  <button 
                    className="ml-2 text-gold hover:text-gold-dark"
                    onClick={() => handleCopy(transactionData.hash)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">From:</span>
                <div className="flex items-center">
                  <span className="text-xs font-mono truncate">{transactionData.from}</span>
                  <button 
                    className="ml-2 text-gold hover:text-gold-dark"
                    onClick={() => handleCopy(transactionData.from)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">To:</span>
                <div className="flex items-center">
                  <span className="text-xs font-mono truncate">{transactionData.to}</span>
                  <button 
                    className="ml-2 text-gold hover:text-gold-dark"
                    onClick={() => handleCopy(transactionData.to)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                <span className="text-sm text-muted-foreground">Gas Used:</span>
                <span className="text-sm font-medium">{transactionData.gasUsed}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              className="bg-gold hover:bg-gold-dark text-black"
              onClick={() => handleCopy(JSON.stringify(transactionData, null, 2))}
            >
              {copied ? "Copied!" : "Copy Receipt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionReceipt;
