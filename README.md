<p align="center">
  <img src="aevia.png" alt="Aevia Image"/>
</p>

# Aevia Frontend

Frontend application for Aevia Protocol.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask browser extension

## Installation

1. Clone the repository:
```bash
git clone git@github.com:BeingFounders/aevia-frontend.git
cd aevia-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```bash
# API URL
VITE_API_URL=http://localhost:8000
```

## Development

Run the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:
```bash
npm run build
# or
yarn build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Supported Networks

- Sepolia (Chain ID: 11155111)
- Mantle Testnet (Chain ID: 5003)
- Mantle Mainnet (Chain ID: 5000)
- Base Testnet (Chain ID: 84532)

## Features

- Create and manage digital legacies
- Support for ERC20 and ERC721 tokens
- Email notifications
- Multi-network support
- MetaMask integration