
import { useEffect, useState } from "react";
import { useEthereum } from "@/hooks/use-ethereum";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BackgroundAnimation from "@/components/ui/background-animation";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import ConnectedDashboard from "@/components/dashboard/ConnectedDashboard";
import MarketSection from "@/components/dashboard/MarketSection";
import { EtherscanService, EtherscanTransaction } from "@/services/etherscan";

const Index = () => {
  const { walletState } = useEthereum();
  const { connected, address } = walletState;

  const [realTransactions, setRealTransactions] = useState<EtherscanTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && address) {
      setIsLoadingTransactions(true);
      setTransactionError(null);
      // TODO: Replace 'YOUR_ETHERSCAN_API_KEY' with your actual Etherscan API key
      // or use an environment variable like import.meta.env.VITE_ETHERSCAN_API_KEY
      const etherscanService = new EtherscanService({ apiKey: 'YOUR_ETHERSCAN_API_KEY' });

      etherscanService.getTransactionsForAddress(address)
        .then(transactions => {
          setRealTransactions(transactions);
          setIsLoadingTransactions(false);
        })
        .catch(error => {
          console.error("Failed to fetch transactions:", error);
          setTransactionError("Failed to load transaction history. Please try again later.");
          setIsLoadingTransactions(false);
        });
    } else {
      // Clear transactions if wallet disconnects or address is not available
      setRealTransactions([]);
    }
  }, [connected, address]);

  return (
    <DashboardLayout>
      <div className="h-full w-full relative overflow-hidden">
        <BackgroundAnimation>
          <div className="h-full overflow-y-auto pb-6">
            <div className="container mx-auto">
              {!connected ? (
                <>
                  <WelcomeSection />
                  <div className="mt-8">
                    <MarketSection />
                  </div>
                </>
              ) : (
                <>
                  {isLoadingTransactions && <p className="text-center text-white">Loading transactions...</p>}
                  {transactionError && <p className="text-center text-red-500">{transactionError}</p>}
                  {!isLoadingTransactions && !transactionError && (
                    <ConnectedDashboard transactions={realTransactions} />
                  )}
                </>
              )}
            </div>
          </div>
        </BackgroundAnimation>
      </div>
    </DashboardLayout>
  );
};

export default Index;
