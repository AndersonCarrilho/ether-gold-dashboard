
import QuickActionsCard from "./QuickActionsCard";
import NetworkHealthCard from "./NetworkHealthCard";
import GasCard from "./GasCard";

const DashboardActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <QuickActionsCard />
      <NetworkHealthCard />
      <GasCard />
    </div>
  );
};

export default DashboardActions;
