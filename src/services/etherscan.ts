
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
    const resp = await axios.get(this.baseUrl, {
      params: {
        module: 'proxy',
        action: 'eth_getTransactionCount',
        address,
        tag: 'latest',
        apikey: this.apiKey
      }
    });
    return ethers.BigNumber.from(resp.data.result).toNumber();
  }

  // Get current gas price
  async getGasPrice(): Promise<ethers.BigNumber> {
    const resp = await axios.get(this.baseUrl, {
      params: {
        module: 'proxy',
        action: 'eth_gasPrice',
        apikey: this.apiKey
      }
    });
    return ethers.BigNumber.from(resp.data.result);
  }

  // Send raw transaction
  async sendRawTx(signedTx: string): Promise<string> {
    const resp = await axios.get(this.baseUrl, {
      params: {
        module: 'proxy',
        action: 'eth_sendRawTransaction',
        hex: signedTx,
        apikey: this.apiKey
      }
    });
    if (resp.data.error) {
      throw new Error(resp.data.error.message || 'Error sending transaction');
    }
    return resp.data.result; // txHash
  }

  // Get transaction receipt
  async getReceipt(txHash: string): Promise<any> {
    const resp = await axios.get(this.baseUrl, {
      params: {
        module: 'proxy',
        action: 'eth_getTransactionReceipt',
        txhash: txHash,
        apikey: this.apiKey
      }
    });
    return resp.data.result;
  }

  // Broadcast transaction via Etherscan proxy
  async broadcastTransaction({
    privateKey,
    to,
    valueEther,
    gasLimit = 21000,
    chainId = 1,
    type = 2 // EIP-1559 by default
  }: ProxyBroadcastParams): Promise<any> {
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;

    // 1. Get nonce
    const nonce = await this.getNonce(address);

    // 2. Prepare transaction parameters
    let txParams: any = { 
      to, 
      value: ethers.utils.parseEther(valueEther), 
      nonce, 
      chainId, 
      gasLimit 
    };

    if (type === 2) {
      const gasPrice = await this.getGasPrice();
      // Use gasPrice as maxFeePerGas and fixed maxPriorityFeePerGas
      txParams = {
        ...txParams,
        type: 2,
        maxFeePerGas: gasPrice.mul(2),
        maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')
      };
    } else {
      const gasPrice = await this.getGasPrice();
      txParams = { ...txParams, gasPrice };
    }

    // 3. Sign the transaction
    const signedTx = await wallet.signTransaction(txParams);
    console.log('Raw TX:', signedTx);

    // 4. Broadcast via Etherscan Proxy
    const txHash = await this.sendRawTx(signedTx);
    console.log('Transaction sent, hash:', txHash);

    // 5. Wait for receipt and return it
    const receipt = await this.getReceipt(txHash);
    console.log('Receipt:', receipt);
    return receipt;
  }
}
