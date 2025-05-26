import { ethers, BigNumber } from 'ethers';
import { UNISWAP_V2_ROUTER_ADDRESS, UNISWAP_V3_QUOTER_V2_ADDRESS } from '../constants/contracts';
import { getDefaultRpcUrl } from '../lib/rpcUtils'; // Import the new utility

// Uniswap V2 Router ABI (can remain here or be moved to constants)
const UNISWAP_V2_ROUTER_ABI = [{
  "name": "getAmountsOut",
  "inputs": [
    { "type": "uint256", "name": "amountIn" },
    { "type": "address[]", "name": "path" }
  ],
  "outputs": [
    { "type": "uint256[]", "name": "amounts" }
  ],
  "stateMutability": "view",
  "type": "function"
}];

// Uniswap V3 QuoterV2 ABI (can remain here or be moved to constants)
const UNISWAP_V3_QUOTER_V2_ABI = [{
  "name": "quoteExactInputSingle",
  "inputs": [
    { "internalType": "address", "name": "tokenIn", "type": "address" },
    { "internalType": "address", "name": "tokenOut", "type": "address" },
    { "internalType": "uint24", "name": "fee", "type": "uint24" },
    { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
    { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
  ],
  "outputs": [
    { "internalType": "uint256", "name": "amountOut", "type": "uint256" }
  ],
  "stateMutability": "view", // Changed from nonpayable to view as per typical Quoter interfaces for static calls
  "type": "function"
}];

// WETH Address (Mainnet) could be imported from constants if needed:
// import { WETH_ADDRESS_MAINNET } from '../constants/contracts';

/**
 * Fetches the output amount for a given input amount and token pair from Uniswap V2.
 * @param tokenIn Address of the input token.
 * @param tokenOut Address of the output token.
 * @param amountIn BigNumber instance of the input amount (in wei or smallest unit).
 * @param provider Ethers.js provider instance.
 * @returns Promise<BigNumber> The output amount.
 */
export async function getUniswapV2Price(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  provider?: ethers.providers.Provider // Provider is now optional
): Promise<BigNumber> {
  const currentProvider = provider || new ethers.providers.StaticJsonRpcProvider(getDefaultRpcUrl('mainnet'));
  try {
    const router = new ethers.Contract(UNISWAP_V2_ROUTER_ADDRESS, UNISWAP_V2_ROUTER_ABI, currentProvider);
    const path = [tokenIn, tokenOut]; // Direct path
    
    // If dealing with ETH, ensure one of the tokens is WETH for V2 paths usually.
    // For simplicity, this example assumes direct pair or WETH is handled by the caller.
    // e.g., if tokenIn is ETH, it should be the WETH address for that network.
    // Future enhancement: For pairs without direct liquidity, a path via a common intermediary
    // like WETH (e.g., [tokenIn, WETH_ADDRESS, tokenOut]) might be necessary.

    const amounts = await router.getAmountsOut(amountIn, path);
    return amounts[amounts.length - 1];
  } catch (error: any) {
    console.error("Error fetching Uniswap V2 price:", error);
    throw new Error(`Failed to get V2 price: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Fetches the output amount for a given input amount, token pair, and pool fee from Uniswap V3.
 * @param tokenIn Address of the input token.
 * @param tokenOut Address of the output token.
 * @param amountIn BigNumber instance of the input amount (in wei or smallest unit).
 * @param poolFee The fee tier of the liquidity pool (e.g., 500, 3000, 10000).
 * @param provider Ethers.js provider instance.
 * @returns Promise<BigNumber> The output amount.
 */
export async function getUniswapV3Price(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  poolFee: number, // e.g., 3000 for 0.3%
  provider?: ethers.providers.Provider // Provider is now optional
): Promise<BigNumber> {
  const currentProvider = provider || new ethers.providers.StaticJsonRpcProvider(getDefaultRpcUrl('mainnet'));
  try {
    const quoter = new ethers.Contract(UNISWAP_V3_QUOTER_V2_ADDRESS, UNISWAP_V3_QUOTER_V2_ABI, currentProvider);
    const sqrtPriceLimitX96 = 0; // No price limit

    // Using callStatic as quoteExactInputSingle is a view-like function
    const amountOut = await quoter.callStatic.quoteExactInputSingle(
      tokenIn,
      tokenOut,
      poolFee,
      amountIn,
      sqrtPriceLimitX96
    );
    return amountOut;
  } catch (error: any) {
    console.error("Error fetching Uniswap V3 price:", error);
    // Check if the error is due to an invalid address, which can happen if QuoterV2 address is incorrect
    if (error.code === 'INVALID_ARGUMENT' && error.argument === '_name') { // Note: error.argument might be '_name' or 'name'
        console.error(`Possible invalid contract address for QuoterV2: ${UNISWAP_V3_QUOTER_V2_ADDRESS}. Or, an address argument to the function was invalid.`);
        throw new Error(`Failed to get V3 price: Invalid contract address or setup for QuoterV2, or invalid token address. Please verify addresses.`);
    }
    if (error.code === 'CALL_EXCEPTION') {
         console.error("Uniswap V3 Quoter call failed. This might be due to an invalid pool (tokenIn/tokenOut/fee combination) or insufficient liquidity.");
         throw new Error(`Failed to get V3 price: Pool may not exist or has insufficient liquidity for the requested trade. Details: ${error.reason || error.message}`);
    }
    throw new Error(`Failed to get V3 price: ${error.message || 'Unknown error'}`);
  }
}
