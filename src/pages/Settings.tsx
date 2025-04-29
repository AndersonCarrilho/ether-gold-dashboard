
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon } from "lucide-react";

const SettingsPage = () => {
  const { toast } = useToast();
  const [gasPrice, setGasPrice] = useState("auto");
  const [confirmations, setConfirmations] = useState("1");
  const [notifications, setNotifications] = useState(true);
  const [defaultGasLimit, setDefaultGasLimit] = useState("21000");
  
  const handleSave = () => {
    // In a real app, we would save these settings to local storage or a backend
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold gold-gradient">Settings</h1>
        
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5 text-gold" />
              Transaction Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gasPrice">Gas Price</Label>
                <div className="flex items-center">
                  <Input
                    id="gasPrice"
                    value={gasPrice}
                    onChange={(e) => setGasPrice(e.target.value)}
                    placeholder="Auto"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Gwei</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set to "auto" for best gas price or specify a custom value
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultGasLimit">Default Gas Limit</Label>
                <Input
                  id="defaultGasLimit"
                  value={defaultGasLimit}
                  onChange={(e) => setDefaultGasLimit(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Standard ETH transfers use 21000 gas units
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmations">Required Confirmations</Label>
                <Input
                  id="confirmations"
                  type="number"
                  min="1"
                  max="12"
                  value={confirmations}
                  onChange={(e) => setConfirmations(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of block confirmations required before a transaction is considered complete
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="mr-2">
                    Transaction Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications for transaction status changes
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <Button 
                type="button" 
                onClick={handleSave}
                className="bg-gold hover:bg-gold-dark text-black"
              >
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>About Ether Gold Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                Ether Gold Dashboard is a web3 interface for Ethereum and ERC-20 token transfers.
                It uses MetaMask or other compatible wallets for transactions on the Ethereum Mainnet.
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Version:</div>
                <div>1.0.0</div>
                
                <div className="text-muted-foreground">Network:</div>
                <div>Ethereum Mainnet</div>
                
                <div className="text-muted-foreground">RPC Endpoint:</div>
                <div className="truncate">https://mainnet.infura.io/v3/</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
