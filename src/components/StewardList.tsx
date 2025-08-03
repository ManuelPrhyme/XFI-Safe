import React from 'react';
import { Crown, Users, ExternalLink } from 'lucide-react';
import { Steward } from '../hooks/useDelegationContract';

interface StewardListProps {
  stewards: Steward[];
  loading: boolean;
  onDelegate: (address: string) => void;
  delegating: boolean;
}

export const StewardList: React.FC<StewardListProps> = ({
  stewards,
  loading,
  onDelegate,
  delegating,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Crown className="w-6 h-6 mr-2 text-yellow-600" />
        Unlock Protocol Stewards
      </h3>
      
      <div className="space-y-3">
        {stewards.map((steward) => (
          <div
            key={steward.address}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <div className="font-semibold text-gray-900">
                  {steward.name}
                </div>
                <a
                  href={`https://basescan.org/address/${steward.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {steward.address.slice(0, 8)}...{steward.address.slice(-6)}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Users className="w-4 h-4 mr-1" />
                {steward.delegationCount} delegations
              </div>
            </div>
            
            <button
              onClick={() => onDelegate(steward.address)}
              disabled={delegating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
            >
              {delegating ? 'Delegating...' : 'Delegate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};