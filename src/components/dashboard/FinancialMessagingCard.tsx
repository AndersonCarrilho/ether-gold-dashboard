
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Send, RefreshCw, FileCode2 } from "lucide-react";
import { toast } from "sonner";

interface FinancialMessage {
  id: string;
  type: "MT" | "ISO20022" | "JSON";
  content: string;
  timestamp: string;
}

const FinancialMessagingCard = () => {
  const [messages, setMessages] = useState<FinancialMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const file = event.target.files?.[0];
    
    if (!file) {
      setIsLoading(false);
      return;
    }
    
    // Check if the file extension is supported
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!['fin', 'xml', 'json'].includes(fileExt || '')) {
      toast.error("Unsupported file format. Please upload .fin, .xml, or .json files.");
      setIsLoading(false);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let messageType: "MT" | "ISO20022" | "JSON" = "MT";
        
        // Simple format detection based on content
        if (fileExt === 'xml' || content.trim().startsWith('<?xml')) {
          messageType = "ISO20022";
        } else if (fileExt === 'json' || content.trim().startsWith('{')) {
          messageType = "JSON";
        }
        
        const newMessage: FinancialMessage = {
          id: `msg-${Date.now()}`,
          type: messageType,
          content: content,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [newMessage, ...prev].slice(0, 5)); // Keep only last 5 messages
        toast.success(`${messageType} message loaded successfully`);
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Error reading file. Please try again.");
      }
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      toast.error("Error reading file. Please try again.");
      setIsLoading(false);
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
  };
  
  const convertToERC20 = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    toast.success(`Converting ${message.type} message to ERC-20 format...`);
    
    // Simulate conversion process
    setTimeout(() => {
      toast.success("Message converted to ERC-20 format");
    }, 1500);
  };
  
  const transmitMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    toast.success(`Transmitting ${message.type} message...`);
    
    // Simulate transmission process
    setTimeout(() => {
      toast.success("Message transmitted successfully");
    }, 2000);
  };
  
  return (
    <Card className="border-gold/20 bg-card/60 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-gold flex items-center gap-2">
          <FileCode2 className="h-5 w-5" />
          Financial Messaging
        </CardTitle>
        <CardDescription>
          Process FIN MT, ISO20022, JSON financial messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="fileUpload" className="cursor-pointer">
              <Button variant="outline" className="w-full border-gold/30 hover:border-gold/50" disabled={isLoading}>
                <FileUp className="h-4 w-4 mr-2" />
                {isLoading ? "Processing..." : "Upload FIN/XML/JSON"}
              </Button>
            </label>
            <input 
              id="fileUpload" 
              type="file" 
              accept=".fin,.xml,.json" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>

          <div className="rounded-md border border-border/40 p-2">
            <h3 className="text-sm font-medium mb-2">Loaded Messages</h3>
            {messages.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between bg-background/50 rounded-sm p-1.5 text-xs">
                    <div>
                      <span className="font-medium">{message.type} Message</span>
                      <div className="text-muted-foreground truncate max-w-32">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-gold hover:text-gold-light"
                        onClick={() => convertToERC20(message.id)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-gold hover:text-gold-light"
                        onClick={() => transmitMessage(message.id)}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground py-4">
                No messages loaded yet
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Supports FIN MT, ISO20022 & JSON message formats</p>
            <p>Convert to ETH ERC-20 for blockchain transactions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialMessagingCard;
