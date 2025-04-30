
import { useState } from "react";
import { useWalletGenerator } from "@/hooks/use-wallet-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const WalletGenerator = () => {
  const { generateWallets, isLoading } = useWalletGenerator();
  const [walletCount, setWalletCount] = useState("10"); // Default to 10 wallets
  const [initialBalance, setInitialBalance] = useState("10"); // Default 10 ETH

  const handleGenerate = async () => {
    if (!walletCount || isNaN(parseInt(walletCount)) || parseInt(walletCount) <= 0) {
      toast.error("Please enter a valid number of wallets");
      return;
    }

    if (!initialBalance || isNaN(parseFloat(initialBalance)) || parseFloat(initialBalance) <= 0) {
      toast.error("Please enter a valid initial balance");
      return;
    }

    try {
      // Show a toast to indicate we're generating wallets
      toast.loading(`Generating ${walletCount} wallets...`);

      // Generate the wallets
      await generateWallets(parseInt(walletCount), initialBalance);
      
      // Show success toast
      toast.success(`Successfully generated ${walletCount} wallets with ${initialBalance} ETH each`);
    } catch (error) {
      console.error("Error generating wallets:", error);
      toast.error("Failed to generate wallets");
    }
  };

  return (
    <Card className="w-full card-hover">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="mr-2 h-5 w-5 text-gold" />
          Generate Test Wallets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="walletCount">Number of Wallets</Label>
          <Input
            id="walletCount"
            type="number"
            min="1"
            max="50"
            value={walletCount}
            onChange={(e) => setWalletCount(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="initialBalance">Initial ETH Balance</Label>
          <Input
            id="initialBalance"
            type="number"
            min="0.1"
            step="0.1"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-gold hover:bg-gold-dark text-black"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Wallets"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletGenerator;
