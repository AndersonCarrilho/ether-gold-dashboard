
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BackgroundAnimation from "@/components/ui/background-animation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const FinMT = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };
  
  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    
    toast.success("Processing file...");
    // Simulate processing
    setTimeout(() => {
      toast.success("File processed successfully");
    }, 2000);
  };
  
  return (
    <DashboardLayout>
      <div className="h-full w-full relative overflow-hidden">
        <BackgroundAnimation>
          <div className="h-full py-6">
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
                    <TabsTrigger value="convert">Convert Format</TabsTrigger>
                    <TabsTrigger value="transmit">Transmit Message</TabsTrigger>
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
                              >
                                Process File
                              </Button>
                            </div>
                          )}
                        </div>
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
                        <div className="text-center p-6">
                          <p className="text-muted-foreground mb-4">
                            Please upload a message file first to enable conversion
                          </p>
                          <Button disabled={!selectedFile} className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4" />
                            Convert to ERC-20
                          </Button>
                        </div>
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
                        <div className="text-center p-6">
                          <p className="text-muted-foreground mb-4">
                            Upload and convert a message before transmission
                          </p>
                          <Button disabled={!selectedFile} className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4" />
                            Transmit Message
                          </Button>
                        </div>
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
