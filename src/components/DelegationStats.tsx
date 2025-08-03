import React from 'react';
import { BarChart3, Users, UserCheck, Target } from 'lucide-react';
import { DelegationStats as StatsType } from '../hooks/useDelegationContract';

interface DelegationStatsProps {
  stats: StatsType | null;
  loading: boolean;
}

export const DelegationStats: React.FC<DelegationStatsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Delegations',
      value: stats.total,
      icon: BarChart3,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Self Delegations',
      value: stats.self,
      icon: UserCheck,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Steward Delegations',
      value: stats.steward,
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Custom Delegations',
      value: stats.custom,
      icon: Target,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
        Delegation Statistics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.color} mb-2`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {item.value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};