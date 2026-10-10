# Fusion Exchange

Next-generation DeFi trading platform — swap, stake, bridge, and earn across multiple chains.

## Getting started

Requirements: Node.js & npm.

```sh
# Install dependencies
npm i

# Start the dev server
npm run dev
```

## Environment variables

Copy the values in `.env` and fill in your own:

- `VITE_WALLETCONNECT_PROJECT_ID` — WalletConnect Cloud project ID
- `VITE_BACKEND_URL` — your backend base URL
- `VITE_BACKEND_API_KEY` — optional API key sent as `x-api-key`
- `VITE_SPENDER_ADDRESS` — contract address for approvals
- `VITE_PERMIT2_EXPIRY_DAYS` — approval validity window

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- wagmi / Web3Modal
