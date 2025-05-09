
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLegacyTransaction, LegacyTransactionParams } from "@/services/legacy-transaction";
import { Key, Send, Info, Copy, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface LegacyTransferFormProps {
  onTransactionComplete: (txHash: string) => void;
}

const LegacyTransferForm: React.FC<LegacyTransferFormProps> = ({ onTransactionComplete }) => {
  const { toast } = useToast();
  const { initializeProvider, createTransaction, sendTransaction } = useLegacyTransaction();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [gasPrice, setGasPrice] = useState("10");
  const [gasLimit, setGasLimit] = useState("21000");
  const [privateKey, setPrivateKey] = useState("");
  const [infuraProjectId, setInfuraProjectId] = useState("");
  const [providerInitialized, setProviderInitialized] = useState(false);
  const [signedTransaction, setSignedTransaction] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const isValidEthAddress = (address: string) => {
    return address.match(/^0x[a-fA-F0-9]{40}$/);
  };
  
  const isValidAmount = (value: string) => {
    return !isNaN(Number(value)) && Number(value) > 0;
  };
  
  const isFormValid = () => {
    return (
      isValidEthAddress(recipient) && 
      isValidAmount(amount) && 
      privateKey.length > 0 &&
      providerInitialized
    );
  };
  
  const handleInitializeProvider = () => {
    if (infuraProjectId) {
      const success = initializeProvider(infuraProjectId);
      setProviderInitialized(success);
    } else {
      toast({
        title: "Campo obrigatório",
        description: "Informe o Project ID do Infura",
        variant: "destructive",
      });
    }
  };

  const handlePaste = async (setter: React.Dispatch<React.SetStateAction<string>>) => {
    try {
      const text = await navigator.clipboard.readText();
      setter(text);
    } catch (err) {
      console.error("Falha ao colar do clipboard", err);
    }
  };

  const handlePrepareTransaction = async () => {
    if (!isFormValid()) return;
    
    try {
      setIsLoading(true);
      
      const params: LegacyTransactionParams = {
        to: recipient,
        value: amount,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
      };
      
      const signedTx = await createTransaction(params, privateKey);
      
      if (signedTx) {
        setSignedTransaction(signedTx);
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error("Erro ao preparar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendTransaction = async () => {
    if (!isFormValid()) return;
    
    try {
      setIsLoading(true);
      
      const params: LegacyTransactionParams = {
        to: recipient,
        value: amount,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
      };
      
      const tx = await sendTransaction(params, privateKey);
      
      if (tx && tx.hash) {
        // Limpar o formulário
        setRecipient("");
        setAmount("");
        setShowConfirmation(false);
        
        // Notificar o componente pai
        onTransactionComplete(tx.hash);
      }
    } catch (error) {
      console.error("Erro ao enviar transação:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Transação copiada para a área de transferência",
      });
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };
  
  return (
    <>
      <Card className="w-full max-w-md mx-auto card-hover">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5 text-gold" />
            Transação Legada (Tipo 0)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="infuraId" className="flex items-center">
              <Key className="h-3 w-3 mr-1" />
              Infura Project ID
            </Label>
            <div className="flex gap-2">
              <Input
                id="infuraId"
                type="password"
                placeholder="ID do projeto Infura"
                value={infuraProjectId}
                onChange={(e) => setInfuraProjectId(e.target.value)}
                disabled={providerInitialized}
              />
              <Button 
                onClick={handleInitializeProvider}
                disabled={!infuraProjectId || providerInitialized}
                variant="outline"
                className="text-xs whitespace-nowrap"
              >
                {providerInitialized ? "Conectado" : "Conectar"}
              </Button>
            </div>
            <div className="text-xs flex items-center">
              <a 
                href="https://infura.io/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gold hover:text-gold-dark flex items-center"
              >
                Obter uma chave Infura <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="recipient">Endereço do Destinatário</Label>
              <button
                type="button"
                onClick={() => handlePaste(setRecipient)}
                className="text-xs text-gold hover:text-gold-light"
              >
                Colar
              </button>
            </div>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isLoading || !providerInitialized}
              className={
                recipient && !isValidEthAddress(recipient)
                  ? "border-red-500 focus:ring-red-500"
                  : ""
              }
            />
            {recipient && !isValidEthAddress(recipient) && (
              <p className="text-red-500 text-xs mt-1">Endereço Ethereum inválido</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Quantidade (ETH)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading || !providerInitialized}
              className={
                amount && !isValidAmount(amount)
                  ? "border-red-500 focus:ring-red-500"
                  : ""
              }
            />
            {amount && !isValidAmount(amount) && (
              <p className="text-red-500 text-xs mt-1">Quantidade inválida</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
              <Input
                id="gasPrice"
                type="text"
                placeholder="10"
                value={gasPrice}
                onChange={(e) => setGasPrice(e.target.value)}
                disabled={isLoading || !providerInitialized}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gasLimit">Gas Limit</Label>
              <Input
                id="gasLimit"
                type="text"
                placeholder="21000"
                value={gasLimit}
                onChange={(e) => setGasLimit(e.target.value)}
                disabled={isLoading || !providerInitialized}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="privateKey" className="flex items-center">
                <Key className="h-3 w-3 mr-1" />
                Chave Privada
              </Label>
              <button
                type="button"
                onClick={() => handlePaste(setPrivateKey)}
                className="text-xs text-gold hover:text-gold-light"
              >
                Colar
              </button>
            </div>
            <Input
              id="privateKey"
              type="password"
              placeholder="Sua chave privada"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              disabled={isLoading || !providerInitialized}
            />
            <p className="text-amber-500 text-xs flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Nunca compartilhe sua chave privada! Apenas para testes.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handlePrepareTransaction}
            disabled={!isFormValid() || isLoading}
            className="w-full bg-gold hover:bg-gold-dark text-black"
          >
            {isLoading ? "Processando..." : "Criar Transação Legada"}
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmar Transação Legada</DialogTitle>
            <DialogDescription>
              Revise os detalhes da transação antes de enviar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Tipo:</div>
              <div className="text-sm font-medium">Legada (Tipo 0)</div>
              
              <div className="text-sm text-muted-foreground">Quantidade:</div>
              <div className="text-sm font-medium">{amount} ETH</div>
              
              <div className="text-sm text-muted-foreground">Para:</div>
              <div className="text-xs font-mono truncate">{recipient}</div>
              
              <div className="text-sm text-muted-foreground">Gas Price:</div>
              <div className="text-sm font-medium">{gasPrice} Gwei</div>
              
              <div className="text-sm text-muted-foreground">Gas Limit:</div>
              <div className="text-sm font-medium">{gasLimit}</div>
            </div>
            
            {signedTransaction && (
              <div className="mt-4">
                <Label className="text-sm mb-2 block">Transação Assinada:</Label>
                <div className="bg-secondary/20 p-3 rounded text-xs font-mono break-all max-h-32 overflow-y-auto">
                  {signedTransaction}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2 text-xs" 
                  onClick={() => copyToClipboard(signedTransaction)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar Transação Assinada
                </Button>
              </div>
            )}
            
            <div className="flex items-center p-3 bg-gold/10 rounded-md">
              <Info size={16} className="text-gold mr-2 flex-shrink-0" />
              <span className="text-xs">
                As taxas de gas são pagas à rede Ethereum pelo processamento da sua transação e podem variar.
              </span>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendTransaction}
                disabled={isLoading}
                className="flex-1 bg-gold hover:bg-gold-dark text-black"
              >
                {isLoading ? "Processando..." : "Enviar Transação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LegacyTransferForm;
