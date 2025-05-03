
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Award } from "lucide-react";

const OperationalStatsCard = () => {
  return (
    <Card className="border-gold/20 bg-card/60 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-gold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Operational Excellence
        </CardTitle>
        <CardDescription>
          Tailored Solutions for Exchanges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">Exclusive Exchange Solutions</h3>
            <p className="text-muted-foreground text-xs">
              Differentiated and specific products for cryptocurrency exchanges 
              operating in Brazil, with a focus on innovation and efficiency.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-1 flex items-center gap-1">
              <Award className="h-4 w-4" />
              Proven Operational Resilience
            </h3>
            <p className="text-xs text-muted-foreground">
              With over 50 million transactions processed, our infrastructure 
              ensures operational resilience and high reliability, meeting the 
              demands of large transaction volumes in the crypto industry.
            </p>
          </div>
          
          <div className="bg-background/50 p-2 rounded-md">
            <p className="text-xs italic">
              "Infrastructure designed for large-scale crypto operations, with proven 
              resilience across millions of transactions."
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationalStatsCard;
