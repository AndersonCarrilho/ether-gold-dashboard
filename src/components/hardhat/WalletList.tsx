
import { useState, useEffect } from "react";
import { useWalletGenerator } from "@/hooks/use-wallet-generator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { List, Copy, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const WalletList = () => {
  const { wallets, swapEthToUsdt, isLoading } = useWalletGenerator();
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState<number | null>(null);
  const [swapAmount, setSwapAmount] = useState("1.0");

  // Debug wallet list status
  useEffect(() => {
    console.log("Current wallets in WalletList:", wallets);
  }, [wallets]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleOpenSwapDialog = (index: number) => {
    setSelectedWalletIndex(index);
    setShowSwapDialog(true);
  };

  const handleSwap = async () => {
    if (selectedWalletIndex === null) return;
    
    await swapEthToUsdt(selectedWalletIndex, swapAmount);
    setShowSwapDialog(false);
  };

  const formatAddress = (address: string): string => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (wallets.length === 0) {
    return (
      <Card className="w-full mt-4 card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <List className="mr-2 h-5 w-5 text-gold" />
            Wallet List
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No wallets generated yet. Use the generator above to create test wallets.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full mt-4 card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <List className="mr-2 h-5 w-5 text-gold" />
            Wallet List ({wallets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>ETH Balance</TableHead>
                  <TableHead>USDT Balance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet, index) => (
                  <TableRow key={wallet.address}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatAddress(wallet.address)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1"
                        onClick={() => handleCopyToClipboard(wallet.address)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TableCell>
                    <TableCell>{parseFloat(wallet.balance).toFixed(4)} ETH</TableCell>
                    <TableCell>{parseFloat(wallet.usdtBalance).toFixed(2)} USDT</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleOpenSwapDialog(index)}
                          disabled={parseFloat(wallet.balance) <= 0 || isLoading}
                        >
                          <ArrowRightLeft className="h-3 w-3" /> Swap to USDT
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="details">
              <AccordionTrigger>Wallet Details</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {wallets.map((wallet, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <p className="font-bold">Wallet {index + 1}</p>
                      <div className="grid gap-1 mt-2">
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                          <span className="font-semibold">Address:</span>
                          <code className="text-xs break-all">{wallet.address}</code>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                          <span className="font-semibold">Private Key:</span>
                          <code className="text-xs break-all">{wallet.privateKey}</code>
                        </div>
                        {wallet.mnemonicPhrase && (
                          <div className="grid grid-cols-[100px_1fr] gap-2">
                            <span className="font-semibold">Mnemonic:</span>
                            <code className="text-xs break-all">{wallet.mnemonicPhrase}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Swap ETH to USDT</DialogTitle>
            <DialogDescription>
              Convert ETH to USDT using the simulated Hardhat test environment.
            </DialogDescription>
          </DialogHeader>

          {selectedWalletIndex !== null && wallets[selectedWalletIndex] && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Wallet:</div>
                <div className="text-sm font-mono">{formatAddress(wallets[selectedWalletIndex].address)}</div>
                
                <div className="text-sm text-muted-foreground">Available ETH:</div>
                <div className="text-sm font-medium">{wallets[selectedWalletIndex].balance} ETH</div>
                
                <div className="text-sm text-muted-foreground">Current USDT:</div>
                <div className="text-sm font-medium">{wallets[selectedWalletIndex].usdtBalance} USDT</div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="swapAmount">Amount to swap (ETH)</Label>
                <Input
                  id="swapAmount"
                  type="number"
                  min="0.01"
                  max={parseFloat(wallets[selectedWalletIndex].balance)}
                  step="0.01"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You'll receive approximately {(parseFloat(swapAmount) * 2000).toFixed(2)} USDT
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSwapDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSwap}
              disabled={isLoading || selectedWalletIndex === null || parseFloat(swapAmount) <= 0}
              className="bg-gold hover:bg-gold-dark text-black"
            >
              Swap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletList;
