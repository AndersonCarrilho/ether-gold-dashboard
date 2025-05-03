
import MarketDataCard from "./MarketDataCard";
import BlockchainExplorerCard from "./BlockchainExplorerCard";
import NeuralNetworkCard from "./NeuralNetworkCard";

const MarketSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <MarketDataCard />
      <BlockchainExplorerCard />
      <NeuralNetworkCard />
    </div>
  );
};

export default MarketSection;
