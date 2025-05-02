import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Activity, Box, Clock, Layers, Zap } from "lucide-react";

interface BlockData {
  number: number;
  hash: string;
  timestamp: string;
  transactions: number;
  gasUsed: string;
}

const BlockchainExplorerCard = () => {
  const [blocks, setBlocks] = useState<BlockData[]>([
    {
      number: 17361451,
      hash: "0x7f5b50b6f9c84a22bf41e84b6af030932e1fd8c77725e1a4194e8c108c3d4181",
      timestamp: new Date(Date.now() - 12000).toLocaleTimeString(),
      transactions: 142,
      gasUsed: "12.3",
    },
    {
      number: 17361450,
      hash: "0x9e8c6f492af84e238039fd945b3c36b83fd24f44d54bd8a1c750cf15af855487",
      timestamp: new Date(Date.now() - 24000).toLocaleTimeString(),
      transactions: 98,
      gasUsed: "9.7",
    },
    {
      number: 17361449,
      hash: "0x1234f93dc34b22a59fe87c9f3bf49b765485632faab987cce16eac54d93ac248",
      timestamp: new Date(Date.now() - 36000).toLocaleTimeString(),
      transactions: 126,
      gasUsed: "11.2",
    },
    {
      number: 17361448,
      hash: "0x76e89ff534ac9df9d5a7c7dd156f2fba72614596be5fe374c1bc3d626ef6312a",
      timestamp: new Date(Date.now() - 48000).toLocaleTimeString(),
      transactions: 87,
      gasUsed: "8.4",
    },
    {
      number: 17361447,
      hash: "0x4c71bd45c19d7d935e3edbe632a9455e71604247b67255d9c5f85f55e7934d65",
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      transactions: 112,
      gasUsed: "10.1",
    },
  ]);

  // Simulate new blocks coming in
  useEffect(() => {
    const timer = setInterval(() => {
      const lastBlock = blocks[0];
      const newBlock: BlockData = {
        number: lastBlock.number + 1,
        hash: `0x${Math.random().toString(16).substring(2, 66)}`,
        timestamp: new Date().toLocaleTimeString(),
        transactions: Math.floor(Math.random() * 150) + 50,
        gasUsed: (Math.random() * 15 + 5).toFixed(1),
      };
      
      setBlocks(prev => [newBlock, ...prev.slice(0, 4)]);
    }, 12000); // New block every ~12 seconds
    
    return () => clearInterval(timer);
  }, [blocks]);

  return (
    <Card className="card-hover h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Layers className="h-4 w-4 mr-2 text-gold" />
          Latest Blocks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[260px] px-4">
          {blocks.map((block, index) => (
            <div 
              key={block.number}
              className={cn(
                "border-b border-border/30 py-3",
                index === 0 && "animate-pulse-gold"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Box className="h-4 w-4 mr-2 text-gold" />
                        <span className="font-medium">#{block.number}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Block {block.number}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {block.timestamp}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Mined at {block.timestamp}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate w-40">
                  {block.hash.substring(0, 10)}...{block.hash.substring(58)}
                </span>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>{block.transactions} txs</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    <span>{block.gasUsed} ETH</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BlockchainExplorerCard;
