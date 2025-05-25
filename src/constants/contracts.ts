// src/constants/contracts.ts

/**
 * Uniswap V2 Router Address (Mainnet)
 */
export const UNISWAP_V2_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

/**
 * Uniswap V3 QuoterV2 Address (Mainnet)
 * This is the common QuoterV2 address used for quoting exact input single-hop trades.
 * Ensure this is the correct address for the network you are targeting (Mainnet).
 * The previous address in uniswapService.ts had a typo '0x61fFE014bA17989E743c5F6dH4c7889925a54012'
 * The corrected address is '0x61fFE014bA17989E743c5F6d4c7889925a54012'.
 */
export const UNISWAP_V3_QUOTER_V2_ADDRESS = '0x61fFE014bA17989E743c5F6d4c7889925a54012';

// Other contract addresses can be added here as needed.
// For example, WETH address:
// export const WETH_ADDRESS_MAINNET = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
