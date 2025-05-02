
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, BarChart } from "lucide-react";

interface CryptoData {
  name: string;
  price: number;
  change24h: number;
  chartData: { time: string; price: number }[];
}

const MarketDataCard = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([
    {
      name: "Ethereum",
      price: 3245.67,
      change24h: 2.4,
      chartData: [
        { time: "00:00", price: 3180 },
        { time: "04:00", price: 3145 },
        { time: "08:00", price: 3210 },
        { time: "12:00", price: 3190 },
        { time: "16:00", price: 3240 },
        { time: "20:00", price: 3235 },
        { time: "Now", price: 3245 },
      ],
    },
    {
      name: "Bitcoin",
      price: 56789.12,
      change24h: -1.2,
      chartData: [
        { time: "00:00", price: 57400 },
        { time: "04:00", price: 57200 },
        { time: "08:00", price: 56950 },
        { time: "12:00", price: 56700 },
        { time: "16:00", price: 56800 },
        { time: "20:00", price: 56650 },
        { time: "Now", price: 56789 },
      ],
    },
    {
      name: "Solana",
      price: 105.34,
      change24h: 5.7,
      chartData: [
        { time: "00:00", price: 99.5 },
        { time: "04:00", price: 100.2 },
        { time: "08:00", price: 102.1 },
        { time: "12:00", price: 103.8 },
        { time: "16:00", price: 104.5 },
        { time: "20:00", price: 105.0 },
        { time: "Now", price: 105.3 },
      ],
    },
  ]);

  // Simulate live price updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCryptoData(prevData => {
        return prevData.map(crypto => {
          // Random price change
          const priceChange = crypto.price * (Math.random() * 0.01 - 0.005);
          const newPrice = +(crypto.price + priceChange).toFixed(2);
          
          // Update chart data
          const newChartData = [...crypto.chartData.slice(1)];
          newChartData.push({ time: "Now", price: newPrice });
          
          // Recalculate 24h change
          const oldPrice = crypto.chartData[0].price;
          const newChange = +((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
          
          return {
            ...crypto,
            price: newPrice,
            change24h: newChange,
            chartData: newChartData
          };
        });
      });
    }, 15000); // Update every 15 seconds
    
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <BarChart className="h-4 w-4 mr-2 text-gold" />
          Market Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cryptoData.map((crypto, index) => (
            <div key={crypto.name} className={index < cryptoData.length - 1 ? "pb-4 border-b border-border/30" : ""}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{crypto.name}</span>
                <div className="flex items-center">
                  <span className="font-bold">${crypto.price.toLocaleString()}</span>
                  <span className={`ml-2 text-xs flex items-center ${
                    crypto.change24h >= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {crypto.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {crypto.change24h >= 0 ? "+" : ""}{crypto.change24h}%
                  </span>
                </div>
              </div>
              <div className="h-[60px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={crypto.chartData}>
                    <defs>
                      <linearGradient id={`gradient-${crypto.name}`} x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={crypto.change24h >= 0 ? "#10B981" : "#EF4444"} 
                          stopOpacity={0.8}
                        />
                        <stop 
                          offset="95%" 
                          stopColor={crypto.change24h >= 0 ? "#10B981" : "#EF4444"} 
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      tick={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={['dataMin', 'dataMax']} 
                      tick={false} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background/90 border border-border p-2 rounded text-xs">
                              <p>${payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={crypto.change24h >= 0 ? "#10B981" : "#EF4444"}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#gradient-${crypto.name})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDataCard;
