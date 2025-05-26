// Define keys for localStorage
const ETHERSCAN_API_KEY_LS_KEY = 'etherscanApiKey';
const RPC_API_KEY_LS_KEY = 'rpcApiKey'; // For Infura or other generic RPC provider

// --- Etherscan API Key ---
export function saveEtherscanApiKey(apiKey: string): void {
  try {
    localStorage.setItem(ETHERSCAN_API_KEY_LS_KEY, apiKey);
  } catch (error) {
    console.error('Error saving Etherscan API key to localStorage:', error);
    // Optionally, notify the user if storage is full or unavailable
  }
}

export function loadEtherscanApiKey(): string | null {
  try {
    return localStorage.getItem(ETHERSCAN_API_KEY_LS_KEY);
  } catch (error) {
    console.error('Error loading Etherscan API key from localStorage:', error);
    return null;
  }
}

export function clearEtherscanApiKey(): void {
  try {
    localStorage.removeItem(ETHERSCAN_API_KEY_LS_KEY);
  } catch (error) {
    console.error('Error clearing Etherscan API key from localStorage:', error);
  }
}

// --- RPC API Key (e.g., Infura) ---
export function saveRpcApiKey(apiKey: string): void {
  try {
    localStorage.setItem(RPC_API_KEY_LS_KEY, apiKey);
  } catch (error) {
    console.error('Error saving RPC API key to localStorage:', error);
  }
}

export function loadRpcApiKey(): string | null {
  try {
    return localStorage.getItem(RPC_API_KEY_LS_KEY);
  } catch (error) {
    console.error('Error loading RPC API key from localStorage:', error);
    return null;
  }
}

export function clearRpcApiKey(): void {
  try {
    localStorage.removeItem(RPC_API_KEY_LS_KEY);
  } catch (error) {
    console.error('Error clearing RPC API key from localStorage:', error);
  }
}

// Optional: A function to get all settings (if more settings are added later)
export interface AppApiKeys {
  etherscan?: string | null;
  rpc?: string | null;
}

export function loadAllApiKeys(): AppApiKeys {
  return {
    etherscan: loadEtherscanApiKey(),
    rpc: loadRpcApiKey(),
  };
}
