import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GasLevel {
  level: string;
  price: number;
  time: string;
  color: string;
}

const GasCard = () => {
  const [gasLevels, setGasLevels] = useState<GasLevel[]>([
    { level: "Fast", price: 25, time: "< 30 sec", color: "text-green-500" },
    { level: "Normal", price: 20, time: "< 2 min", color: "text-gold" },
    { level: "Slow", price: 15, time: "5+ min", color: "text-red-500" },
  ]);
  
  const [currentLevel, setCurrentLevel] = useState<string>("Normal");
  
  // Simulate gas price fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setGasLevels(prev => {
        return prev.map(level => {
          // Random fluctuation within reasonable ranges
          const fluctuation = Math.floor(Math.random() * 5) - 2;
          let newPrice = level.price + fluctuation;
          
          // Keep prices in reasonable range and maintain ordering
          if (level.level === "Fast") {
            newPrice = Math.max(23, Math.min(35, newPrice));
          } else if (level.level === "Normal") {
            newPrice = Math.max(18, Math.min(25, newPrice));
          } else {
            newPrice = Math.max(12, Math.min(18, newPrice));
          }
          
          return {
            ...level,
            price: newPrice
          };
        });
      });
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <Gauge className="h-4 w-4 mr-2" />
          Gas Prices (Gwei)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {gasLevels.map((gas) => (
            <TooltipProvider key={gas.level}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md cursor-pointer transition-all",
                      gas.level === currentLevel ? "bg-secondary/80" : "bg-secondary/30 hover:bg-secondary/50"
                    )}
                    onClick={() => setCurrentLevel(gas.level)}
                  >
                    <div className="flex items-center">
                      <div className={cn("w-2 h-2 rounded-full mr-2", gas.color)} />
                      <span>{gas.level}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn("font-bold", gas.color)}>{gas.price}</span>
                      <span className="text-xs text-muted-foreground">{gas.time}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to select {gas.level} gas price</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Selected: <span className="font-semibold gold-gradient">{currentLevel}</span> transaction speed</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GasCard;
