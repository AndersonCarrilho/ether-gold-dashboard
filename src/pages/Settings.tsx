
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// Note: The original page uses useToast from "@/hooks/use-toast", 
// but the subtask specifies sonner's toast. We'll use sonner.
import { toast as sonnerToast } from "sonner"; 
import { Settings as SettingsIcon, KeyRound } from "lucide-react";
import {
  saveEtherscanApiKey,
  loadEtherscanApiKey,
  clearEtherscanApiKey,
  saveRpcApiKey,
  loadRpcApiKey,
  clearRpcApiKey,
} from "@/lib/settingsStorage";

const SettingsPage = () => {
  // const { toast } = useToast(); // Original toast
  const [gasPrice, setGasPrice] = useState("auto");
  const [confirmations, setConfirmations] = useState("1");
  const [notifications, setNotifications] = useState(true);
  const [defaultGasLimit, setDefaultGasLimit] = useState("21000");

  // State for API Key Management
  const [etherscanApiKeyInput, setEtherscanApiKeyInput] = useState('');
  const [rpcApiKeyInput, setRpcApiKeyInput] = useState('');
  const [storedEtherscanApiKey, setStoredEtherscanApiKey] = useState<string | null>(null);
  const [storedRpcApiKey, setStoredRpcApiKey] = useState<string | null>(null);
  
  // Load stored API keys on mount
  useEffect(() => {
    const loadedEtherscanKey = loadEtherscanApiKey();
    const loadedRpcKey = loadRpcApiKey();
    setStoredEtherscanApiKey(loadedEtherscanKey);
    setEtherscanApiKeyInput(loadedEtherscanKey || '');
    setStoredRpcApiKey(loadedRpcKey);
    setRpcApiKeyInput(loadedRpcKey || '');
  }, []);

  const handleSaveLegacySettings = () => {
    // In a real app, we would save these settings to local storage or a backend
    sonnerToast.success("Legacy Settings Saved", { // Using sonnerToast
      description: "Your legacy transaction settings have been saved successfully (mock).",
    });
  };

  // Handlers for Etherscan API Key
  const handleSaveEtherscanKey = () => {
    saveEtherscanApiKey(etherscanApiKeyInput);
    setStoredEtherscanApiKey(etherscanApiKeyInput);
    sonnerToast.success("Etherscan API Key Saved", {
      description: "Your Etherscan API key has been saved in local storage.",
    });
  };

  const handleClearEtherscanKey = () => {
    clearEtherscanApiKey();
    setStoredEtherscanApiKey(null);
    setEtherscanApiKeyInput('');
    sonnerToast.info("Etherscan API Key Cleared", {
      description: "Your Etherscan API key has been removed from local storage.",
    });
  };

  // Handlers for RPC API Key
  const handleSaveRpcKey = () => {
    saveRpcApiKey(rpcApiKeyInput);
    setStoredRpcApiKey(rpcApiKeyInput);
    sonnerToast.success("RPC API Key Saved", {
      description: "Your RPC API key has been saved in local storage.",
    });
  };

  const handleClearRpcKey = () => {
    clearRpcApiKey();
    setStoredRpcApiKey(null);
    setRpcApiKeyInput('');
    sonnerToast.info("RPC API Key Cleared", {
      description: "Your RPC API key has been removed from local storage.",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6"> {/* Increased gap for better separation */}
        <h1 className="text-3xl font-bold gold-gradient">Settings</h1> {/* Increased title size */}
        
        {/* API Key Management Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <KeyRound className="mr-2 h-5 w-5 text-gold" />
              API Key Management
            </CardTitle>
            <CardDescription>
              API keys are stored in your browser's local storage. 
              Do not use this feature on shared or public computers. 
              These keys enhance functionality like fetching transaction history directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Etherscan API Key Section */}
            <div className="space-y-3 p-4 border rounded-md">
              <Label htmlFor="etherscanApiKey" className="text-base font-semibold">Etherscan API Key</Label>
              <Input
                id="etherscanApiKey"
                type="password" // Use password type for sensitive keys
                value={etherscanApiKeyInput}
                onChange={(e) => setEtherscanApiKeyInput(e.target.value)}
                placeholder="Enter your Etherscan API Key"
              />
              <p className="text-sm text-muted-foreground">
                Status: <span className={storedEtherscanApiKey ? "text-green-500" : "text-red-500"}>
                  {storedEtherscanApiKey ? 'Key Set' : 'Not Set'}
                </span>
                {storedEtherscanApiKey && ` (Key: ...${storedEtherscanApiKey.slice(-4)})`}
              </p>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSaveEtherscanKey} size="sm">Save Etherscan Key</Button>
                <Button onClick={handleClearEtherscanKey} variant="outline" size="sm">Clear Key</Button>
              </div>
            </div>

            {/* Infura/RPC API Key Section */}
            <div className="space-y-3 p-4 border rounded-md">
              <Label htmlFor="rpcApiKey" className="text-base font-semibold">Infura/RPC API Key</Label>
              <Input
                id="rpcApiKey"
                type="password" // Use password type for sensitive keys
                value={rpcApiKeyInput}
                onChange={(e) => setRpcApiKeyInput(e.target.value)}
                placeholder="Enter your Infura or other RPC Provider API Key"
              />
              <p className="text-sm text-muted-foreground">
                Status: <span className={storedRpcApiKey ? "text-green-500" : "text-red-500"}>
                  {storedRpcApiKey ? 'Key Set' : 'Not Set'}
                </span>
                 {storedRpcApiKey && ` (Key: ...${storedRpcApiKey.slice(-4)})`}
              </p>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSaveRpcKey} size="sm">Save RPC Key</Button>
                <Button onClick={handleClearRpcKey} variant="outline" size="sm">Clear Key</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Transaction Settings Card */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5 text-gold" />
              Legacy Transaction Settings (Mock)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gasPrice">Gas Price (Legacy)</Label>
                <div className="flex items-center">
                  <Input
                    id="gasPrice"
                    value={gasPrice}
                    onChange={(e) => setGasPrice(e.target.value)}
                    placeholder="Auto"
                    disabled // Mock, not functional
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Gwei</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set to "auto" for best gas price or specify a custom value (currently mock).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultGasLimit">Default Gas Limit (Legacy)</Label>
                <Input
                  id="defaultGasLimit"
                  value={defaultGasLimit}
                  onChange={(e) => setDefaultGasLimit(e.target.value)}
                  disabled // Mock, not functional
                />
                <p className="text-xs text-muted-foreground">
                  Standard ETH transfers use 21000 gas units (currently mock).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmations">Required Confirmations (Legacy)</Label>
                <Input
                  id="confirmations"
                  type="number"
                  min="1"
                  max="12"
                  value={confirmations}
                  onChange={(e) => setConfirmations(e.target.value)}
                  disabled // Mock, not functional
                />
                <p className="text-xs text-muted-foreground">
                  Number of block confirmations required before a transaction is considered complete (currently mock).
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="mr-2">
                    Transaction Notifications (Legacy)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications for transaction status changes (currently mock).
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  disabled // Mock, not functional
                />
              </div>
              
              <Button 
                type="button" 
                onClick={handleSaveLegacySettings}
                className="bg-gold hover:bg-gold-dark text-black"
              >
                Save Legacy Settings (Mock)
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
