
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AssetCardProps {
  assetName: string;
  balance: string;
  value: string;
  change: string;
  color: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  assetName,
  balance,
  value,
  change,
  color,
}) => {
  const data = [
    { name: assetName, value: 100 },
  ];

  const COLORS = [color];

  return (
    <Card className="card-hover w-full bg-secondary/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{assetName}</CardTitle>
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{balance}</p>
            <p className="text-xs text-muted-foreground">
              {value} 
              <span className={change.startsWith('-') ? "text-red-500" : "text-green-500"}>
                {" "}({change})
              </span>
            </p>
          </div>
          <div className="h-[60px] w-[60px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={25}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="transparent"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetCard;
