
import { Button } from "@/components/ui/button";
import { useEthereum } from "@/hooks/use-ethereum";
import BlockchainMessagingCard from "./BlockchainMessagingCard";
import PaymentSolutionCard from "./PaymentSolutionCard";
import ComplianceCard from "./ComplianceCard";

const WelcomeSection = () => {
  const { connectWallet } = useEthereum();
  
  return (
    <section className="mt-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl font-bold gold-gradient">Welcome to NSSC - EUA Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Connect your wallet to access advanced blockchain analytics, transaction monitoring, and financial management tools powered by Ethereum.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-3xl">
          <div className="bg-card p-4 rounded-lg border border-border flex items-center space-x-3">
            <div className="h-10 w-10 bg-gold/10 rounded-full flex items-center justify-center">
              <span className="text-gold text-xl">🔐</span>
            </div>
            <p className="text-sm text-card-foreground">Your private keys never leave your device</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border flex items-center space-x-3">
            <div className="h-10 w-10 bg-gold/10 rounded-full flex items-center justify-center">
              <span className="text-gold text-xl">📊</span>
            </div>
            <p className="text-sm text-card-foreground">Real-time transaction monitoring</p>
          </div>
          <div className="bg-card p-4 rounded-lg border border-border flex items-center space-x-3">
            <div className="h-10 w-10 bg-gold/10 rounded-full flex items-center justify-center">
              <span className="text-gold text-xl">💰</span>
            </div>
            <p className="text-sm text-card-foreground">Advanced portfolio management tools</p>
          </div>
        </div>
        <Button 
          onClick={connectWallet} 
          className="bg-gold hover:bg-gold/90 text-black font-medium px-6 py-2 mt-4"
        >
          Connect Your Wallet
        </Button>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <BlockchainMessagingCard />
        <ComplianceCard />
        <PaymentSolutionCard />
      </div>
    </section>
  );
};

export default WelcomeSection;
