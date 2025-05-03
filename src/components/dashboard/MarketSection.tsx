
import MarketDataCard from "./MarketDataCard";
import BlockchainExplorerCard from "./BlockchainExplorerCard";
import NeuralNetworkCard from "./NeuralNetworkCard";
import FinancialMessagingCard from "./FinancialMessagingCard";
import BlockchainMessagingCard from "./BlockchainMessagingCard";
import PaymentSolutionCard from "./PaymentSolutionCard";
import OperationalStatsCard from "./OperationalStatsCard";
import ComplianceCard from "./ComplianceCard";

const MarketSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <MarketDataCard />
      <BlockchainExplorerCard />
      <NeuralNetworkCard />
      <BlockchainMessagingCard />
      <FinancialMessagingCard />
      <PaymentSolutionCard />
      <OperationalStatsCard />
      <ComplianceCard />
    </div>
  );
};

export default MarketSection;
