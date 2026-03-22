# MUG Token Project

Full-stack Web3 project featuring:

- `MUG Contract`: an ERC20 token with faucet claims and owner minting (Foundry + OpenZeppelin)
- `MUG Dapp`: a React dashboard for claiming, transferring, and minting MUG tokens

The project is configured to target **Lisk Sepolia (chainId 4202)** by default.

## Project Structure

```text
MUG Token/
|- MUG Contract/   # Solidity smart contract, tests, deploy script
|- MUG Dapp/       # React + Vite + TypeScript frontend
`- README.md       # You are here
```

## Token Overview

| Property | Value |
|---|---|
| Name | MUG Token |
| Symbol | MUG |
| Decimals | 18 |
| Initial Supply | 1,000,000 MUG |
| Max Supply | 10,000,000 MUG |
| Faucet Claim Amount | 100 MUG |
| Faucet Cooldown | 24 hours |

Live deployment:

- Network: Lisk Sepolia
- Contract: `0x2BcA913D8F9752BB68A707B5d690678e63a9AD95`
- Explorer: https://sepolia-blockscout.lisk.com/token/0x2BcA913D8F9752BB68A707B5d690678e63a9AD95

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js 18+](https://nodejs.org/) and npm
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

Verify tools:

```bash
node -v
npm -v
forge --version
```

## 1) Smart Contract Setup (`MUG Contract`)

```bash
cd "MUG Contract"
forge install
```

### Run Tests

```bash
forge test -vv
```

### Build

```bash
forge build
```

### Deploy

Create a `.env` file in `MUG Contract`:

```env
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=https://rpc.sepolia-api.lisk.com
ETHERSCAN_API_KEY=optional_if_verifying
```

Load your environment and deploy:

```bash
forge script script/DeployMug.s.sol:MUGTokenDeploymentScript \
	--rpc-url $RPC_URL \
	--broadcast
```

On Windows PowerShell, use:

```powershell
forge script script/DeployMug.s.sol:MUGTokenDeploymentScript --rpc-url $env:RPC_URL --broadcast
```

## 2) Frontend Setup (`MUG Dapp`)

```bash
cd "MUG Dapp"
npm install
```

Create a `.env` file in `MUG Dapp`:

```env
VITE_CONTRACT_ADDRESS=0x2BcA913D8F9752BB68A707B5d690678e63a9AD95
VITE_CHAIN_ID=4202
VITE_RPC_URL=https://rpc.sepolia-api.lisk.com
VITE_EXPLORER_URL=https://sepolia-blockscout.lisk.com
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Run Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Frontend Scripts

From `MUG Dapp`:

- `npm run dev` - start Vite dev server
- `npm run build` - type-check + production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Contract Features

- `requestToken()`
	- Allows any address to claim `100 MUG`
	- Enforces `24-hour` cooldown per address
	- Prevents minting beyond max supply
- `mint(address to, uint256 amount)`
	- Owner-only mint
	- Prevents max supply overflow
	- Rejects zero-address recipient

## Typical Workflow

1. Run contract tests in `MUG Contract`.
2. Deploy contract and copy deployed address.
3. Set `VITE_CONTRACT_ADDRESS` in `MUG Dapp/.env`.
4. Start frontend with `npm run dev`.
5. Connect wallet on Lisk Sepolia and interact with claim/transfer/mint features.

## Troubleshooting

- `Invalid VITE_CONTRACT_ADDRESS in .env`
	- Ensure `VITE_CONTRACT_ADDRESS` is a valid `0x...` checksummed/hex address.
- Wallet on wrong network
	- Switch to the chain defined by `VITE_CHAIN_ID` (default `4202`).
- Claims revert with 24-hour error
	- `requestToken()` can only be called once every 24 hours per wallet.
- WalletConnect not working
	- Set a valid `VITE_WALLETCONNECT_PROJECT_ID` from WalletConnect Cloud.

## License

This project uses the MIT license for the Solidity contract. Set or update frontend licensing as needed for your release.
