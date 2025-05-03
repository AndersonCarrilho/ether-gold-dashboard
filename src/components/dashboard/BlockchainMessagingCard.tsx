
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const BlockchainMessagingCard = () => {
  return (
    <Card className="border-gold/20 bg-card/60 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-gold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Blockchain Messaging
        </CardTitle>
        <CardDescription>
          Financial Messaging Solutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">FIN MT & ISO20022 Integration</h3>
            <p className="text-muted-foreground text-xs">
              Seamlessly convert traditional banking messages to blockchain-compatible formats.
              Our system supports FIN MT, ISO20022, and JSON formats.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Key Features</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• SWIFT MT & ISO20022 message parsing</li>
              <li>• ERC-20 token standard conversion</li>
              <li>• Multi-format messaging support</li>
              <li>• Banking-grade security standards</li>
            </ul>
          </div>
          
          <div className="bg-background/50 p-2 rounded-md">
            <p className="text-xs italic">
              "Bridge the gap between traditional finance and blockchain technology with our 
              advanced messaging solutions that maintain compliance while enabling innovation."
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainMessagingCard;
