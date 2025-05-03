
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users } from "lucide-react";

const ComplianceCard = () => {
  return (
    <Card className="border-gold/20 bg-card/60 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-gold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Regulatory Compliance
        </CardTitle>
        <CardDescription>
          Authorized Payment Institution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">Central Bank Authorization</h3>
            <p className="text-muted-foreground text-xs">
              A payment institution authorized by the Central Bank of Brazil, with direct 
              participation in the Pix system, ensuring fast, secure and integrated 
              transactions with the national market.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Expert Support and KYC
            </h3>
            <p className="text-xs text-muted-foreground">
              Advanced KYC processes, CPF validation, and 24/7 expert service, 
              ensuring regulatory compliance and ongoing support for your 
              exchange's operations.
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs">System Status: Operational</span>
            </div>
            <span className="text-xs text-gold">99.99% Uptime</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceCard;
