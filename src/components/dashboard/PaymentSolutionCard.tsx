
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ArrowUpRight, Coins } from "lucide-react";

const PaymentSolutionCard = () => {
  return (
    <Card className="border-gold/20 bg-card/60 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-gold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Payment Solutions
        </CardTitle>
        <CardDescription>
          Local & Cross-Border Solutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">Local Operations</h3>
            <p className="text-muted-foreground text-xs">
              Operations in Brazil, Mexico and Latin America with products for gaming, 
              betting, digital content and cryptocurrency exchange industries.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" />
              Cross-Border Payments
            </h3>
            <p className="text-xs text-muted-foreground">
              Extend your business reach with cross-border payments in dollars, euros 
              and, through partners in regulated countries, with stablecoins and USDT.
              No local entity required.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1 flex items-center gap-1">
              <Coins className="h-4 w-4" />
              Payout and USDT
            </h3>
            <p className="text-xs text-muted-foreground">
              Enable direct transfers in local currency or through partners, in regulated 
              countries, send international remittances in USDT with security, speed 
              and transparency.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSolutionCard;
