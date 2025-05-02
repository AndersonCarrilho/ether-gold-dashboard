
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Send, Download, Wallet, RefreshCw } from "lucide-react";
import { useEthereum } from "@/hooks/use-ethereum";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const QuickActionsCard = () => {
  const { walletState } = useEthereum();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!walletState.connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setRefreshing(true);
    toast({
      title: "Refreshing blockchain data",
      description: "Please wait a moment...",
    });

    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Your blockchain data has been updated",
      });
    }, 2000);
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex flex-col h-24 border-border/50 hover:border-gold/50 hover:bg-secondary/50 transition-all"
            onClick={() => navigate("/send")}
          >
            <Send className="h-6 w-6 mb-2 text-gold" />
            <span>Send</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col h-24 border-border/50 hover:border-gold/50 hover:bg-secondary/50 transition-all"
            onClick={() => navigate("/receive")}
          >
            <Download className="h-6 w-6 mb-2 text-gold" />
            <span>Receive</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col h-24 border-border/50 hover:border-gold/50 hover:bg-secondary/50 transition-all"
            onClick={() => navigate("/transactions")}
          >
            <Wallet className="h-6 w-6 mb-2 text-gold" />
            <span>Transactions</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col h-24 border-border/50 hover:border-gold/50 hover:bg-secondary/50 transition-all"
            onClick={handleRefresh}
            disabled={refreshing || !walletState.connected}
          >
            <RefreshCw className={`h-6 w-6 mb-2 text-gold ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
