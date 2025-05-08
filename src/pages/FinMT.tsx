
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BackgroundAnimation from "@/components/ui/background-animation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, ArrowRight, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface FinancialMessage {
  content: string;
  filename: string;
  type: string;
}

const FinMT = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedMessage, setProcessedMessage] = useState<FinancialMessage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [converted, setConverted] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProcessedMessage(null);
      setConverted(false);
      toast.success(`File selected: ${file.name}`);
    }
  };
  
  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    
    setIsProcessing(true);
    toast.success("Processing file...");
    
    // Read the file content
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
        
        let messageType = "FIN MT";
        if (fileExt === 'xml' || content.trim().startsWith('<?xml')) {
          messageType = "ISO20022";
        } else if (fileExt === 'json' || content.trim().startsWith('{')) {
          messageType = "JSON";
        }
        
        setProcessedMessage({
          content,
          filename: selectedFile.name,
          type: messageType
        });
        
        toast.success("File processed successfully");
      } catch (error) {
        toast.error("Error processing file");
        console.error("Error processing file:", error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading file");
      setIsProcessing(false);
    };
    
    reader.readAsText(selectedFile);
  };
  
  const handleConvert = () => {
    if (!processedMessage) return;
    
    toast.success("Converting message to ERC-20 format...");
    
    // Simulate conversion process
    setTimeout(() => {
      setConverted(true);
      toast.success("Message converted to ERC-20 format successfully");
    }, 1500);
  };
  
  const handleTransmit = () => {
    if (!processedMessage) return;
    
    toast.success(`Transmitting ${converted ? 'ERC-20' : processedMessage.type} message...`);
    
    // Simulate transmission process
    setTimeout(() => {
      toast.success("Message transmitted successfully");
    }, 2000);
  };
  
  const formatMessageContent = (content: string, type: string) => {
    if (type === "JSON") {
      try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return content;
      }
    }
    return content;
  };
  
  return (
    <DashboardLayout>
      <div className="h-full w-full relative overflow-hidden">
        <BackgroundAnimation>
          <div className="h-full py-6 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold gold-gradient mb-2">FIN MT Message Processing</h1>
              <p className="text-muted-foreground">
                Process, convert and transmit financial messages between traditional banking systems and blockchain
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="upload">Upload Message</TabsTrigger>
                    <TabsTrigger value="convert" disabled={!processedMessage}>Convert Format</TabsTrigger>
                    <TabsTrigger value="transmit" disabled={!processedMessage}>Transmit Message</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Upload FIN MT Message
                        </CardTitle>
                        <CardDescription>
                          Upload .fin, .xml, or .json files containing financial messages
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border-2 border-dashed border-border rounded-lg p-10 text-center">
                          <input
                            id="file-upload"
                            type="file"
                            accept=".fin,.xml,.json"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <label 
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                            <p className="text-sm mb-2">Drag and drop or click to upload</p>
                            <p className="text-xs text-muted-foreground mb-4">Supports .fin, .xml, and .json formats</p>
                            <Button variant="outline" type="button">
                              Select File
                            </Button>
                          </label>
                          
                          {selectedFile && (
                            <div className="mt-4 text-sm">
                              <p>Selected file: <span className="font-medium">{selectedFile.name}</span></p>
                              <Button 
                                onClick={handleUpload} 
                                className="mt-2"
                                disabled={isProcessing}
                              >
                                {isProcessing ? "Processing..." : "Process File"}
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {processedMessage && (
                          <div className="mt-6">
                            <h3 className="text-sm font-medium mb-2">Processed Message Content:</h3>
                            <div className="bg-background/80 rounded-md border border-border/40 p-4 overflow-x-auto max-h-60 overflow-y-auto">
                              <div className="text-xs mb-2 text-muted-foreground">
                                Type: <span className="text-gold">{processedMessage.type}</span> | 
                                Filename: <span className="text-gold">{processedMessage.filename}</span>
                              </div>
                              <pre className="text-xs whitespace-pre-wrap">
                                {formatMessageContent(processedMessage.content, processedMessage.type)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="convert">
                    <Card>
                      <CardHeader>
                        <CardTitle>Convert Message Format</CardTitle>
                        <CardDescription>
                          Convert between FIN MT, ISO20022, JSON, and ERC-20 formats
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {processedMessage ? (
                          <div>
                            <div className="mb-6">
                              <h3 className="text-sm font-medium mb-2">Source Message:</h3>
                              <div className="bg-background/50 rounded-md border border-border/40 p-3 max-h-40 overflow-y-auto">
                                <div className="text-xs mb-2">
                                  Type: <span className="text-gold">{processedMessage.type}</span> | 
                                  Filename: <span className="text-gold">{processedMessage.filename}</span>
                                </div>
                                <pre className="text-xs whitespace-pre-wrap line-clamp-5">
                                  {processedMessage.content.substring(0, 300)}
                                  {processedMessage.content.length > 300 ? '...' : ''}
                                </pre>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <Button 
                                onClick={handleConvert}
                                className="flex items-center gap-2"
                                disabled={converted}
                              >
                                <ArrowRight className="h-4 w-4" />
                                {converted ? "Converted to ERC-20" : "Convert to ERC-20"}
                              </Button>
                              
                              {converted && (
                                <div className="mt-6 text-left">
                                  <h3 className="text-sm font-medium mb-2">Converted to ERC-20:</h3>
                                  <div className="bg-background/50 rounded-md border border-border/40 p-3 max-h-60 overflow-y-auto">
                                    <div className="text-xs mb-2 text-green-500">
                                      Successfully converted to ERC-20 format
                                    </div>
                                    <pre className="text-xs whitespace-pre-wrap">
                                      {`{
  "token": "ERC20",
  "version": "1.0",
  "sourceFormat": "${processedMessage.type}",
  "sourceFileName": "${processedMessage.filename}",
  "timestamp": "${new Date().toISOString()}",
  "payload": {
    "convertedData": "..."
  }
}`}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <p className="text-muted-foreground mb-4">
                              Please upload a message file first to enable conversion
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="transmit">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transmit Message</CardTitle>
                        <CardDescription>
                          Send message to banking networks or broadcast to blockchain
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {processedMessage ? (
                          <div>
                            <div className="mb-6">
                              <h3 className="text-sm font-medium mb-2">
                                Message to Transmit ({converted ? 'ERC-20 Format' : processedMessage.type}):
                              </h3>
                              <div className="bg-background/50 rounded-md border border-border/40 p-3 max-h-40 overflow-y-auto mb-6">
                                <pre className="text-xs whitespace-pre-wrap line-clamp-5">
                                  {converted 
                                    ? `ERC-20 converted format from ${processedMessage.filename}`
                                    : processedMessage.content.substring(0, 200) + (processedMessage.content.length > 200 ? '...' : '')
                                  }
                                </pre>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Card className="p-4 border-gold/30">
                                  <h4 className="text-sm font-medium mb-2">Banking Network</h4>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Send to traditional banking system via SWIFT
                                  </p>
                                  <Button 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={handleTransmit}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send to Banking Network
                                  </Button>
                                </Card>
                                
                                <Card className="p-4 border-gold/30">
                                  <h4 className="text-sm font-medium mb-2">Blockchain Network</h4>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Broadcast to Ethereum blockchain
                                  </p>
                                  <Button 
                                    className="w-full" 
                                    onClick={handleTransmit}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Broadcast to Blockchain
                                  </Button>
                                </Card>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <p className="text-muted-foreground mb-4">
                              Upload and process a message before transmission
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Message Information</CardTitle>
                    <CardDescription>
                      Details about financial messaging standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <h3 className="font-medium">FIN MT Format</h3>
                        <p className="text-xs text-muted-foreground">
                          SWIFT MT messages are standardized messages used in the financial industry for exchanging information related to financial transactions.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">ISO20022</h3>
                        <p className="text-xs text-muted-foreground">
                          ISO20022 is an international standard for financial message exchange between financial institutions.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">ERC-20 Conversion</h3>
                        <p className="text-xs text-muted-foreground">
                          Our system maps traditional financial messages to the ERC-20 token standard for blockchain integration and smart contract execution.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Security Notice</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      All messages are processed locally and are not sent to any external servers unless explicitly initiated by the user. Our system adheres to the highest banking security standards.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </BackgroundAnimation>
      </div>
    </DashboardLayout>
  );
};

export default FinMT;
