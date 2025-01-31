declare global {
    interface Window {
      ethereum: {
        request: (args: { method: 'eth_requestAccounts' }) => Promise<string[]>;
        isMetaMask?: boolean;
      };
    }
  }
  
import React, { useState } from "react";

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conecta MetaMask y obtiene la wallet del usuario
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setErrorMessage("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      // Solicita acceso a las cuentas de MetaMask
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setErrorMessage(null);
      }
    } catch (error: unknown) {
      setErrorMessage("Failed to connect to MetaMask. Please try again. " + error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-4">
          {walletAddress ? "Welcome!" : "Login or Register with MetaMask"}
        </h1>

        {walletAddress ? (
          <div className="text-center">
            <p className="text-gray-700 mb-4">Connected Wallet:</p>
            <p className="font-mono text-lg bg-gray-100 p-2 rounded">{walletAddress}</p>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Connect with MetaMask
            </button>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
