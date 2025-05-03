
import MarketDataCard from "./MarketDataCard";
import BlockchainExplorerCard from "./BlockchainExplorerCard";
import NeuralNetworkCard from "./NeuralNetworkCard";
import FinancialMessagingCard from "./FinancialMessagingCard";
import BlockchainMessagingCard from "./BlockchainMessagingCard";

const MarketSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <MarketDataCard />
      <BlockchainExplorerCard />
      <NeuralNetworkCard />
      <BlockchainMessagingCard />
      <FinancialMessagingCard />
    </div>
  );
};

export default MarketSection;
