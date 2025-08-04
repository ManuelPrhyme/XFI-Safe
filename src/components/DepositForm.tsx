import React, { useState, useEffect } from 'react';
import {Coins, Send, User, Users, Target } from 'lucide-react';

interface DepositFormProps {
  account: string;
  onDeposit: () => void;
  initiateWithdraw: () => void;
  loading: boolean;
}

export let deposit_amount: string;
export let withdrawAmount:string;

export const DepositForm: React.FC<DepositFormProps> = ({
  account,
  onDeposit,
  initiateWithdraw,
  loading,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedTab, setSelectedTab] = useState<'self' | 'custom'>('self');
  const [depositAmount, setDepositAmount] = useState('')
  

  useEffect(()=>{
      
    deposit_amount = depositAmount
    withdrawAmount = amount

  },[depositAmount, amount])

  const inititate = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > 0) {
      initiateWithdraw();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Send className="w-6 h-6 mr-2 text-green-600" />
        Deposit your XFI Tokens
      </h3>

      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('self')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            selectedTab === 'self'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Coins className="w-4 h-4 inline mr-2" />
          Deposit
        </button>
        <button
          onClick={() => setSelectedTab('custom')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            selectedTab === 'custom'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Withdraw
        </button>
      </div>

      {selectedTab === 'self' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium mb-2">Enter XFI amount to deposit</p>
            <input type="number" className="pl-[8px] space-y-4 text-gray-800 border-2 border-blue-500 focus:border-blue-500 focus:outline-none
             rounded-md py-1 text-lg mb-4" placeholder='2 XFI' onChange={(e)=>{setDepositAmount(e.target.value)}} />
           
          </div>
          
          <button
            onClick={onDeposit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
          >
            {loading ? 'Depositing...' : 'Deposit'}
          </button>
        </div>
      )}

      {selectedTab === 'custom' && (
        <form onSubmit={inititate} className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-orange-800 font-medium mb-2">Enter Withdraw Amount</p>
            <p className="text-orange-600 text-sm">
              <span className="text-red-500 font-[800]">Note</span> The yield will subsequently be calculated for the unwithdrawn balance
            </p>
          </div>
          
          <div>
            {/* <label htmlFor="customAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Ethereum Address
            </label> */}
            
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2 XFI"
             // className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-sm"
            className="pl-[8px] space-y-4 text-gray-800 border-2 border-blue-500 focus:border-blue-500 focus:outline-none
             rounded-md py-1 text-lg mb-2"
            />
            {amount && (
              <p className="text-red-600 text-sm">Enter value below {}## XFI</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={Number(amount) <= 0 || loading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
          >
            <Target className="w-5 h-5 mr-2" />
            {loading ? 'Intiating...' : 'Initiate Withdraw'}
          </button>
        </form>
      )}
    </div>
  );
};