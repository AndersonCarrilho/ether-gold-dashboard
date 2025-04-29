
import { useState } from "react";
import { 
  Send, 
  Receive, 
  Check, 
  Info 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransactionRowProps {
  hash: string;
  type: "send" | "receive";
  status: "pending" | "confirmed" | "failed";
  from: string;
  to: string;
  amount: string;
  symbol: string;
  timestamp: string;
  gasUsed?: string;
  onViewReceipt: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  hash,
  type,
  status,
  from,
  to,
  amount,
  symbol,
  timestamp,
  gasUsed,
  onViewReceipt,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const statusColors = {
    pending: "text-yellow-500",
    confirmed: "text-green-500",
    failed: "text-red-500",
  };

  return (
    <div 
      className="border-b border-border last:border-0 p-3 hover:bg-secondary/20 transition-colors cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            type === "send" ? "bg-red-500/10" : "bg-green-500/10"
          }`}>
            {type === "send" ? (
              <Send size={16} className="text-red-500" />
            ) : (
              <Receive size={16} className="text-green-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">
              {type === "send" ? "Sent" : "Received"} {symbol}
            </p>
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {type === "send" ? "-" : "+"}{amount} {symbol}
          </p>
          <p className={`text-xs ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border/50 text-sm grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hash:</span>
            <span className="font-mono">{formatAddress(hash)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">From:</span>
            <span className="font-mono">{formatAddress(from)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">To:</span>
            <span className="font-mono">{formatAddress(to)}</span>
          </div>
          {gasUsed && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gas Used:</span>
              <span>{gasUsed}</span>
            </div>
          )}
          <div className="flex justify-end mt-2">
            <button 
              className="text-gold hover:underline text-sm flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                onViewReceipt();
              }}
            >
              <Check size={14} className="mr-1" />
              View Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionRow;
