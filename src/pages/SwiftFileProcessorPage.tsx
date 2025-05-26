import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useState, useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  parseJsonSwiftData,
  parseXmlSwiftData,
  parseFinBinSwiftData,
  ParsedJsonSwiftData,
  ParsedXmlSwiftData,
  ParsedFinBinSwiftData
} from "../lib/swiftParsers";

const SwiftFileProcessorPage = () => {
  // File handling states
  const [selectedJsonFile, setSelectedJsonFile] = useState<File | null>(null);
  const [selectedXmlFile, setSelectedXmlFile] = useState<File | null>(null);
  const [selectedBinFile, setSelectedBinFile] = useState<File | null>(null);
  
  const [jsonFileContent, setJsonFileContent] = useState<string | null>(null);
  const [xmlFileContent, setXmlFileContent] = useState<string | null>(null);
  const [binFileContent, setBinFileContent] = useState<string | null>(null);
  
  const [parsedJsonData, setParsedJsonData] = useState<ParsedJsonSwiftData | null>(null);
  const [parsedXmlData, setParsedXmlData] = useState<ParsedXmlSwiftData | null>(null);
  const [parsedBinData, setParsedBinData] = useState<ParsedFinBinSwiftData | null>(null);
  
  const [fileError, setFileError] = useState<string | null>(null);

  // Token minting staging states
  const [targetBlockchain, setTargetBlockchain] = useState<string>("ethereum"); // 'ethereum' or 'tron'
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [amountSourceForMinting, setAmountSourceForMinting] = useState<string>(""); // 'json', 'xml', 'bin'
  const [tokenMintAmountInput, setTokenMintAmountInput] = useState<string>("");
  const [tokenMintDecimals, setTokenMintDecimals] = useState<string>("18");
  const [preparedMintData, setPreparedMintData] = useState<any | null>(null);

  // Update tokenMintAmountInput when amountSourceForMinting or parsed data changes
  useEffect(() => {
    if (amountSourceForMinting === "json" && parsedJsonData?.fundAmount) {
      setTokenMintAmountInput(String(parsedJsonData.fundAmount));
    } else if (amountSourceForMinting === "xml" && parsedXmlData?.settlementAmount) {
      setTokenMintAmountInput(String(parsedXmlData.settlementAmount));
    } else if (amountSourceForMinting === "bin" && parsedBinData?.amount) {
      setTokenMintAmountInput(String(parsedBinData.amount));
    } else if (amountSourceForMinting === "") { // If source is cleared, clear amount
        setTokenMintAmountInput("");
    }
    // If a source is selected but the corresponding data is not available/valid, amount will not change or be cleared.
    // User can always manually override.
  }, [amountSourceForMinting, parsedJsonData, parsedXmlData, parsedBinData]);


  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setParsedJsonData(null); // Clear previous parsed data
    setSelectedJsonFile(null);
    setJsonFileContent(null);
    const file = event.target.files?.[0];
    setFileError(null);
    setSelectedJsonFile(null);
    setJsonFileContent(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        setSelectedJsonFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            setJsonFileContent(e.target?.result as string);
          } catch (err) {
            setFileError("Error reading JSON file content.");
            console.error(err);
          }
        };
        reader.onerror = () => {
          setFileError("Error reading JSON file.");
        };
        reader.readAsText(file);
      } else {
        setFileError("Invalid file type. Please upload a .json file.");
      }
    }
  };

  const handleXmlFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setSelectedXmlFile(null);
    setXmlFileContent(null);
    setParsedXmlData(null); 
    if (amountSourceForMinting === 'xml') setAmountSourceForMinting(''); // Clear if this was the source
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/xml" || file.type === "application/xml" || file.name.endsWith(".xml")) {
        setSelectedXmlFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            setXmlFileContent(e.target?.result as string);
          } catch (err) {
            setFileError("Error reading XML file content.");
            console.error(err);
          }
        };
        reader.onerror = () => {
          setFileError("Error reading XML file.");
        };
        reader.readAsText(file);
      } else {
        setFileError("Invalid file type. Please upload an .xml file.");
      }
    }
  };

  const handleBinFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setSelectedBinFile(null);
    setBinFileContent(null);
    setParsedBinData(null);
    if (amountSourceForMinting === 'bin') setAmountSourceForMinting(''); // Clear if this was the source
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".bin") || file.name.endsWith(".fin") || file.type === "application/octet-stream") {
        setSelectedBinFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const byteArray = new Uint8Array(arrayBuffer);
            let hexString = "";
            for (let i = 0; i < byteArray.length; i++) {
              hexString += byteArray[i].toString(16).padStart(2, "0");
            }
            setBinFileContent(hexString);
          } catch (err) {
            setFileError("Error processing binary file content.");
            console.error(err);
          }
        };
        reader.onerror = () => {
          setFileError("Error reading binary file.");
        };
        reader.readAsArrayBuffer(file);
      } else {
        setFileError("Invalid file type. Please upload a .bin or .fin file.");
      }
    }
  };

  const handleProcessFiles = () => {
    setFileError(null); // Clear previous errors
    let successCount = 0;
    let errorCount = 0;

    if (jsonFileContent) {
      try {
        const parsed = parseJsonSwiftData(jsonFileContent);
        setParsedJsonData(parsed);
        console.log("Parsed JSON Data:", parsed);
        sonnerToast.success("JSON File Processed", { description: `Reference: ${parsed.fundReference || 'N/A'}` });
        successCount++;
      } catch (err: any) {
        console.error("Error parsing JSON:", err);
        setFileError(`JSON Error: ${err.message}`);
        sonnerToast.error("JSON Parsing Failed", { description: err.message });
        setParsedJsonData(null);
        errorCount++;
      }
    }

    if (xmlFileContent) {
      try {
        const parsed = parseXmlSwiftData(xmlFileContent);
        setParsedXmlData(parsed);
        console.log("Parsed XML Data:", parsed);
        sonnerToast.success("XML File Processed", { description: `Message ID: ${parsed.messageId || 'N/A'}` });
        successCount++;
      } catch (err: any) {
        console.error("Error parsing XML:", err);
        setFileError((prev) => (prev ? `${prev}\nXML Error: ${err.message}` : `XML Error: ${err.message}`));
        sonnerToast.error("XML Parsing Failed", { description: err.message });
        setParsedXmlData(null);
        errorCount++;
      }
    }

    if (binFileContent) {
      try {
        const parsed = parseFinBinSwiftData(binFileContent);
        setParsedBinData(parsed);
        console.log("Parsed BIN/FIN Data:", parsed);
        sonnerToast.success("BIN/FIN File Processed", { description: `Tx Ref: ${parsed.transactionReference || 'N/A'}` });
        successCount++;
      } catch (err: any) {
        console.error("Error parsing BIN/FIN:", err);
        setFileError((prev) => (prev ? `${prev}\nBIN/FIN Error: ${err.message}` : `BIN/FIN Error: ${err.message}`));
        sonnerToast.error("BIN/FIN Parsing Failed", { description: err.message });
        setParsedBinData(null);
        errorCount++;
      }
    }
    
    if (successCount === 0 && errorCount === 0 && !jsonFileContent && !xmlFileContent && !binFileContent) {
        sonnerToast.info("No files selected", { description: "Please upload at least one file to process."});
    } else if (errorCount > 0 && successCount > 0) {
        sonnerToast.warning("Partial Success", { description: `${successCount} file(s) processed, ${errorCount} file(s) failed.`});
    } else if (errorCount > 0 && successCount === 0) {
        // Already handled by individual error toasts
    }
    // Success only toast is handled by individual success toasts
  };

  const handlePrepareMintingData = () => {
    setPreparedMintData(null); // Clear previous
    if (!amountSourceForMinting) {
      sonnerToast.error("Amount Source Not Selected", { description: "Please select a source for the token mint amount."});
      return;
    }
    if (!tokenMintAmountInput || parseFloat(tokenMintAmountInput) <= 0) {
      sonnerToast.error("Invalid Token Amount", { description: "Please enter a valid positive amount for token minting."});
      return;
    }
    if (!tokenName.trim() || !tokenSymbol.trim()) {
        sonnerToast.error("Token Details Missing", { description: "Please enter Token Name and Token Symbol."});
        return;
    }

    const dataToMint = {
      blockchain: targetBlockchain,
      name: tokenName,
      symbol: tokenSymbol,
      amount: parseFloat(tokenMintAmountInput),
      decimals: parseInt(tokenMintDecimals) || 18, // Default to 18 if not specified or invalid
      sourceData: {}, // Reference to original parsed data
    };

    if (amountSourceForMinting === "json" && parsedJsonData) {
      dataToMint.sourceData = { type: "JSON", reference: parsedJsonData.fundReference, transactionId: parsedJsonData.fundTransactionId };
    } else if (amountSourceForMinting === "xml" && parsedXmlData) {
      dataToMint.sourceData = { type: "XML", messageId: parsedXmlData.messageId, settlementDate: parsedXmlData.settlementDate };
    } else if (amountSourceForMinting === "bin" && parsedBinData) {
      dataToMint.sourceData = { type: "FIN/BIN", reference: parsedBinData.transactionReference, valueDate: parsedBinData.valueDate };
    } else {
      sonnerToast.error("Source Data Not Available", { description: `The selected amount source (${amountSourceForMinting}) does not have parsed data.`});
      return; // Should not happen if UI logic is correct
    }

    setPreparedMintData(dataToMint);
    sonnerToast.success("Minting Data Prepared", { description: "Review the data below. No actual minting will occur."});
  };

  // Helper component for displaying parsed data fields
  const ParsedDataDisplayItem = ({ label, value, isMono = false }: { label: string; value?: string | number | null; isMono?: boolean }) => {
    if (value === undefined || value === null || String(value).trim() === "") return null;
    return (
      <div className="py-1">
        <span className="font-semibold text-muted-foreground">{label}:</span>
        <span className={`ml-2 ${isMono ? 'font-mono' : ''}`}>{String(value)}</span>
      </div>
    );
  };


  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold gold-gradient">SWIFT File Processor & Tokenization Staging</h1>
        
        {/* File Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload SWIFT Message Files</CardTitle>
            <CardDescription>
              Upload your SWIFT message files in JSON, XML, or BIN/FIN format for processing and staging for tokenization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* JSON File Upload */}
            <div className="space-y-2">
              <Label htmlFor="jsonFile" className="text-lg font-medium">Upload JSON File (.json)</Label>
              <Input id="jsonFile" type="file" accept=".json" onChange={handleJsonFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"/>
              {selectedJsonFile && <p className="text-sm text-muted-foreground">Selected: {selectedJsonFile.name}</p>}
            </div>

            {/* XML File Upload */}
            <div className="space-y-2">
              <Label htmlFor="xmlFile" className="text-lg font-medium">Upload XML File (.xml)</Label>
              <Input id="xmlFile" type="file" accept=".xml,text/xml,application/xml" onChange={handleXmlFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"/>
              {selectedXmlFile && <p className="text-sm text-muted-foreground">Selected: {selectedXmlFile.name}</p>}
            </div>

            {/* BIN/FIN File Upload */}
            <div className="space-y-2">
              <Label htmlFor="binFile" className="text-lg font-medium">Upload Binary File (.bin, .fin)</Label>
              <Input id="binFile" type="file" accept=".bin,.fin,application/octet-stream" onChange={handleBinFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"/>
              {selectedBinFile && <p className="text-sm text-muted-foreground">Selected: {selectedBinFile.name}</p>}
            </div>

            {fileError && <p className="text-sm text-red-500">{fileError}</p>}

            <Button onClick={handleProcessFiles} className="w-full md:w-auto mt-4">
              Process Files (Log Content)
            </Button>
          </CardContent>
        </Card>

        {/* Display area for file contents (optional for this step, more for next) */}
        {(jsonFileContent || xmlFileContent || binFileContent) && (
          <Card>
            <CardHeader><CardTitle>Staged File Contents (Preview)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {jsonFileContent && (
                <div>
                  <h3 className="font-semibold">JSON Content:</h3>
                  <pre className="text-xs bg-secondary p-2 rounded-md max-h-40 overflow-auto">{jsonFileContent.substring(0,500)}{jsonFileContent.length > 500 ? '...' : ''}</pre>
                </div>
              )}
              {xmlFileContent && (
                <div>
                  <h3 className="font-semibold">XML Content:</h3>
                  <pre className="text-xs bg-secondary p-2 rounded-md max-h-40 overflow-auto">{xmlFileContent.substring(0,500)}{xmlFileContent.length > 500 ? '...' : ''}</pre>
                </div>
              )}
              {binFileContent && (
                <div>
                  <h3 className="font-semibold">BIN/FIN (Hex) Content:</h3>
                  <pre className="text-xs bg-secondary p-2 rounded-md max-h-40 overflow-auto break-all">{binFileContent.substring(0,500)}{binFileContent.length > 500 ? '...' : ''}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SwiftFileProcessorPage;
