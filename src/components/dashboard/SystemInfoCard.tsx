
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, Activity, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const SystemInfoCard = () => {
  const [systemInfo, setSystemInfo] = useState({
    nodes: { active: 28, total: 35 },
    storage: { used: 78, total: 100 },
    cpu: { used: 56, total: 100 },
    alerts: 2,
  });

  // Simulating real-time data updates
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemInfo(prev => ({
        nodes: { 
          active: Math.min(prev.nodes.total, Math.max(20, prev.nodes.active + Math.floor(Math.random() * 3) - 1)), 
          total: prev.nodes.total 
        },
        storage: { 
          used: Math.min(100, Math.max(50, prev.storage.used + Math.floor(Math.random() * 5) - 2)), 
          total: prev.storage.total 
        },
        cpu: { 
          used: Math.min(100, Math.max(30, prev.cpu.used + Math.floor(Math.random() * 10) - 5)), 
          total: prev.cpu.total 
        },
        alerts: Math.max(0, prev.alerts + (Math.random() > 0.9 ? 1 : Math.random() > 0.8 ? -1 : 0)),
      }));
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="flex items-center">
                <Cpu className="h-4 w-4 mr-1" />
                CPU Usage
              </span>
              <span className={cn(
                systemInfo.cpu.used > 90 
                  ? "text-red-500" 
                  : systemInfo.cpu.used > 70 
                  ? "text-yellow-500" 
                  : "text-green-500"
              )}>
                {systemInfo.cpu.used}%
              </span>
            </div>
            <Progress 
              value={systemInfo.cpu.used} 
              className={cn(
                "h-2",
                systemInfo.cpu.used > 90 
                  ? "bg-secondary [&>div]:bg-red-500" 
                  : systemInfo.cpu.used > 70 
                  ? "bg-secondary [&>div]:bg-yellow-500" 
                  : "bg-secondary [&>div]:bg-green-500"
              )}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="flex items-center">
                <HardDrive className="h-4 w-4 mr-1" />
                Storage
              </span>
              <span>{systemInfo.storage.used} / {systemInfo.storage.total} GB</span>
            </div>
            <Progress 
              value={systemInfo.storage.used} 
              className="h-2 bg-secondary [&>div]:bg-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-md">
              <div className="text-xl font-bold gold-gradient">
                {systemInfo.nodes.active}/{systemInfo.nodes.total}
              </div>
              <div className="text-xs text-muted-foreground">Active Nodes</div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-secondary/30 rounded-md">
              <div className={cn(
                "text-xl font-bold",
                systemInfo.alerts > 0 ? "text-red-500 animate-pulse" : "gold-gradient"
              )}>
                {systemInfo.alerts}
              </div>
              <div className="text-xs text-muted-foreground flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                System Alerts
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemInfoCard;
