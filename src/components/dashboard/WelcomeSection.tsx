
import { Info } from "lucide-react";

const WelcomeSection = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative mb-6 w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping"></div>
        <div className="absolute inset-2 rounded-full bg-gold/30 animate-pulse"></div>
        <div className="absolute inset-4 rounded-full bg-gold/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Info className="h-8 w-8 text-gold" />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-4 gold-gradient">Welcome to EtherGold Dashboard</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Connect your wallet to access advanced blockchain analytics, transaction monitoring, 
        and financial management tools powered by Ethereum.
      </p>
      <div className="p-4 border border-gold/30 rounded-lg bg-secondary/30 text-sm text-muted-foreground max-w-md">
        <p className="mb-2">🔐 Your private keys never leave your device</p>
        <p className="mb-2">📊 Real-time transaction monitoring</p>
        <p>💰 Advanced portfolio management tools</p>
      </div>
    </div>
  );
};

export default WelcomeSection;
