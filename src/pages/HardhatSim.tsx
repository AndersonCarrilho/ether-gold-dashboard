
import DashboardLayout from "@/components/layout/DashboardLayout";
import WalletGenerator from "@/components/hardhat/WalletGenerator";
import WalletList from "@/components/hardhat/WalletList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HardDrive, Network } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const HardhatSim = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold gold-gradient">Hardhat Simulator</h1>
        
        <Alert className="mb-4 border-gold/20 bg-gold/5">
          <HardDrive className="h-4 w-4 text-gold" />
          <AlertTitle>Simulated Environment</AlertTitle>
          <AlertDescription>
            This is a simulated Hardhat-like environment running in your browser. 
            Generate test wallets with ETH and swap them to USDT using the original token ABI.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="wallets" className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
            <TabsTrigger value="wallets">Wallet Generator</TabsTrigger>
            <TabsTrigger value="networks">Network Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wallets" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <WalletGenerator />
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Network className="mr-2 h-5 w-5 text-gold" />
                    ETH to USDT Simulator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The simulation uses the following exchange rates:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>1 ETH = 2,000 USDT</li>
                    <li>Transactions are simulated with random hashes</li>
                    <li>Gas fees are not deducted in this simulation</li>
                  </ul>
                  <div className="mt-4 p-3 bg-secondary/50 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      In a real Hardhat environment, these transactions would interact with locally deployed contracts
                      or forked mainnet state. This simulator provides a similar experience directly in your browser.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <WalletList />
          </TabsContent>
          
          <TabsContent value="networks">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Available Networks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Network</TableHead>
                          <TableHead>Chain ID</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>RPC URL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Ethereum Mainnet</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>ETH</TableCell>
                          <TableCell className="font-mono text-xs">https://mainnet.infura.io/v3/...</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Goerli Testnet</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell>ETH</TableCell>
                          <TableCell className="font-mono text-xs">https://goerli.infura.io/v3/...</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Polygon Mainnet</TableCell>
                          <TableCell>137</TableCell>
                          <TableCell>MATIC</TableCell>
                          <TableCell className="font-mono text-xs">https://polygon-rpc.com</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    In a full implementation, networks would be fetched dynamically from chainlist.org/rpcs.json.
                    This simulator uses a predefined set of networks for demonstration purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// Adicionar o componente de Table que está sendo usado na página
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default HardhatSim;
