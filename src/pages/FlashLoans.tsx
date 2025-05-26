import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown, Loader2 } from "lucide-react"; // Added Loader2
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select
import { ethers, BigNumber } from "ethers";
import { useEthereum } from "@/hooks/use-ethereum";
import { toast } from "sonner";
import { getUniswapV2Price, getUniswapV3Price } from "@/services/uniswapService";

// ABI for the FlashLoanProxy's executeLoan function
const flashLoanProxyAbi = [{ 
  "inputs": [ 
    { "internalType": "address", "name": "provider", "type": "address" }, 
    { "internalType": "address", "name": "token", "type": "address" }, 
    { "internalType": "uint256", "name": "amount", "type": "uint256" } 
  ], 
  "name": "executeLoan", 
  "outputs": [], 
  "stateMutability": "nonpayable", 
  "type": "function" 
}];

const FlashLoansPage = () => {
  const { provider, signer, address: userAddress } = useEthereum();

  // State for Flash Loan Execution
  const [proxyAddress, setProxyAddress] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("18"); 

  const [preparedTx, setPreparedTx] = useState<{ to: string; data: string; value: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for Flash Loan Strategy Simulator
  const [simBorrowTokenSymbol, setSimBorrowTokenSymbol] = useState("USDC");
  const [simBorrowTokenAddress, setSimBorrowTokenAddress] = useState(""); // New
  const [simBorrowAmount, setSimBorrowAmount] = useState("1000");
  const [simTokenADecimals, setSimTokenADecimals] = useState("6");
  
  const [simDex1Type, setSimDex1Type] = useState("uniswapV2"); // New: "uniswapV2" or "uniswapV3"
  const [simV3PoolFeeDex1, setSimV3PoolFeeDex1] = useState("3000"); // New: e.g., 500, 3000, 10000
  const [simTokenBSymbol, setSimTokenBSymbol] = useState("WETH");
  const [simTokenBAddress, setSimTokenBAddress] = useState(""); // New
  const [simTokenBDecimals, setSimTokenBDecimals] = useState("18");

  const [simDex2Type, setSimDex2Type] = useState("uniswapV2"); // New: "uniswapV2" or "uniswapV3"
  const [simV3PoolFeeDex2, setSimV3PoolFeeDex2] = useState("3000"); // New
  
  const [simFlashLoanFeePercentage, setSimFlashLoanFeePercentage] = useState("0.09");
  
  const [fetchedAmountTokenB, setFetchedAmountTokenB] = useState<BigNumber | null>(null); // New
  const [fetchedFinalAmountTokenA, setFetchedFinalAmountTokenA] = useState<BigNumber | null>(null); // New
  const [isFetchingPrices, setIsFetchingPrices] = useState(false); // New
  const [priceFetchingError, setPriceFetchingError] = useState<string | null>(null); // New
  
  const [simulationResult, setSimulationResult] = useState<{ // Old simulation result based on manual prices
    amountTokenB: number;
    finalAmountTokenA: number;
    grossProfit: number;
    loanFee: number;
    netProfit: number;
  } | null>(null);
  const [simError, setSimError] = useState<string | null>(null); // For general simulation errors


  const handlePrepareTransaction = () => {
    setError(null);
    setPreparedTx(null);
    setTxHash(null);
    setTxStatus(null);

    if (!proxyAddress || !providerAddress || !tokenAddress || !loanAmount || !tokenDecimals) {
      setError("All input fields are required.");
      toast.error("Validation Error", { description: "All input fields are required." });
      return;
    }

    if (!ethers.utils.isAddress(proxyAddress) || !ethers.utils.isAddress(providerAddress) || !ethers.utils.isAddress(tokenAddress)) {
      setError("One or more addresses are invalid.");
      toast.error("Validation Error", { description: "Please provide valid Ethereum addresses." });
      return;
    }
    
    try {
      const amountInWei = ethers.utils.parseUnits(loanAmount, parseInt(tokenDecimals));
      const iface = new ethers.utils.Interface(flashLoanProxyAbi);
      const encodedData = iface.encodeFunctionData("executeLoan", [
        providerAddress,
        tokenAddress,
        amountInWei,
      ]);

      setPreparedTx({
        to: proxyAddress,
        data: encodedData,
        value: "0", // executeLoan is non-payable
      });
      toast.success("Transaction Prepared", { description: "Review details and execute."});
    } catch (e: any) {
      console.error("Error preparing transaction:", e);
      setError(`Preparation Error: ${e.message || "Unknown error"}`);
      toast.error("Preparation Error", { description: e.message || "Could not prepare transaction." });
    }
  };

  const handleExecuteTransaction = async () => {
    if (!preparedTx) {
      setError("No transaction prepared.");
      toast.error("Execution Error", { description: "No transaction prepared." });
      return;
    }
    if (!signer || !provider || !userAddress) {
      setError("Wallet not connected or provider not available.");
      toast.error("Wallet Error", { description: "Please connect your wallet." });
      return;
    }

    setError(null);
    setTxHash(null);
    setTxStatus("Pending");
    toast.loading("Sending Transaction...", { id: "flashloan-tx" });

    try {
      const txRequest = {
        to: preparedTx.to,
        data: preparedTx.data,
        value: preparedTx.value,
      };
      
      const txResponse = await signer.sendTransaction(txRequest);
      setTxHash(txResponse.hash);
      toast.success("Transaction Sent!", { id: "flashloan-tx", description: `Hash: ${txResponse.hash}` });
      setTxStatus("Waiting for confirmation...");

      const receipt = await provider.waitForTransaction(txResponse.hash);
      if (receipt.status === 1) {
        setTxStatus("Success");
        toast.success("Flash Loan Executed!", { id: "flashloan-tx", description: `Transaction confirmed in block ${receipt.blockNumber}` });
      } else {
        setTxStatus("Error: Transaction Reverted");
        setError(`Transaction Reverted. Hash: ${txResponse.hash}`);
        toast.error("Transaction Reverted", { id: "flashloan-tx", description: `Hash: ${txResponse.hash}` });
      }
    } catch (e: any) {
      console.error("Error executing transaction:", e);
      const errorMessage = e.reason || e.message || "Unknown execution error";
      setError(`Execution Error: ${errorMessage}`);
      setTxStatus("Error");
      toast.error("Execution Error", { id: "flashloan-tx", description: errorMessage });
    }
  };

  // This is the old simulation logic based on manual price inputs.
  // It will be updated/replaced in the next step to use fetched prices.
  const handleManualSimulateStrategy = () => {
    setSimError(null);
    setSimulationResult(null);
    setPriceFetchingError(null);
    setFetchedAmountTokenB(null);
    setFetchedFinalAmountTokenA(null);

    // For now, this function will just demonstrate the old calculation if needed,
    // or can be left as a placeholder. The main button will call handleFetchAndSimulate.
    // For the purpose of this step, we'll keep its old logic to show it's distinct.
    const inputs = [
      simBorrowAmount, simTokenADecimals, /*simTokenBPriceOnDex1 (removed)*/
      simTokenBDecimals, /*simTokenAPriceOnDex2 (removed)*/ simFlashLoanFeePercentage,
      simBorrowTokenSymbol, simTokenBSymbol
    ];

    if (inputs.some(input => typeof input === 'string' && input.trim() === "")) {
      setSimError("Core simulator input fields are required (amount, decimals, symbols, fee).");
      toast.error("Simulator Error", { description: "Core simulator input fields are required." });
      return;
    }
    
    // This part is just for placeholder, actual simulation will use fetched prices
    toast.info("Manual Simulation", { description: "This is a placeholder for manual simulation logic if prices were manually entered. Real simulation will use fetched prices."});
    // Example:
    // const borrowAmount = parseFloat(simBorrowAmount);
    // const feePercentage = parseFloat(simFlashLoanFeePercentage);
    // const loanFee = borrowAmount * (feePercentage / 100);
    // setSimulationResult({ amountTokenB: 0, finalAmountTokenA: 0, grossProfit: 0, loanFee, netProfit: -loanFee });

  };

  const handleFetchAndSimulate = async () => {
    setIsFetchingPrices(true);
    setPriceFetchingError(null);
    setFetchedAmountTokenB(null);
    setFetchedFinalAmountTokenA(null);
    setSimulationResult(null);
    setSimError(null); // Clear general simulation errors as well

    if (!provider) {
      toast.error("Wallet not connected", { description: "Please connect your wallet to fetch live prices." });
      setPriceFetchingError("Wallet not connected.");
      setIsFetchingPrices(false);
      return;
    }

    // --- Input Validation ---
    const requiredFields = {
      simBorrowTokenAddress, simBorrowAmount, simTokenADecimals,
      simTokenBAddress, simTokenBDecimals,
      simDex1Type, simDex2Type, simFlashLoanFeePercentage
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || String(value).trim() === "") {
        const errorMessage = `Missing input: ${key.replace('sim', '').replace(/([A-Z])/g, ' $1').trim()}`;
        toast.error("Validation Error", { description: errorMessage });
        setPriceFetchingError(errorMessage);
        setIsFetchingPrices(false);
        return;
      }
    }
    if (!ethers.utils.isAddress(simBorrowTokenAddress) || !ethers.utils.isAddress(simTokenBAddress)) {
      toast.error("Validation Error", { description: "Invalid Token A or Token B address." });
      setPriceFetchingError("Invalid Token A or Token B address.");
      setIsFetchingPrices(false);
      return;
    }
    if (simDex1Type === 'uniswapV3' && (!simV3PoolFeeDex1 || isNaN(parseInt(simV3PoolFeeDex1)))) {
      toast.error("Validation Error", { description: "DEX 1 V3 Pool Fee is invalid." });
      setPriceFetchingError("DEX 1 V3 Pool Fee is invalid.");
      setIsFetchingPrices(false);
      return;
    }
    if (simDex2Type === 'uniswapV3' && (!simV3PoolFeeDex2 || isNaN(parseInt(simV3PoolFeeDex2)))) {
      toast.error("Validation Error", { description: "DEX 2 V3 Pool Fee is invalid." });
      setPriceFetchingError("DEX 2 V3 Pool Fee is invalid.");
      setIsFetchingPrices(false);
      return;
    }
    // --- End Input Validation ---

    let amountTokenA_BN: BigNumber;
    try {
      amountTokenA_BN = ethers.utils.parseUnits(simBorrowAmount, parseInt(simTokenADecimals));
    } catch (e) {
      toast.error("Input Error", { description: "Invalid Borrow Amount or Token A Decimals." });
      setPriceFetchingError("Invalid Borrow Amount or Token A Decimals.");
      setIsFetchingPrices(false);
      return;
    }

    let receivedAmountTokenB_BN: BigNumber;
    try {
      toast.info("Fetching price on DEX 1...", { id: "dex1-fetch" });
      if (simDex1Type === 'uniswapV2') {
        receivedAmountTokenB_BN = await getUniswapV2Price(simBorrowTokenAddress, simTokenBAddress, amountTokenA_BN, provider);
      } else { // uniswapV3
        receivedAmountTokenB_BN = await getUniswapV3Price(simBorrowTokenAddress, simTokenBAddress, amountTokenA_BN, parseInt(simV3PoolFeeDex1), provider);
      }
      setFetchedAmountTokenB(receivedAmountTokenB_BN);
      toast.success("Price from DEX 1 Fetched!", { id: "dex1-fetch", description: `Received ${ethers.utils.formatUnits(receivedAmountTokenB_BN, simTokenBDecimals)} ${simTokenBSymbol}`});
    } catch (e: any) {
      console.error("Error fetching price from DEX 1:", e);
      const errMsg = `Error fetching price from DEX 1: ${e.message}`;
      setPriceFetchingError(errMsg);
      toast.error("DEX 1 Error", { id: "dex1-fetch", description: errMsg });
      setIsFetchingPrices(false);
      return;
    }

    if (!receivedAmountTokenB_BN || receivedAmountTokenB_BN.isZero()) {
      const errMsg = "Could not get a valid amount from Step 1 (DEX 1) to proceed.";
      setPriceFetchingError(errMsg);
      toast.error("DEX 1 Result Error", { description: errMsg });
      setIsFetchingPrices(false);
      return;
    }

    let finalAmountTokenA_BN: BigNumber;
    try {
      toast.info("Fetching price on DEX 2...", { id: "dex2-fetch" });
      if (simDex2Type === 'uniswapV2') {
        finalAmountTokenA_BN = await getUniswapV2Price(simTokenBAddress, simBorrowTokenAddress, receivedAmountTokenB_BN, provider);
      } else { // uniswapV3
        finalAmountTokenA_BN = await getUniswapV3Price(simTokenBAddress, simBorrowTokenAddress, receivedAmountTokenB_BN, parseInt(simV3PoolFeeDex2), provider);
      }
      setFetchedFinalAmountTokenA(finalAmountTokenA_BN);
      toast.success("Price from DEX 2 Fetched!", { id: "dex2-fetch", description: `Received ${ethers.utils.formatUnits(finalAmountTokenA_BN, simTokenADecimals)} ${simBorrowTokenSymbol}` });
    } catch (e: any) {
      console.error("Error fetching price from DEX 2:", e);
      const errMsg = `Error fetching price from DEX 2: ${e.message}`;
      setPriceFetchingError(errMsg);
      toast.error("DEX 2 Error", { id: "dex2-fetch", description: errMsg });
      setIsFetchingPrices(false);
      return;
    }

    // --- Profit Calculation ---
    try {
      const finalAmountTokenA_float = parseFloat(ethers.utils.formatUnits(finalAmountTokenA_BN, parseInt(simTokenADecimals)));
      const initialBorrowAmount_float = parseFloat(simBorrowAmount); // Already a string representing float

      const grossProfit = finalAmountTokenA_float - initialBorrowAmount_float;
      const loanFee = initialBorrowAmount_float * (parseFloat(simFlashLoanFeePercentage) / 100);
      const netProfit = grossProfit - loanFee;

      setSimulationResult({
        amountTokenB: parseFloat(ethers.utils.formatUnits(receivedAmountTokenB_BN, parseInt(simTokenBDecimals))), // For display consistency with current simulationResult structure
        finalAmountTokenA: finalAmountTokenA_float,
        grossProfit,
        loanFee,
        netProfit,
      });
      toast.success("Live prices fetched and simulation updated!");
      setPriceFetchingError(null); // Clear previous errors if successful
    } catch (e: any) {
        console.error("Error calculating profit:", e);
        const errMsg = `Error calculating profit: ${e.message}`;
        setSimError(errMsg); // Use simError for calculation errors post-fetching
        toast.error("Calculation Error", { description: errMsg });
    }
    
    setIsFetchingPrices(false);
  };


  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold gold-gradient">Flash Loans</h1>
        
        {/* Section for Configuring and Executing Flash Loans (remains unchanged) */}
        <Card>
          <CardHeader>
            <CardTitle>Configure & Execute Flash Loan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="proxyAddress">FlashLoanProxy Contract Address</Label>
              <Input id="proxyAddress" value={proxyAddress} onChange={(e) => setProxyAddress(e.target.value)} placeholder="0x..." />
            </div>
            <div>
              <Label htmlFor="providerAddress">Loan Provider Address (e.g., Aave, Uniswap)</Label>
              <Input id="providerAddress" value={providerAddress} onChange={(e) => setProviderAddress(e.target.value)} placeholder="0x..." />
            </div>
            <div>
              <Label htmlFor="tokenAddress">Token Address (ERC20 for Loan)</Label>
              <Input id="tokenAddress" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="0x..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanAmount">Loan Amount (in full units, e.g., 100 ETH)</Label>
                <Input id="loanAmount" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="e.g., 100" />
              </div>
              <div>
                <Label htmlFor="tokenDecimals">Loan Token Decimals</Label>
                <Input id="tokenDecimals" type="number" value={tokenDecimals} onChange={(e) => setTokenDecimals(e.target.value)} placeholder="e.g., 18" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePrepareTransaction} className="w-full">Prepare Flash Loan Transaction</Button>
          </CardFooter>
        </Card>

        {error && (
          <Card className="border-red-500">
            <CardHeader><CardTitle className="text-red-500">Execution Error</CardTitle></CardHeader>
            <CardContent><p className="text-red-400">{error}</p></CardContent>
          </Card>
        )}

        {preparedTx && (
          <Card>
            <CardHeader>
              <CardTitle>Prepared Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm break-all">
              <p><strong>To (Proxy Address):</strong> {preparedTx.to}</p>
              <p><strong>Data:</strong> {preparedTx.data}</p>
              <p><strong>Value:</strong> {ethers.utils.formatEther(preparedTx.value)} ETH</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleExecuteTransaction} className="w-full" disabled={txStatus === 'Pending' || txStatus === 'Waiting for confirmation...'}>
                {txStatus === 'Pending' || txStatus === 'Waiting for confirmation...' ? 'Processing...' : 'Execute Flash Loan'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {txHash && (
          <Card>
            <CardHeader>
              <CardTitle>Live Transaction Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Transaction Hash:</strong>{' '}
                <a 
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline break-all"
                >
                  {txHash}
                </a>
              </p>
              <p><strong>Status:</strong> <span className={
                txStatus === 'Success' ? 'text-green-400' :
                txStatus?.startsWith('Error') ? 'text-red-400' : 'text-yellow-400'
              }>{txStatus}</span></p>
            </CardContent>
          </Card>
        )}

        {/* Client-Side Flash Loan Strategy Simulator Section - Updated UI */}
        <Card>
          <CardHeader>
            <CardTitle>Client-Side Flash Loan Strategy Simulator (with Live Price Fetching)</CardTitle>
            <CardDescription className="text-sm text-muted-foreground pt-2">
              Configure your arbitrage strategy. This tool will fetch live prices from Uniswap V2/V3 to estimate potential profits.
              This is a simplified client-side estimation. Actual on-chain results will vary.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Inputs for Borrowing */}
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="font-semibold text-md gold-gradient">Step 0: Borrow Setup (Token A)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="simBorrowTokenSymbol">Token A Symbol</Label>
                  <Input id="simBorrowTokenSymbol" value={simBorrowTokenSymbol} onChange={(e) => setSimBorrowTokenSymbol(e.target.value)} placeholder="e.g., USDC" />
                </div>
                <div>
                  <Label htmlFor="simBorrowTokenAddress">Token A Address</Label>
                  <Input id="simBorrowTokenAddress" value={simBorrowTokenAddress} onChange={(e) => setSimBorrowTokenAddress(e.target.value)} placeholder="0x..." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                 <div>
                  <Label htmlFor="simBorrowAmount">Borrow Amount (Token A)</Label>
                  <Input id="simBorrowAmount" type="text" value={simBorrowAmount} onChange={(e) => setSimBorrowAmount(e.target.value)} placeholder="e.g., 1000" />
                </div>
                <div>
                  <Label htmlFor="simTokenADecimals">Token A Decimals</Label>
                  <Input id="simTokenADecimals" type="text" value={simTokenADecimals} onChange={(e) => setSimTokenADecimals(e.target.value)} placeholder="e.g., 6" />
                </div>
              </div>
            </div>

            {/* Inputs for Step 1 (Swap A -> B) */}
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="font-semibold text-md gold-gradient">Step 1: Swap Token A for Token B on DEX 1</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="simDex1Type">DEX 1 Type</Label>
                  <Select value={simDex1Type} onValueChange={(value) => setSimDex1Type(value)}>
                    <SelectTrigger><SelectValue placeholder="Select DEX Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uniswapV2">Uniswap V2</SelectItem>
                      <SelectItem value="uniswapV3">Uniswap V3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {simDex1Type === 'uniswapV3' && (
                  <div>
                    <Label htmlFor="simV3PoolFeeDex1">DEX 1 Pool Fee (Uniswap V3)</Label>
                    <Input id="simV3PoolFeeDex1" value={simV3PoolFeeDex1} onChange={(e) => setSimV3PoolFeeDex1(e.target.value)} placeholder="e.g., 3000 for 0.3%" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label htmlFor="simTokenBSymbol">Token B Symbol</Label>
                  <Input id="simTokenBSymbol" value={simTokenBSymbol} onChange={(e) => setSimTokenBSymbol(e.target.value)} placeholder="e.g., WETH" />
                </div>
                <div>
                  <Label htmlFor="simTokenBAddress">Token B Address</Label>
                  <Input id="simTokenBAddress" value={simTokenBAddress} onChange={(e) => setSimTokenBAddress(e.target.value)} placeholder="0x..." />
                </div>
              </div>
               <div className="pt-2">
                  <Label htmlFor="simTokenBDecimals">Token B Decimals</Label>
                  <Input id="simTokenBDecimals" type="text" value={simTokenBDecimals} onChange={(e) => setSimTokenBDecimals(e.target.value)} placeholder="e.g., 18" />
                </div>
              {fetchedAmountTokenB && (
                <p className="text-sm pt-2">
                  Estimated {simTokenBSymbol} from DEX 1: 
                  <span className="font-mono text-green-400 pl-1">
                    {ethers.utils.formatUnits(fetchedAmountTokenB, parseInt(simTokenBDecimals || "18"))}
                  </span>
                </p>
              )}
            </div>

            {/* Inputs for Step 2 (Swap B -> A) */}
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="font-semibold text-md gold-gradient">Step 2: Swap Token B back to Token A on DEX 2</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="simDex2Type">DEX 2 Type</Label>
                   <Select value={simDex2Type} onValueChange={(value) => setSimDex2Type(value)}>
                    <SelectTrigger><SelectValue placeholder="Select DEX Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uniswapV2">Uniswap V2</SelectItem>
                      <SelectItem value="uniswapV3">Uniswap V3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {simDex2Type === 'uniswapV3' && (
                  <div>
                    <Label htmlFor="simV3PoolFeeDex2">DEX 2 Pool Fee (Uniswap V3)</Label>
                    <Input id="simV3PoolFeeDex2" value={simV3PoolFeeDex2} onChange={(e) => setSimV3PoolFeeDex2(e.target.value)} placeholder="e.g., 3000 for 0.3%" />
                  </div>
                )}
              </div>
               {fetchedFinalAmountTokenA && (
                <p className="text-sm pt-2">
                  Estimated {simBorrowTokenSymbol} from DEX 2: 
                  <span className="font-mono text-green-400 pl-1">
                    {ethers.utils.formatUnits(fetchedFinalAmountTokenA, parseInt(simTokenADecimals || "18"))}
                  </span>
                </p>
              )}
            </div>
            
            {/* Input for Fee */}
            <div className="space-y-2 p-4 border rounded-md">
              <h3 className="font-semibold text-md gold-gradient">Step 3: Repayment & Fees</h3>
              <div>
                <Label htmlFor="simFlashLoanFeePercentage">Flash Loan Fee (%)</Label>
                <Input id="simFlashLoanFeePercentage" type="text" value={simFlashLoanFeePercentage} onChange={(e) => setSimFlashLoanFeePercentage(e.target.value)} placeholder="e.g., 0.09" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button onClick={handleFetchAndSimulate} className="w-full md:w-auto" disabled={isFetchingPrices}>
              {isFetchingPrices ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Prices...</>
              ) : (
                "Fetch Live Prices & Simulate Strategy"
              )}
            </Button>
            {priceFetchingError && <p className="text-sm text-red-500">{priceFetchingError}</p>}
            {priceFetchingError && <p className="text-sm text-red-500">{priceFetchingError}</p>}
            {simError && <p className="text-sm text-red-500 mt-2">{simError}</p>}
            {simulationResult && (
              <div className="w-full p-4 border rounded-md bg-secondary/30 space-y-1">
                <h4 className="font-semibold text-lg pb-2">Live Simulation Results:</h4>
                <p>Fetched {simTokenBSymbol} from DEX 1: <span className="font-mono">{simulationResult.amountTokenB.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 8})}</span></p>
                <p>Fetched {simBorrowTokenSymbol} from DEX 2: <span className="font-mono">{simulationResult.finalAmountTokenA.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></p>
                <hr className="my-1 border-border/50"/>
                <p>Gross Profit: <span className="font-mono">{simulationResult.grossProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> {simBorrowTokenSymbol}</p>
                <p>Flash Loan Fee ({simFlashLoanFeePercentage}%): <span className="font-mono">{simulationResult.loanFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> {simBorrowTokenSymbol}</p>
                <p className={`font-bold ${simulationResult.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Net Profit/Loss: <span className="font-mono">{simulationResult.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> {simBorrowTokenSymbol}
                </p>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Advanced Simulation Setup (Local Fork) Section - No changes here */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Advanced Simulation Setup (Local Fork) - Click to Expand
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Advanced Simulation Setup: Using a Local Mainnet Fork</CardTitle>
                <CardDescription className="pt-2">
                  For more accurate testing of flash loan strategies, especially those involving complex interactions or your own custom smart contracts, setting up a local mainnet fork is highly recommended. This allows you to simulate transactions against real mainnet state without spending real funds and gives you greater control over the environment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <h4 className="font-semibold text-md mb-2">Step 1: Prerequisites</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Node.js and npm (or yarn) installed.</li>
                    <li>A code editor (e.g., Visual Studio Code).</li>
                    <li>Metamask browser extension.</li>
                    <li>An Ethereum Mainnet RPC URL (e.g., from Infura, Alchemy, or QuickNode).</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-2">Step 2: Set Up a Hardhat Project</h4>
                  <p className="mb-1">Create a new directory for your project and initialize it:</p>
                  <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>
                    mkdir my-flashloan-sim && cd my-flashloan-sim<br/>
                    npm init -y<br/>
                    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv ethers @openzeppelin/contracts
                  </code></pre>
                  <p className="mt-2 mb-1">Initialize a sample Hardhat project (choose "Create a TypeScript project" or "Create a JavaScript project"):</p>
                  <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>npx hardhat</code></pre>
                  <p className="mt-2 mb-1">Create or replace `hardhat.config.js` (or `.ts`) with the following configuration:</p>
                  <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>
{`require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Or your preferred Solidity version
  networks: {
    hardhat: { // This configuration enables mainnet forking
      forking: {
        url: process.env.MAINNET_RPC_URL, // Your Mainnet RPC URL
        // blockNumber: 19850000 // Optional: Pin to a specific block for consistent testing
      },
      chainId: 1337 // Default chain ID for the Hardhat Network
    },
    // You can add other networks like 'localhost' if needed for specific Hardhat node instances
    // localhost: {
    //   url: "http://127.0.0.1:8545",
    //   chainId: 1337 // Or 31337 if your 'npx hardhat node' defaults to it
    // }
  },
};`}
                  </code></pre>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-2">Step 3: Create <code>.env</code> File</h4>
                  <p className="mb-1">In the root of your Hardhat project, create a <code>.env</code> file to store your Mainnet RPC URL securely:</p>
                  <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>
                    MAINNET_RPC_URL="YOUR_MAINNET_RPC_URL_HERE"
                  </code></pre>
                  <p className="mt-1"><strong>Important:</strong> Replace <code>YOUR_MAINNET_RPC_URL_HERE</code> with your actual RPC URL (e.g., from Infura: <code>https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID</code>). Do not commit this file to version control.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-2">Step 4: Example <code>FlashLoanProxy.sol</code></h4>
                  <p className="mb-1">Create a <code>contracts</code> directory if it doesn't exist. Inside it, create <code>FlashLoanProxy.sol</code>. This contract will receive the flash loan and execute your strategy.</p>
                  <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // For safe transfers

// Interface for a generic flash loan provider (simplified)
interface IFlashLoanProvider {
    function flashLoan(
        address receiverAddress,
        address token,
        uint256 amount,
        bytes calldata params
    ) external;
}

// Interface for your strategy contract (optional, for modularity)
interface IStrategy {
    function executeStrategy(
        address loanToken,
        uint256 loanAmount
    ) external;
}

contract FlashLoanProxy {
    using SafeERC20 for IERC20;

    address public owner;
    // address public strategyContract; // Optional: if you have a separate strategy contract

    event LoanExecuted(address indexed token, uint256 amount, uint256 fee);
    event StrategyProfit(address indexed token, uint256 profit);

    constructor(/* address _strategyContract */) {
        owner = msg.sender;
        // strategyContract = _strategyContract;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // This is the function called by the flash loan provider after lending the funds
    // For Aave, it's usually executeOperation. For Uniswap, it's uniswapV2Call or uniswapV3Call.
    // This example uses a generic name; you'll need to adapt it to your chosen provider's interface.
    function receiveFlashLoan(
        address token,
        uint256 amount,
        uint256 fee, // The fee charged by the provider
        bytes calldata params // Optional parameters you might have passed
    ) external {
        // IMPORTANT: Ensure this function is only callable by the trusted flash loan provider
        // require(msg.sender == address(flashLoanProvider), "Untrusted caller");

        // 1. (Optional) Decode params if any
        // (address targetDex, uint256 amountToSwap) = abi.decode(params, (address, uint256));

        // 2. Implement your arbitrage/liquidation/etc. strategy here or call a strategy contract
        // Example: Perform swaps, interact with other protocols
        // IERC20(token).approve(address(someDexRouter), amount);
        // ISomeDexRouter(someDexRouter).swapExactTokensForTokens(...);
        
        // For this example, we'll assume the strategy is embedded or called externally
        // and profit is sent back to this contract.
        // If using a separate strategy contract:
        // IStrategy(strategyContract).executeStrategy(token, amount);

        // 3. Repay the loan + fee
        uint256 totalRepayment = amount + fee;
        IERC20(token).safeApprove(msg.sender, totalRepayment); // Approve provider to take back funds
        IERC20(token).safeTransfer(msg.sender, totalRepayment); // Or provider pulls it

        emit LoanExecuted(token, amount, fee);

        // 4. (Optional) Calculate and withdraw profit
        uint256 remainingBalance = IERC20(token).balanceOf(address(this));
        if (remainingBalance > 0) {
            IERC20(token).safeTransfer(owner, remainingBalance);
            emit StrategyProfit(token, remainingBalance);
        }
    }

    // This is the function you will call from the dashboard to initiate the flash loan
    function executeLoan(
        address provider, // Address of the flash loan provider contract
        address token,    // Address of the token to borrow
        uint256 amount    // Amount of the token to borrow
        // bytes calldata params // Optional: parameters for your strategy
    ) external onlyOwner { // Or payable if your proxy needs to hold ETH for gas
        // Construct 'params' if your receiveFlashLoan function or strategy needs them
        // bytes memory paramsData = abi.encode(...);

        IFlashLoanProvider(provider).flashLoan(
            address(this), // The receiver of the loan (this contract)
            token,
            amount,
            "" // Pass empty bytes or your encoded paramsData
        );
    }

    // Fallback function to receive ETH if needed
    receive() external payable {}
    fallback() external payable {}

    function withdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function withdrawERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(owner, IERC20(tokenAddress).balanceOf(address(this)));
    }
}`}
                  </code></pre>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Note: The <code>receiveFlashLoan</code> function signature and repayment mechanism (e.g., approving the provider or direct transfer) may need to be adapted based on the specific flash loan provider you intend to use (e.g., Aave, Uniswap V2/V3, MakerDAO). This example is generic.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-2">Step 5: Create Deployment Script</h4>
                  <p className="mb-1">Create a <code>scripts</code> directory if it doesn't exist. Inside it, create <code>deployProxy.js</code>:</p>
                  <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>
{`const hre = require("hardhat");

async function main() {
  const FlashLoanProxy = await hre.ethers.getContractFactory("FlashLoanProxy");
  // If your constructor takes arguments (e.g., a strategy contract address), pass them here.
  // const strategyContractAddress = "0xYourStrategyContractAddress"; 
  // const flashLoanProxy = await FlashLoanProxy.deploy(strategyContractAddress);
  const flashLoanProxy = await FlashLoanProxy.deploy();


  await flashLoanProxy.deployed();

  console.log(
    \`FlashLoanProxy deployed to: \${flashLoanProxy.address}\`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`}
                  </code></pre>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-2">Step 6: Running the Local Fork and Deploying</h4>
                  <p className="mb-1">Open a terminal and start the Hardhat local node (this will use the forking config from `hardhat.config.js`):</p>
                  <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>npx hardhat node</code></pre>
                  <p className="mt-2 mb-1">Open a <em>second</em> terminal. Deploy your contract to the local Hardhat network:</p>
                  <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto"><code>npx hardhat run scripts/deployProxy.js --network localhost</code></pre>
                  <p className="mt-1">The console will output the deployed <code>FlashLoanProxy</code> address. Copy this address.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-2">Step 7: Connect Metamask to Local Fork</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Open Metamask and click on the network selector at the top.</li>
                    <li>Select "Add network" or "Custom RPC".</li>
                    <li>Fill in the details:</li>
                    <li className="ml-4"><strong>Network Name:</strong> Hardhat Local Fork (or any name)</li>
                    <li className="ml-4"><strong>New RPC URL:</strong> <code>http://127.0.0.1:8545</code></li>
                    <li className="ml-4"><strong>Chain ID:</strong> <code>1337</code></li>
                    <li className="ml-4"><strong>Currency Symbol (Optional):</strong> ETH</li>
                    <li>Click "Save".</li>
                    <li>(Optional) To use the accounts provided by `npx hardhat node`, import one of the private keys logged in the terminal into Metamask. This account will have a large ETH balance on your local fork.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-md mb-2">Step 8: Using with the Dashboard</h4>
                  <p>
                    Once Metamask is connected to your local Hardhat fork, take the deployed <code>FlashLoanProxy</code> address (from Step 6) and use it in the "Configure & Execute Flash Loan" section of this dashboard. You can then interact with your locally deployed contract.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-md mb-2">Step 9 (Advanced): Understanding RPC Interception</h4>
                  <p className="mb-1">
                    For highly specialized testing scenarios, such as faking specific token balances (like the 1 million USDT in the <code>HarpyFlashLoanFork</code> example you provided earlier), simulating unique contract states, or testing edge cases of your strategy under specific blockchain conditions, you might use an RPC interceptor.
                  </p>
                  <p className="mb-1">
                    An <strong>RPC interceptor</strong> is essentially a local proxy server that sits between your wallet (e.g., Metamask) and your actual blockchain RPC endpoint (in this case, your local Hardhat Node). You configure Metamask to send its requests to the interceptor, and the interceptor can then:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 my-2">
                    <li>Forward the request directly to the Hardhat Node.</li>
                    <li>Modify the request before forwarding it.</li>
                    <li>Modify the response from the Hardhat Node before sending it back to Metamask.</li>
                  </ul>
                  <p className="mb-1">
                    The <code>rpc-fake/server.js</code> (using Node.js and Express) from your <code>HarpyFlashLoanFork</code> example is a perfect illustration of such an interceptor. It specifically listened for <code>eth_call</code> methods to a particular USDT contract address and returned a fake large balance.
                  </p>
                  <h5 className="font-medium text-sm mt-3 mb-1">Typical Data Flow with an Interceptor:</h5>
                  <ol className="list-decimal pl-6 space-y-1 text-xs">
                    <li>Metamask (Network configured to <code>http://localhost:PORT_OF_INTERCEPTOR</code>, e.g., <code>8555</code>).</li>
                    <li>Your Local RPC Interceptor (e.g., Node.js Express server running on port <code>8555</code>).</li>
                    <li>Interceptor forwards requests to Your Local Hardhat Node RPC (<code>http://localhost:8545</code>).</li>
                    <li>Hardhat Node (forking Mainnet) gets actual chain data from Infura (or your configured <code>MAINNET_RPC_URL</code>).</li>
                  </ol>
                  <p className="mt-2 mb-1">
                    <strong>Setting up an RPC Interceptor:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-1 my-2 text-xs">
                    <li>This is an advanced setup and requires running a separate local server process.</li>
                    <li>You would need to write or use an existing script for this (like the Express.js example).</li>
                    <li>The dashboard itself does not provide or manage this interceptor. You would use the dashboard by pointing Metamask to your interceptor's URL.</li>
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    This technique offers powerful testing capabilities but requires a good understanding of Ethereum RPC methods and server-side scripting.
                  </p>
                </div>
                
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </DashboardLayout>
  );
};

export default FlashLoansPage;
