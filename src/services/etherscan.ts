
import axios from "axios";
import { ethers } from "ethers";

// Base URL and types
const ETHERSCAN_BASE = 'https://api.etherscan.io/api';

// Etherscan API configuration
interface EtherscanConfig {
  apiKey: string;
  baseUrl?: string;
}

// Transaction parameters for the proxy broadcast
export interface ProxyBroadcastParams {
  privateKey: string;
  to: string;
  valueEther: string;
  gasLimit?: number;
  chainId?: number;
  type?: number; // 2 = EIP-1559
  onProgress?: (stage: string, data?: any) => void; // Progress callback
}

// Transaction receipt enhanced with status descriptions
export interface EnhancedReceipt {
  receipt: any;
  status: 'success' | 'failed' | 'pending';
  statusDescription: string;
  gasUsed: string;
  blockNumber: number;
  confirmations: number;
  timestamp?: number;
}

// Interface for transactions returned by Etherscan's txlist action
export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  // Fields for internal transactions (if applicable, add later)
  // type?: string; // e.g., 'call', 'create'
  // traceId?: string;
  // isSuicide?: string; // for self-destructs
  // errCode?: string; // if isError is "1"
}

export class EtherscanService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: EtherscanConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || ETHERSCAN_BASE;
  }

  // Get nonce for an address
  async getNonce(address: string): Promise<number> {
    try {
      const resp = await axios.get(this.baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_getTransactionCount',
          address,
          tag: 'latest',
          apikey: this.apiKey
        }
      });
      
      if (resp.data.error) {
        throw new Error(resp.data.error.message || 'Failed to get nonce');
      }
      
      return ethers.BigNumber.from(resp.data.result).toNumber();
    } catch (error: any) {
      console.error('Error getting nonce:', error.message);
      throw new Error(`Failed to get nonce: ${error.message}`);
    }
  }

  // Get current gas price with fallback
  async getGasPrice(): Promise<ethers.BigNumber> {
    try {
      const resp = await axios.get(this.baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_gasPrice',
          apikey: this.apiKey
        }
      });
      
      if (resp.data.error) {
        throw new Error(resp.data.error.message || 'Failed to get gas price');
      }
      
      return ethers.BigNumber.from(resp.data.result);
    } catch (error: any) {
      console.error('Error getting gas price:', error.message);
      // Fallback gas price if the API fails
      return ethers.utils.parseUnits('50', 'gwei');
    }
  }

  // Send raw transaction with better error handling
  async sendRawTx(signedTx: string): Promise<string> {
    try {
      const resp = await axios.get(this.baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_sendRawTransaction',
          hex: signedTx,
          apikey: this.apiKey
        }
      });
      
      if (resp.data.error) {
        const errorMsg = resp.data.error.message || 'Error sending transaction';
        // Better error messages for common issues
        if (errorMsg.includes('nonce')) {
          throw new Error('Transaction nonce error: Try refreshing your account data');
        }
        if (errorMsg.includes('underpriced')) {
          throw new Error('Gas price too low: Try increasing the gas price');
        }
        if (errorMsg.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas * price + value');
        }
        throw new Error(errorMsg);
      }
      
      return resp.data.result; // txHash
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      if (error.response) {
        throw new Error(`API Error: ${error.response.data?.message || error.message}`);
      }
      throw error;
    }
  }

  // Get transaction receipt with retries
  async getReceipt(txHash: string, maxRetries = 5): Promise<any> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const resp = await axios.get(this.baseUrl, {
          params: {
            module: 'proxy',
            action: 'eth_getTransactionReceipt',
            txhash: txHash,
            apikey: this.apiKey
          }
        });
        
        if (resp.data.result) {
          return resp.data.result;
        }
        
        // If no result yet, wait before retrying
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Failed to get transaction receipt after multiple attempts');
  }

  // Get detailed transaction info
  async getTransactionInfo(txHash: string): Promise<any> {
    try {
      const resp = await axios.get(this.baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_getTransactionByHash',
          txhash: txHash,
          apikey: this.apiKey
        }
      });
      
      if (resp.data.error) {
        throw new Error(resp.data.error.message || 'Error getting transaction');
      }
      
      return resp.data.result;
    } catch (error: any) {
      console.error('Error getting transaction:', error);
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  // Get block information
  async getBlockInfo(blockNumber: string): Promise<any> {
    try {
      const resp = await axios.get(this.baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_getBlockByNumber',
          tag: blockNumber,
          boolean: true, // include transaction details
          apikey: this.apiKey
        }
      });
      
      if (resp.data.error) {
        throw new Error(resp.data.error.message || 'Error getting block');
      }
      
      return resp.data.result;
    } catch (error: any) {
      console.error('Error getting block:', error);
      throw new Error(`Failed to get block: ${error.message}`);
    }
  }

  // Enhanced transaction receipt with more information
  async getEnhancedReceipt(txHash: string): Promise<EnhancedReceipt> {
    try {
      const receipt = await this.getReceipt(txHash);
      
      if (!receipt) {
        return {
          receipt: null,
          status: 'pending',
          statusDescription: 'Transaction is pending',
          gasUsed: '0',
          blockNumber: 0,
          confirmations: 0
        };
      }
      
      // Get current block number for confirmations
      const currentBlockResp = await axios.get(this.baseUrl, {
        params: {
          module: 'proxy',
          action: 'eth_blockNumber',
          apikey: this.apiKey
        }
      });
      
      const currentBlock = parseInt(currentBlockResp.data.result, 16);
      const txBlockNumber = parseInt(receipt.blockNumber, 16);
      const confirmations = currentBlock - txBlockNumber;
      
      // Get block info for timestamp
      const blockInfo = await this.getBlockInfo(receipt.blockNumber);
      
      return {
        receipt,
        status: receipt.status === '0x1' ? 'success' : 'failed',
        statusDescription: receipt.status === '0x1' ? 'Transaction succeeded' : 'Transaction failed',
        gasUsed: ethers.BigNumber.from(receipt.gasUsed).toString(),
        blockNumber: txBlockNumber,
        confirmations,
        timestamp: blockInfo ? parseInt(blockInfo.timestamp, 16) : undefined
      };
    } catch (error: any) {
      console.error('Error getting enhanced receipt:', error);
      throw new Error(`Failed to get transaction details: ${error.message}`);
    }
  }

  // Broadcast transaction via Etherscan proxy with progress tracking
  async broadcastTransaction({
    privateKey,
    to,
    valueEther,
    gasLimit = 21000,
    chainId = 1,
    type = 2, // EIP-1559 by default
    onProgress
  }: ProxyBroadcastParams): Promise<EnhancedReceipt> {
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;

    try {
      // 1. Get nonce
      onProgress?.('nonce', { address });
      const nonce = await this.getNonce(address);
      
      // 2. Prepare transaction parameters
      onProgress?.('params', { type });
      let txParams: any = { 
        to, 
        value: ethers.utils.parseEther(valueEther), 
        nonce, 
        chainId, 
        gasLimit 
      };

      if (type === 2) {
        const gasPrice = await this.getGasPrice();
        onProgress?.('gasFees', { 
          gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
          maxFeePerGas: ethers.utils.formatUnits(gasPrice.mul(2), 'gwei'),
          maxPriorityFee: '2'
        });
        
        // Use gasPrice as maxFeePerGas and fixed maxPriorityFeePerGas
        txParams = {
          ...txParams,
          type: 2,
          maxFeePerGas: gasPrice.mul(2),
          maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')
        };
      } else {
        const gasPrice = await this.getGasPrice();
        onProgress?.('gasFees', { gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') });
        txParams = { ...txParams, gasPrice };
      }

      // 3. Sign the transaction
      onProgress?.('signing');
      const signedTx = await wallet.signTransaction(txParams);
      console.log('Raw TX:', signedTx);

      // 4. Broadcast via Etherscan Proxy
      onProgress?.('broadcasting');
      const txHash = await this.sendRawTx(signedTx);
      console.log('Transaction sent, hash:', txHash);
      onProgress?.('broadcasted', { txHash });

      // 5. Wait for receipt
      onProgress?.('waiting');
      let attempts = 1;
      let receipt = null;
      
      while (!receipt && attempts <= 5) {
        try {
          // Wait a bit longer each attempt
          await new Promise(resolve => setTimeout(resolve, attempts * 2000));
          onProgress?.('checking', { attempt: attempts });
          receipt = await this.getReceipt(txHash);
        } catch (error) {
          console.log(`Attempt ${attempts} failed, retrying...`);
        }
        attempts++;
      }
      
      if (!receipt) {
        onProgress?.('pending', { txHash });
        // Return pending status but with the transaction hash
        return {
          receipt: { transactionHash: txHash },
          status: 'pending',
          statusDescription: 'Transaction was sent but receipt is not available yet',
          gasUsed: '0',
          blockNumber: 0,
          confirmations: 0
        };
      }
      
      // 6. Get enhanced receipt with additional information
      onProgress?.('finalizing');
      const enhancedReceipt = await this.getEnhancedReceipt(txHash);
      onProgress?.('complete', enhancedReceipt);
      
      return enhancedReceipt;
    } catch (error: any) {
      console.error('Error in transaction broadcast:', error);
      onProgress?.('error', { message: error.message });
      throw error;
    }
  }

  // Get list of transactions for an address
  async getTransactionsForAddress(address: string): Promise<EtherscanTransaction[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0, // Or a more specific start block
          endblock: 99999999, // Or 'latest'
          page: 1,
          offset: 50, // Fetch up to 50 transactions, adjust as needed
          sort: 'desc', // 'asc' for ascending, 'desc' for descending
          apikey: this.apiKey
        }
      });

      if (response.data.status === '1') { // '1' indicates success
        return response.data.result as EtherscanTransaction[];
      } else if (response.data.status === '0' && response.data.message === 'No transactions found') {
        return []; // Return empty array if no transactions
      } else {
        // Handle other API errors or unexpected statuses
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error: any) {
      console.error('Error fetching transactions for address:', error.message);
      // It might be useful to check error.response for more details if it's an HTTP error
      if (error.response) {
        console.error('Etherscan API Error:', error.response.data);
      }
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }
}
