
import { useEthereum } from "@/hooks/use-ethereum";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BackgroundAnimation from "@/components/ui/background-animation";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import ConnectedDashboard from "@/components/dashboard/ConnectedDashboard";

// Mock transaction data
const mockTransactions = [
  {
    hash: "0x7ad5e39f1e40abdcee30d52a367a24481d0aeccfeb4be8dbc99ef347aab61a49",
    type: "send" as const,
    status: "confirmed" as const,
    from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    to: "0x0716a17FBAeE714f1E6aB0f9d59edbC5f09815C0",
    amount: "0.5",
    symbol: "ETH",
    timestamp: "2023-04-28 14:32",
    gasUsed: "21000",
  },
  {
    hash: "0x5ce28b03d7a58baab742e6c54295c74a0e6a114e61d59a78c41c1d5748345e83",
    type: "receive" as const,
    status: "confirmed" as const,
    from: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    amount: "1.2",
    symbol: "ETH",
    timestamp: "2023-04-25 09:17",
    gasUsed: "21000",
  }
];

const Index = () => {
  const { walletState } = useEthereum();
  const { connected } = walletState;
  
  return (
    <DashboardLayout>
      <div className="h-full w-full relative overflow-hidden">
        <BackgroundAnimation>
          <div className="h-full">
            {!connected ? (
              <WelcomeSection />
            ) : (
              <ConnectedDashboard mockTransactions={mockTransactions} />
            )}
          </div>
        </BackgroundAnimation>
      </div>
    </DashboardLayout>
  );
};

export default Index;
