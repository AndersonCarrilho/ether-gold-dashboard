
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Signal } from "lucide-react";

const NetworkStatsCard = () => {
  const [networkData, setNetworkData] = useState([
    { time: '00:00', txCount: 85, gasPrice: 21 },
    { time: '04:00', txCount: 40, gasPrice: 18 },
    { time: '08:00', txCount: 65, gasPrice: 24 },
    { time: '12:00', txCount: 95, gasPrice: 28 },
    { time: '16:00', txCount: 110, gasPrice: 35 },
    { time: '20:00', txCount: 75, gasPrice: 30 },
    { time: 'Now', txCount: 90, gasPrice: 26 },
  ]);

  // Simulate live data updates
  useEffect(() => {
    const timer = setInterval(() => {
      setNetworkData(prev => {
        const newData = [...prev];
        // Update the latest data point
        const lastIndex = newData.length - 1;
        newData[lastIndex] = {
          ...newData[lastIndex],
          txCount: Math.max(30, Math.min(150, newData[lastIndex].txCount + Math.floor(Math.random() * 20) - 10)),
          gasPrice: Math.max(15, Math.min(50, newData[lastIndex].gasPrice + Math.floor(Math.random() * 6) - 3)),
        };
        return newData;
      });
    }, 8000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="card-hover h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <Signal className="h-4 w-4 mr-2" />
          Network Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={networkData}>
              <defs>
                <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#855CF8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#855CF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#888', fontSize: 12 }}
                axisLine={{ stroke: '#333' }}
              />
              <YAxis 
                tick={{ fill: '#888', fontSize: 12 }}
                axisLine={{ stroke: '#333' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#222', 
                  borderColor: '#444',
                  color: '#fff'
                }} 
              />
              <Area
                type="monotone"
                dataKey="txCount"
                name="Tx Count"
                stroke="#D4AF37"
                fillOpacity={1}
                fill="url(#colorTx)"
              />
              <Area
                type="monotone"
                dataKey="gasPrice"
                name="Gas (Gwei)"
                stroke="#855CF8"
                fillOpacity={1}
                fill="url(#colorGas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between pt-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-gold mr-1 rounded-full"></span>
            Transactions
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-[#855CF8] mr-1 rounded-full"></span>
            Gas Price (Gwei)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkStatsCard;
