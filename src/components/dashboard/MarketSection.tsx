
import MarketDataCard from "./MarketDataCard";
import BlockchainExplorerCard from "./BlockchainExplorerCard";

const MarketSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <MarketDataCard />
      <BlockchainExplorerCard />
    </div>
  );
};

export default MarketSection;
