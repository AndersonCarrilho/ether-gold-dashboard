
import { useState } from "react";
import SystemInfoCard from "./SystemInfoCard";
import NetworkStatsCard from "./NetworkStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import TransactionRow from "./TransactionRow";

interface SystemOverviewProps {
  transactions: any[];
  onViewReceipt: (tx: any) => void;
}

const SystemOverview = ({ transactions, onViewReceipt }: SystemOverviewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
      <SystemInfoCard />
      <NetworkStatsCard />
      
      <Card className="card-hover lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-gold hover:text-gold-light"
            onClick={() => window.location.href = "/transactions"}
          >
            View All
            <Activity className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.hash}
                {...tx}
                onViewReceipt={() => onViewReceipt(tx)}
              />
            ))}
            {transactions.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No recent transactions
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;
