
export interface EthereumProvider {
  isMetaMask?: boolean;
  on?: (event: string, callback: any) => void;
  removeListener?: (event: string, callback: any) => void;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
}

export interface WalletState {
  accounts: string[];
  balance: string;
  chainId: string;
  connected: boolean;
  provider: EthereumProvider | null;
}

export interface Transaction {
  from: string;
  to: string;
  value?: string; // tornando o value opcional para compatibilidade
  gasPrice?: string;
  gasLimit?: string;
  data?: string;
  nonce?: number;
}

export interface TransactionReceipt {
  status: boolean;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to: string;
  contractAddress: string | null;
  cumulativeGasUsed: number;
  gasUsed: number;
  logs: any[];
  logsBloom: string;
  effectiveGasPrice: string;
}

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI?: string;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}
