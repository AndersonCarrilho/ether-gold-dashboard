import { loadRpcApiKey } from './settingsStorage';

const DEFAULT_PUBLIC_INFURA_PROJECT_ID_PLACEHOLDER = 'YOUR_DEFAULT_PUBLIC_INFURA_PROJECT_ID_PLACEHOLDER';

/**
 * Constructs the default RPC URL, prioritizing user-set keys.
 * @param networkName The network name (e.g., 'mainnet', 'sepolia'). Defaults to 'mainnet'.
 * @returns The RPC URL string.
 */
export function getDefaultRpcUrl(networkName: string = 'mainnet'): string {
  const userKey = loadRpcApiKey();
  const envInfuraKey = import.meta.env.VITE_DEFAULT_INFURA_KEY as string | undefined;

  if (userKey && userKey.trim() !== '') {
    console.log(`Using user-configured RPC key for Infura on ${networkName}.`);
    return `https://${networkName}.infura.io/v3/${userKey}`;
  } else if (envInfuraKey && envInfuraKey.trim() !== '') {
    console.log(`Using environment variable RPC key (VITE_DEFAULT_INFURA_KEY) for Infura on ${networkName}.`);
    return `https://${networkName}.infura.io/v3/${envInfuraKey}`;
  } else {
    console.warn(
      `Using placeholder default public Infura project ID for ${networkName}. ` +
      `This may be rate-limited or disabled. For stable access, provide an Infura key via Settings ` +
      `or set VITE_DEFAULT_INFURA_KEY in your environment.`
    );
    return `https://${networkName}.infura.io/v3/${DEFAULT_PUBLIC_INFURA_PROJECT_ID_PLACEHOLDER}`;
  }
}
