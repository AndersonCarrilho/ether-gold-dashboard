
import { useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useEthereum } from "@/hooks/use-ethereum";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Receive } from "lucide-react";
import QRCode from "qrcode.js";

const ReceivePage = () => {
  const { walletState } = useEthereum();
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const { connected, accounts } = walletState;
  
  const copyToClipboard = async () => {
    if (!connected || !accounts.length) return;
    
    try {
      await navigator.clipboard.writeText(accounts[0]);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  
  // Generate QR code when component mounts or when address changes
  const generateQR = () => {
    if (qrRef.current && connected && accounts.length) {
      qrRef.current.innerHTML = "";
      QRCode(qrRef.current, {
        text: accounts[0],
        width: 196,
        height: 196,
        colorDark: "#D4AF37",
        colorLight: "#222222",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  };
  
  // Use effect to generate QR code
  if (qrRef.current && connected && accounts.length) {
    setTimeout(() => generateQR(), 100);
  }
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold gold-gradient">Receive Assets</h1>
        
        {!connected ? (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground mb-4 text-center">
              Connect your wallet to view your receive address.
            </p>
          </div>
        ) : (
          <div className="mt-6 max-w-md mx-auto w-full">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receive className="mr-2 h-5 w-5 text-gold" />
                  Receive Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div 
                    ref={qrRef} 
                    className="bg-secondary rounded-lg p-3"
                    style={{ width: 202, height: 202 }}
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your Ethereum Address:</p>
                  <div className="flex">
                    <Input
                      value={connected && accounts.length ? accounts[0] : ""}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-secondary/50 p-4 rounded-md text-sm space-y-2">
                  <p className="font-medium text-gold">Important:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Only send ETH and ERC-20 tokens to this address.</li>
                    <li>Sending other types of cryptocurrencies may result in permanent loss.</li>
                    <li>Verify the entire address before sending.</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={copyToClipboard}
                  className="w-full bg-gold hover:bg-gold-dark text-black"
                >
                  Copy Address
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReceivePage;
