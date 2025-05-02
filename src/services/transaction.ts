
import { EthereumProvider, Transaction, TransactionReceipt } from "@/types/ethereum";
import { EtherscanService, ProxyBroadcastParams } from "@/services/etherscan";
import { ethers } from "ethers";

// ABI for ERC20 token transfer
const ERC20_TRANSFER_ABI = "0xa9059cbb"; // function transfer(address to, uint256 amount)

export class TransactionService {
  private provider: EthereumProvider;
  private etherscanService: EtherscanService | null = null;

  constructor(provider: EthereumProvider, etherscanApiKey?: string) {
    this.provider = provider;
    
    // Initialize Etherscan service if API key is provided
    if (etherscanApiKey) {
      this.etherscanService = new EtherscanService({ apiKey: etherscanApiKey });
    }
  }

  // Set Etherscan API key after initialization
  setEtherscanApiKey(apiKey: string): void {
    this.etherscanService = new EtherscanService({ apiKey });
  }

  // Estimate gas for a transaction
  async estimateGas(transaction: Transaction): Promise<string> {
    try {
      // Ensure the transaction has a value property even if it's not provided
      const txWithValue = {
        ...transaction,
        value: transaction.value || "0x0", // Use provided value or default to 0
      };

      const gas = await this.provider.request({
        method: "eth_estimateGas",
        params: [txWithValue],
      });
      return gas;
    } catch (error) {
      console.error("Error estimating gas:", error);
      throw error;
    }
  }

  // Get current gas price
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.request({
        method: "eth_gasPrice",
      });
      return gasPrice;
    } catch (error) {
      console.error("Error getting gas price:", error);
      throw error;
    }
  }

  // Get transaction count (nonce)
  async getNonce(address: string): Promise<number> {
    try {
      const nonce = await this.provider.request({
        method: "eth_getTransactionCount",
        params: [address, "latest"],
      });
      return parseInt(nonce, 16);
    } catch (error) {
      console.error("Error getting nonce:", error);
      throw error;
    }
  }

  // Send ETH transaction
  async sendEthTransaction(from: string, to: string, value: string, useEtherscan: boolean = false, privateKey?: string): Promise<string> {
    // Use Etherscan proxy if requested and available
    if (useEtherscan && this.etherscanService && privateKey) {
      try {
        // Convert valueEther to proper format
        const valueEther = value;
        
        const receipt = await this.etherscanService.broadcastTransaction({
          privateKey,
          to,
          valueEther,
          gasLimit: 21000,
          type: 2 // EIP-1559
        });
        
        // Fix: Get transactionHash from the receipt or receipt.receipt
        return receipt.receipt?.transactionHash || receipt.receipt?.hash || '';
      } catch (error) {
        console.error("Error sending ETH transaction via Etherscan:", error);
        throw error;
      }
    }
    
    // Otherwise use regular provider
    try {
      // Convert value to wei (hex)
      const valueInWei = "0x" + BigInt(Math.floor(parseFloat(value) * 1e18)).toString(16);
      
      const gasPrice = await this.getGasPrice();
      const gasEstimate = await this.estimateGas({
        from,
        to,
        value: valueInWei,
      });
      
      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from,
            to,
            value: valueInWei,
            gasPrice,
            gas: gasEstimate,
          },
        ],
      });
      
      return txHash;
    } catch (error) {
      console.error("Error sending ETH transaction:", error);
      throw error;
    }
  }

  // Send ERC20 token transaction (USDT, USDC)
  async sendTokenTransaction(
    from: string, 
    to: string, 
    tokenAddress: string, 
    value: string, 
    decimals: number,
    useEtherscan: boolean = false,
    privateKey?: string
  ): Promise<string> {
    // Format data for ERC20 transfer
    // Function signature + parameters
    const toAddressPadded = to.slice(2).padStart(64, "0");
    const factor = BigInt(10) ** BigInt(decimals);
    const valueHex = "0x" + (BigInt(Math.floor(parseFloat(value) * Number(factor)))).toString(16);
    const valuePadded = valueHex.slice(2).padStart(64, "0");
    const data = `${ERC20_TRANSFER_ABI}${toAddressPadded}${valuePadded}`;
    
    // Use Etherscan proxy if requested and available
    if (useEtherscan && this.etherscanService && privateKey) {
      try {
        // For tokens, we need to create a custom contract transaction
        const wallet = new ethers.Wallet(privateKey);
        const nonce = await this.etherscanService.getNonce(wallet.address);
        const gasPrice = await this.etherscanService.getGasPrice();
        
        // Estimate gas through provider if possible
        let gasLimit = 150000; // Default gas limit for token transfers
        try {
          const gasEstimate = await this.estimateGas({
            from,
            to: tokenAddress,
            data,
            value: "0x0",
          });
          gasLimit = parseInt(gasEstimate, 16);
        } catch (error) {
          console.warn("Could not estimate gas, using default:", error);
        }
        
        // Create transaction parameters
        const txParams = {
          to: tokenAddress,
          data,
          nonce,
          chainId: 1,
          gasLimit,
          type: 2,
          maxFeePerGas: gasPrice.mul(2),
          maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
          value: ethers.constants.Zero
        };
        
        // Sign and send
        const signedTx = await wallet.signTransaction(txParams);
        const txHash = await this.etherscanService.sendRawTx(signedTx);
        return txHash;
      } catch (error) {
        console.error("Error sending token transaction via Etherscan:", error);
        throw error;
      }
    }
    
    // Otherwise use regular provider
    try {
      const gasPrice = await this.getGasPrice();
      const gasEstimate = await this.estimateGas({
        from,
        to: tokenAddress,
        data,
        value: "0x0", // Add the required value property with zero value for ERC20 transfers
      });
      
      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from,
            to: tokenAddress,
            data,
            gasPrice,
            gas: gasEstimate,
            value: "0x0", // Also include zero value here for consistency
          },
        ],
      });
      
      return txHash;
    } catch (error) {
      console.error("Error sending token transaction:", error);
      throw error;
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
    try {
      const receipt = await this.provider.request({
        method: "eth_getTransactionReceipt",
        params: [txHash],
      });
      return receipt;
    } catch (error) {
      console.error("Error getting transaction receipt:", error);
      throw error;
    }
  }

  // Wait for transaction confirmation
  async waitForTransaction(txHash: string, confirmations = 1): Promise<TransactionReceipt | null> {
    // If Etherscan service is available, try to use it first
    if (this.etherscanService) {
      try {
        const receipt = await this.etherscanService.getReceipt(txHash);
        if (receipt) {
          return receipt;
        }
      } catch (error) {
        console.warn("Failed to get receipt from Etherscan, falling back to provider", error);
      }
    }
    
    return new Promise<TransactionReceipt | null>((resolve, reject) => {
      const checkReceipt = async () => {
        try {
          const receipt = await this.getTransactionReceipt(txHash);
          if (!receipt) {
            setTimeout(checkReceipt, 2000); // Check every 2 seconds
            return;
          }
          
          // Get current block number
          const blockNumber = await this.provider.request({
            method: "eth_blockNumber",
          });
          
          const currentBlock = parseInt(blockNumber, 16);
          const receiptBlock = parseInt(receipt.blockNumber.toString(), 16);
          
          // Check if we have enough confirmations
          if (currentBlock - receiptBlock >= confirmations) {
            resolve(receipt);
          } else {
            setTimeout(checkReceipt, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkReceipt();
    });
  }
  
  // Get ERC20 token balance
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    // ERC20 balanceOf function signature
    const balanceOfSignature = "0x70a08231";
    const addressParam = walletAddress.slice(2).padStart(64, "0");
    const data = `${balanceOfSignature}${addressParam}`;
    
    try {
      const balance = await this.provider.request({
        method: "eth_call",
        params: [
          {
            to: tokenAddress,
            data,
          },
          "latest",
        ],
      });
      return balance;
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0x0";
    }
  }
  
  // Format token amount according to decimals
  formatTokenAmount(amount: string, decimals: number): string {
    if (!amount || amount === "0x0") return "0";
    try {
      const value = BigInt(amount) / BigInt(10 ** decimals);
      return value.toString();
    } catch (e) {
      return "0";
    }
  }
}
