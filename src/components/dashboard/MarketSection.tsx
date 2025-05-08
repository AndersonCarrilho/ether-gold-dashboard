
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown } from "lucide-react";

const MarketSection = () => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">Market Overview</h2>
        <p className="text-sm text-muted-foreground">NSSC - EUA Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH Price</CardTitle>
            <div className="rounded-full bg-green-500/20 p-1 text-green-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,754.12</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ChevronUp className="h-3 w-3" />
                2.5%
              </span>
              in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gas (Gwei)</CardTitle>
            <div className="rounded-full bg-amber-500/20 p-1 text-amber-500">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">21</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-amber-500 flex items-center mr-1">
                <ChevronDown className="h-3 w-3" />
                5.2%
              </span>
              in last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <div className="rounded-full bg-green-500/20 p-1 text-green-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$437B</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ChevronUp className="h-3 w-3" />
                1.2%
              </span>
              in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <div className="rounded-full bg-green-500/20 p-1 text-green-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$22.4B</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ChevronUp className="h-3 w-3" />
                8.7%
              </span>
              in last 24h
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MarketSection;
