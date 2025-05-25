
import { useState } from "react";
import { Send, Download, Check } from "lucide-react";
import { EtherscanTransaction } from "@/services/etherscan";
import { useEthereum } from "@/hooks/use-ethereum";
import { ethers } from "ethers";

interface TransactionRowProps {
  transaction: EtherscanTransaction;
  onViewReceipt: () => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onViewReceipt,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { walletState } = useEthereum();
  const currentUserAddress = walletState.address?.toLowerCase();

  const {
    hash,
    from,
    to,
    value,
    timeStamp,
    gasUsed,
    isError,
    // txreceipt_status, // Can be used for more precise status if needed
  } = transaction;

  const formatAddress = (address: string) => {
    if (!address) return "N/A";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const txType = from.toLowerCase() === currentUserAddress ? "send" : "receive";
  
  // isError '0' means no error, '1' means error.
  // txreceipt_status '1' means success, '0' means failure (for post-Byzantium transactions)
  // For txlist, isError is usually sufficient for basic success/failure indication.
  const status: "confirmed" | "failed" = isError === "0" ? "confirmed" : "failed";

  const amount = ethers.utils.formatEther(value);
  const symbol = "ETH"; // Assuming ETH for now
  const formattedTimestamp = new Date(parseInt(timeStamp) * 1000).toLocaleString();

  const statusColors = {
    confirmed: "text-green-500",
    failed: "text-red-500",
    // pending: "text-yellow-500", // Not typically derived from txlist
  };

  return (
    <div
      className="border-b border-border last:border-0 p-3 hover:bg-secondary/20 transition-colors cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-full ${
              txType === "send" ? "bg-red-500/10" : "bg-green-500/10"
            }`}
          >
            {txType === "send" ? (
              <Send size={16} className="text-red-500" />
            ) : (
              <Download size={16} className="text-green-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">
              {txType === "send" ? "Sent" : "Received"} {symbol}
            </p>
            <p className="text-xs text-muted-foreground">{formattedTimestamp}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {txType === "send" ? "-" : "+"}
            {parseFloat(amount).toFixed(6)} {symbol} {/* Show more precision */}
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
              <span>{ethers.BigNumber.from(gasUsed).toString()}</span> {/* Format gasUsed */}
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
