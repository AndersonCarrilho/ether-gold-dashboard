
import { useState } from "react";
import { useEthereum, ETH_TOKENS } from "@/hooks/use-ethereum";
import { TransactionService } from "@/services/transaction";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Info, Key, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

interface TransferFormProps {
  onTransactionComplete: (txHash: string) => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onTransactionComplete }) => {
  const { walletState } = useEthereum();
  const { toast } = useToast();
  
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);
  
  // New state for Etherscan API integration
  const [useEtherscan, setUseEtherscan] = useState(false);
  const [etherscanApiKey, setEtherscanApiKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Form validation
  const isValidEthAddress = (address: string) => {
    return address.match(/^0x[a-fA-F0-9]{40}$/);
  };
  
  const isValidAmount = (value: string) => {
    return !isNaN(Number(value)) && Number(value) > 0;
  };
  
  const isFormValid = () => {
    const basicValidation = isValidEthAddress(recipient) && isValidAmount(amount);
    if (!useEtherscan) return basicValidation;
    
    // When using Etherscan, we also need API key and private key
    return basicValidation && etherscanApiKey.trim() !== "" && privateKey.trim() !== "";
  };
  
  const handleTokenChange = (value: string) => {
    setSelectedToken(value);
    setAmount("");
  };
  
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (isValidEthAddress(text)) {
        setRecipient(text);
      }
    } catch (err) {
      console.error("Failed to paste from clipboard", err);
    }
  };
  
  const estimateGasFee = async () => {
    if (!walletState.connected || !walletState.provider || !isFormValid()) return;
    
    try {
      setIsLoading(true);
      const txService = new TransactionService(walletState.provider, useEtherscan ? etherscanApiKey : undefined);
      const gasPrice = await txService.getGasPrice();
      
      let gasEstimate;
      const token = ETH_TOKENS[selectedToken as keyof typeof ETH_TOKENS];
      
      if (selectedToken === "ETH") {
        const valueInWei = "0x" + BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16);
        gasEstimate = await txService.estimateGas({
          from: walletState.accounts[0],
          to: recipient,
          value: valueInWei,
        });
      } else {
        // Format data for ERC20 transfer
        const valueInTokenUnits = BigInt(Math.floor(parseFloat(amount) * (10 ** token.decimals)));
        const valueHex = "0x" + valueInTokenUnits.toString(16);
        
        // Function signature + parameters
        const ERC20_TRANSFER_ABI = "0xa9059cbb";
        const toAddressPadded = recipient.slice(2).padStart(64, "0");
        const valuePadded = valueHex.slice(2).padStart(64, "0");
        const data = `${ERC20_TRANSFER_ABI}${toAddressPadded}${valuePadded}`;
        
        gasEstimate = await txService.estimateGas({
          from: walletState.accounts[0],
          to: token.address,
          data,
          value: "0x0", // Adding the required value property
        });
      }
      
      // Calculate gas fee in ETH
      const gasFeeWei = BigInt(gasEstimate) * BigInt(gasPrice);
      const gasFeeEth = Number(gasFeeWei) / 1e18;
      setEstimatedGas(gasFeeEth.toFixed(6));
      
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error estimating gas:", error);
      toast({
        title: "Gas Estimation Error",
        description: "Could not estimate gas for this transaction.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!walletState.connected || !walletState.provider) return;
    
    try {
      setIsLoading(true);
      const txService = new TransactionService(walletState.provider);
      
      // If using Etherscan, set the API key
      if (useEtherscan && etherscanApiKey) {
        txService.setEtherscanApiKey(etherscanApiKey);
      }
      
      let txHash;
      
      if (selectedToken === "ETH") {
        txHash = await txService.sendEthTransaction(
          walletState.accounts[0],
          recipient,
          amount,
          useEtherscan,
          useEtherscan ? privateKey : undefined
        );
      } else {
        const token = ETH_TOKENS[selectedToken as keyof typeof ETH_TOKENS];
        txHash = await txService.sendTokenTransaction(
          walletState.accounts[0],
          recipient,
          token.address,
          amount,
          token.decimals,
          useEtherscan,
          useEtherscan ? privateKey : undefined
        );
      }
      
      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${txHash.substring(0, 10)}...`,
      });
      
      // Wait for confirmation
      txService.waitForTransaction(txHash, 1)
        .then((receipt) => {
          toast({
            title: "Transaction Confirmed",
            description: `${amount} ${selectedToken} sent successfully`,
          });
          
          if (receipt && receipt.status) {
            onTransactionComplete(txHash);
          }
        })
        .catch((err) => {
          console.error("Error waiting for transaction:", err);
        });
      
      setShowConfirmation(false);
      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Card className="w-full max-w-md mx-auto card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5 text-gold" />
            Send Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Select Token</Label>
            <Select
              value={selectedToken}
              onValueChange={handleTokenChange}
              disabled={!walletState.connected || isLoading}
            >
              <SelectTrigger id="token">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                <SelectItem value="USDT">USDT - Tether</SelectItem>
                <SelectItem value="USDC">USDC - USD Coin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="recipient">Recipient Address</Label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-xs text-gold hover:text-gold-light"
              >
                Paste
              </button>
            </div>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={!walletState.connected || isLoading}
              className={
                recipient && !isValidEthAddress(recipient)
                  ? "border-red-500 focus:ring-red-500"
                  : ""
              }
            />
            {recipient && !isValidEthAddress(recipient) && (
              <p className="text-red-500 text-xs mt-1">Invalid Ethereum address</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!walletState.connected || isLoading}
                className={
                  amount && !isValidAmount(amount)
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-sm text-muted-foreground">{selectedToken}</span>
              </div>
            </div>
            {amount && !isValidAmount(amount) && (
              <p className="text-red-500 text-xs mt-1">Invalid amount</p>
            )}
          </div>
          
          <Accordion
            type="single" 
            collapsible
            value={showAdvancedOptions ? "advanced" : ""}
            onValueChange={(value) => setShowAdvancedOptions(value === "advanced")}
          >
            <AccordionItem value="advanced" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm">
                Advanced Options
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useEtherscan"
                    checked={useEtherscan}
                    onCheckedChange={(checked) => setUseEtherscan(!!checked)}
                  />
                  <Label htmlFor="useEtherscan" className="text-sm cursor-pointer">
                    Use Etherscan API (for offline signing)
                  </Label>
                </div>
                
                {useEtherscan && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="etherscanApiKey" className="flex items-center">
                        <Key className="h-3 w-3 mr-1" />
                        Etherscan API Key
                      </Label>
                      <Input
                        id="etherscanApiKey"
                        type="password"
                        placeholder="Your Etherscan API key"
                        value={etherscanApiKey}
                        onChange={(e) => setEtherscanApiKey(e.target.value)}
                      />
                      <div className="text-xs flex items-center">
                        <a 
                          href="https://etherscan.io/apis" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gold hover:text-gold-dark flex items-center"
                        >
                          Get an API key <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="privateKey" className="flex items-center">
                        <Key className="h-3 w-3 mr-1" />
                        Private Key
                      </Label>
                      <Input
                        id="privateKey"
                        type="password"
                        placeholder="Your wallet's private key"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                      />
                      <p className="text-amber-500 text-xs flex items-center">
                        <Info className="h-3 w-3 mr-1" />
                        Never share your private key! For testing only.
                      </p>
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter>
          <Button
            onClick={estimateGasFee}
            disabled={!walletState.connected || !isFormValid() || isLoading}
            className="w-full bg-gold hover:bg-gold-dark text-black"
          >
            {isLoading ? "Processing..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Please review your transaction details before sending.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Token:</div>
              <div className="text-sm font-medium">{selectedToken}</div>

              <div className="text-sm text-muted-foreground">Amount:</div>
              <div className="text-sm font-medium">{amount} {selectedToken}</div>

              <div className="text-sm text-muted-foreground">To:</div>
              <div className="text-xs font-mono truncate">{recipient}</div>

              <div className="text-sm text-muted-foreground">Estimated Gas Fee:</div>
              <div className="text-sm font-medium">{estimatedGas} ETH</div>
              
              {useEtherscan && (
                <>
                  <div className="text-sm text-muted-foreground">Broadcast Method:</div>
                  <div className="text-sm font-medium">Etherscan API</div>
                </>
              )}
            </div>

            <div className="flex items-center p-3 bg-gold/10 rounded-md">
              <Info size={16} className="text-gold mr-2 flex-shrink-0" />
              <span className="text-xs">
                Gas fees are paid to the Ethereum network for processing your transaction and may vary.
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-gold hover:bg-gold-dark text-black"
              >
                {isLoading ? "Processing..." : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransferForm;
