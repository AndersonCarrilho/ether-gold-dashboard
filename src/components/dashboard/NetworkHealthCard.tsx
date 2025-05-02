
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Wifi, Zap, Server, Database, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NetworkHealthCard = () => {
  const [networkHealth, setNetworkHealth] = useState({
    blockTime: 12.4,
    hashRate: 983.5,
    difficulty: 56782,
    peers: 84,
    alerts: [{
      type: 'info',
      message: 'Ethereum Berlin upgrade scheduled in 3 days'
    }],
    status: 'healthy' as 'healthy' | 'warning' | 'critical'
  });
  
  const [totalNodes, setTotalNodes] = useState(5678);
  const [activeNodes, setActiveNodes] = useState(5432);

  // Simulate changing network conditions
  useEffect(() => {
    const timer = setInterval(() => {
      // Random fluctuations in network health metrics
      setNetworkHealth(prev => ({
        ...prev,
        blockTime: +(prev.blockTime + (Math.random() * 0.4 - 0.2)).toFixed(1),
        hashRate: +(prev.hashRate + (Math.random() * 8 - 4)).toFixed(1),
        difficulty: prev.difficulty + Math.floor(Math.random() * 20 - 10),
        peers: Math.max(60, Math.min(120, prev.peers + Math.floor(Math.random() * 5 - 2))),
        status: Math.random() > 0.95 ? 'warning' : 'healthy'
      }));
      
      setActiveNodes(prev => Math.max(5000, Math.min(5500, prev + Math.floor(Math.random() * 7 - 3))));
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Shield className="h-4 w-4 mr-2 text-gold" />
          Network Health
          <Badge 
            variant="outline" 
            className={`ml-auto ${
              networkHealth.status === 'healthy' ? 'bg-green-500/20 text-green-500' : 
              networkHealth.status === 'warning' ? 'bg-amber-500/20 text-amber-500' :
              'bg-red-500/20 text-red-500'
            }`}
          >
            {networkHealth.status === 'healthy' ? 'Healthy' : 
             networkHealth.status === 'warning' ? 'Warning' : 'Critical'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col p-2 bg-secondary/30 rounded-md">
                  <div className="flex items-center mb-1">
                    <Wifi className="h-3 w-3 mr-1 text-gold" />
                    <span className="text-xs text-muted-foreground">Block Time</span>
                  </div>
                  <span className="text-sm font-semibold">{networkHealth.blockTime} s</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Average time between blocks</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col p-2 bg-secondary/30 rounded-md">
                  <div className="flex items-center mb-1">
                    <Zap className="h-3 w-3 mr-1 text-gold" />
                    <span className="text-xs text-muted-foreground">Hash Rate</span>
                  </div>
                  <span className="text-sm font-semibold">{networkHealth.hashRate} TH/s</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Network hash power</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col p-2 bg-secondary/30 rounded-md">
                  <div className="flex items-center mb-1">
                    <Server className="h-3 w-3 mr-1 text-gold" />
                    <span className="text-xs text-muted-foreground">Peers</span>
                  </div>
                  <span className="text-sm font-semibold">{networkHealth.peers}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Connected network peers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col p-2 bg-secondary/30 rounded-md">
                  <div className="flex items-center mb-1">
                    <Database className="h-3 w-3 mr-1 text-gold" />
                    <span className="text-xs text-muted-foreground">Difficulty</span>
                  </div>
                  <span className="text-sm font-semibold">{networkHealth.difficulty}T</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mining difficulty</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-muted-foreground">Active Nodes</span>
            <span className="font-medium">{activeNodes} / {totalNodes}</span>
          </div>
          <Progress value={(activeNodes / totalNodes) * 100} className="h-1.5" />
        </div>
        
        {networkHealth.alerts.map((alert, index) => (
          <div 
            key={index}
            className={`text-xs p-2 rounded flex items-start ${
              alert.type === 'info' ? 'bg-blue-500/10 text-blue-500' :
              alert.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
              'bg-red-500/10 text-red-500'
            }`}
          >
            <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <span>{alert.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NetworkHealthCard;
