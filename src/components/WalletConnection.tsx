import React from 'react';
import { Wallet, AlertCircle } from 'lucide-react';

interface WalletConnectionProps {
  account: string | null;
  isConnecting: boolean;
  isOnBase: boolean;
  connectWallet: () => void;
  switchToBase: () => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  account,
  isConnecting,
  isOnBase,
  connectWallet,
  switchToBase,
}) => {
  if (!account) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your wallet to start delegating your UP voting rights
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  if (!isOnBase) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800">
              Switch to Base Network
            </h3>
            <p className="text-yellow-700 mt-1">
              This application requires the Base network to function properly
            </p>
          </div>
          <button
            onClick={switchToBase}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
        <div>
          <p className="text-green-800 font-medium">Connected to Base Network</p>
          <p className="text-green-600 text-sm">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
};