# Web3 Dashboard & Flash Loan Toolkit

This project is a sophisticated Web3 dashboard application designed for interacting with the Ethereum blockchain. It includes standard wallet functionalities and advanced tools for exploring and executing flash loans.

## Features

*   **Wallet Connectivity:** Connect your Ethereum wallet (e.g., MetaMask) to interact with the application.
*   **Dashboard Overview:** View your connected wallet's ETH balance and a summary of recent transactions fetched directly from Etherscan.
*   **Transaction Tracking:** Dedicated page to browse your full Ethereum transaction history with search and filtering capabilities (filter by type: Send/Receive).
*   **Flash Loan Utilities:**
    *   ### Basic Flash Loan Execution
        *   Interface to interact with a pre-deployed `FlashLoanProxy` compatible smart contract.
        *   Prepare and execute flash loans by specifying the proxy, provider, token, and amount.
    *   ### Client-Side Strategy Simulator
        *   Estimate potential profits from a two-step arbitrage strategy (e.g., borrow Token A, swap A -> B on DEX 1, swap B -> A on DEX 2) using user-provided prices.
        *   Includes calculation of estimated flash loan fees.
        *   Disclaimer: This is a simplified client-side estimation for educational purposes.
    *   ### Advanced Local Simulation Guide
        *   In-app comprehensive guide on setting up a local Hardhat mainnet fork for advanced flash loan testing.
        *   Includes instructions for deploying an example `FlashLoanProxy` contract, and connecting Metamask to a local forked environment.
*   **Other Features:** Standard utilities like sending ETH (Send page), viewing received assets (Receive page - shows QR code for address), and managing application settings (Settings page). The Tokens page is a placeholder.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui (UI components)
- Tailwind CSS
- Ethers.js (for Ethereum interaction)
- Lucide React (icons)
- React Router DOM (navigation)
- TanStack React Query (data fetching - though not extensively used in current snapshot)
- Sonner (toast notifications)

## Getting Started Locally

To run this project on your local machine:

1.  **Prerequisites:**
    *   [Node.js](https://nodejs.org/) (v18.x or later recommended) and npm.
    *   Git.

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/lovable-labs/cd712342-9a8c-493b-beb7-9c9f5852a0d1.git 
    # Replace with your fork's URL if applicable
    cd cd712342-9a8c-493b-beb7-9c9f5852a0d1 
    # Or your chosen directory name
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables (Optional but Recommended):**
    *   Create a `.env` file in the project root. You can copy `.env.example` if it exists, or create a new one.
    *   For full functionality, particularly for fetching transaction history from Etherscan without hitting public rate limits, add your Etherscan API key:
        ```env
        VITE_ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY_HERE
        ```
    *   *Note: The application uses a placeholder API key ('YOUR\_ETHERSCAN\_API\_KEY') for Etherscan if this variable is not set. This placeholder will likely be rate-limited or may not work for extensive use. It is strongly recommended to use your own API key.*

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:5173` (or as specified by Vite).

## Editing the Code

There are several ways to edit this application:

*   **Local IDE (Recommended for Development):**
    *   Follow the "Getting Started Locally" section above.
    *   Use your preferred IDE (e.g., VS Code) to edit the code.
    *   Push changes to your Git repository.

*   **GitHub Codespaces:**
    *   Navigate to the main page of the repository on GitHub.
    *   Click on the "Code" button and select the "Codespaces" tab.
    *   Create a new codespace to get a cloud-based development environment.

*   **Directly in GitHub:**
    *   For minor edits, you can navigate to files in the GitHub repository and use the "Edit" (pencil icon) feature.

## Lovable Platform Integration

This project was initially scaffolded and can be further developed using the Lovable platform.

*   **Project Link**: [Lovable Project Dashboard](https://lovable.dev/projects/cd712342-9a8c-493b-beb7-9c9f5852a0d1) (Note: This link points to the original Lovable project which might differ from your forked/cloned version).
*   **Editing with Lovable**: Visit the project link above to use Lovable's AI-assisted development features. Changes made via Lovable can be committed back to the connected repository.
*   **Deployment**: To deploy this project via Lovable, open the project in Lovable and navigate to Share -> Publish.
*   **Custom Domain**: To connect a custom domain via Lovable, go to Project > Settings > Domains and click "Connect Domain". Read more at [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide).
