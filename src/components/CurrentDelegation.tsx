import React from 'react';
import { CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { DelegationInfo } from '../hooks/useDelegationContract';

interface CurrentDelegationProps {
  delegationInfo: DelegationInfo | null;
  loading: boolean;
  account: string;
}

export const CurrentDelegation: React.FC<CurrentDelegationProps> = ({
  delegationInfo,
  loading,
  account,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!delegationInfo || !delegationInfo.active) {
    return (
      <div className="bg-white rounded-xl  p-6 border border-gray-100">
        {/* <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Current Delegation Status
        </h3>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">
            You haven't delegated your voting rights yet.
          </p>
        </div> */}
      </div>
    );
  }

  const delegateType = delegationInfo.delegationType;
  const isself = delegationInfo.delegate.toLowerCase() === account.toLowerCase();
  
  const getTypeInfo = () => {
    switch (delegateType) {
      case 'self':
        return {
          label: 'Self Delegation',
          description: 'You are delegating to yourself',
          color: 'text-green-600 bg-green-100',
        };
      case 'steward':
        return {
          label: 'Steward Delegation',
          description: 'You are delegating to an Unlock Protocol steward',
          color: 'text-purple-600 bg-purple-100',
        };
      case 'custom':
        return {
          label: 'Custom Delegation',
          description: 'You are delegating to a custom address',
          color: 'text-orange-600 bg-orange-100',
        };
      default:
        return {
          label: 'Unknown',
          description: 'Delegation type unknown',
          color: 'text-gray-600 bg-gray-100',
        };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
        Current Delegation Status
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </div>
            <p className="text-gray-600 text-sm mt-2">{typeInfo.description}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Delegated To:</p>
              <div className="flex items-center mt-1">
                <p className="font-mono text-sm text-gray-900">
                  {delegationInfo.delegate.slice(0, 8)}...{delegationInfo.delegate.slice(-6)}
                </p>
                <a
                  href={`https://basescan.org/address/${delegationInfo.delegate}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Delegated On:</p>
              <p className="text-sm text-gray-600">
                {new Date(delegationInfo.timestamp * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};