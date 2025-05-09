
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

export interface LegacyTransactionParams {
  to: string;
  value: string; // em ETH
  gasPrice?: string; // em gwei
  gasLimit?: string;
  data?: string;
  nonce?: number;
}

export class LegacyTransactionService {
  private provider: ethers.providers.Provider | null = null;
  
  constructor(providerUrl?: string, infuraProjectId?: string) {
    try {
      if (providerUrl) {
        this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
      } else if (infuraProjectId) {
        this.provider = new ethers.providers.InfuraProvider("mainnet", infuraProjectId);
      }
    } catch (error) {
      console.error("Erro ao inicializar o provider:", error);
    }
  }
  
  setProvider(provider: ethers.providers.Provider) {
    this.provider = provider;
  }
  
  setInfuraProvider(projectId: string) {
    try {
      this.provider = new ethers.providers.InfuraProvider("mainnet", projectId);
      return true;
    } catch (error) {
      console.error("Erro ao definir Infura provider:", error);
      return false;
    }
  }
  
  async createLegacyTransaction(params: LegacyTransactionParams, privateKey: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error("Provider não configurado");
      }
      
      // Criar carteira com a chave privada fornecida
      const wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Obter o nonce automaticamente se não for fornecido
      const nonce = params.nonce !== undefined ? 
        params.nonce : 
        await wallet.getTransactionCount();
      
      // Preparar objeto de transação legada (tipo 0)
      const tx = {
        nonce: nonce,
        gasLimit: params.gasLimit ? 
          ethers.utils.hexlify(Number(params.gasLimit)) : 
          ethers.utils.hexlify(21000), // padrão para transferências simples
        gasPrice: params.gasPrice ? 
          ethers.utils.parseUnits(params.gasPrice, "gwei") : 
          ethers.utils.parseUnits("10", "gwei"), // 10 gwei padrão
        to: params.to,
        value: ethers.utils.parseEther(params.value),
        data: params.data || "0x", // sem dados adicionais por padrão
        type: 0, // forçar transação legada
      };
      
      console.log("Preparando transação legada:", { ...tx, privateKey: "***ocultada***" });
      
      // Assinar a transação
      const signedTx = await wallet.signTransaction(tx);
      console.log("Transação assinada:", signedTx);
      
      return signedTx;
    } catch (error) {
      console.error("Erro ao criar transação legada:", error);
      throw error;
    }
  }
  
  async sendSignedTransaction(signedTx: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.provider) {
      throw new Error("Provider não configurado");
    }
    
    try {
      // Enviar a transação assinada
      const tx = await this.provider.sendTransaction(signedTx);
      console.log("Transação enviada. Hash:", tx.hash);
      return tx;
    } catch (error) {
      console.error("Erro ao enviar transação assinada:", error);
      throw error;
    }
  }
  
  async sendLegacyTransaction(params: LegacyTransactionParams, privateKey: string): Promise<ethers.providers.TransactionResponse> {
    const signedTx = await this.createLegacyTransaction(params, privateKey);
    return this.sendSignedTransaction(signedTx);
  }
}

// Hook para usar o serviço de transações legadas
export const useLegacyTransaction = () => {
  const { toast } = useToast();
  const service = new LegacyTransactionService();
  
  const initializeProvider = (infuraProjectId: string) => {
    const success = service.setInfuraProvider(infuraProjectId);
    if (success) {
      toast({
        title: "Provider inicializado",
        description: "Conexão com Infura estabelecida com sucesso",
      });
    } else {
      toast({
        title: "Erro de inicialização",
        description: "Falha ao conectar com Infura",
        variant: "destructive",
      });
    }
    return success;
  };
  
  const createTransaction = async (params: LegacyTransactionParams, privateKey: string) => {
    try {
      const signedTx = await service.createLegacyTransaction(params, privateKey);
      toast({
        title: "Transação criada",
        description: "Transação assinada com sucesso",
      });
      return signedTx;
    } catch (error: any) {
      toast({
        title: "Erro na transação",
        description: error.message || "Falha ao criar transação",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const sendTransaction = async (params: LegacyTransactionParams, privateKey: string) => {
    try {
      const tx = await service.sendLegacyTransaction(params, privateKey);
      toast({
        title: "Transação enviada",
        description: `Hash: ${tx.hash.substring(0, 10)}...`,
      });
      return tx;
    } catch (error: any) {
      toast({
        title: "Erro na transação",
        description: error.message || "Falha ao enviar transação",
        variant: "destructive",
      });
      return null;
    }
  };
  
  return {
    initializeProvider,
    createTransaction,
    sendTransaction,
  };
};
