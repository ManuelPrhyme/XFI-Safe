import React, { useState, useEffect } from 'react';
import { Vote, Github, ExternalLink, Heading3 } from 'lucide-react';
import { useWeb3 } from './hooks/useWeb3';
import { useDelegationContract } from './hooks/useDelegationContract';
import { WalletConnection } from './components/WalletConnection';
import { DelegationStats } from './components/DelegationStats';
import { StewardList } from './components/StewardList';
import { DepositForm } from './components/DepositForm';
import { CurrentDelegation } from './components/CurrentDelegation';
import { deposit_amount } from './components/DepositForm';
import { Coins } from 'lucide-react';
import { createPublicClient, http, formatEther  } from 'viem';
import { CONTRACT_ABI,CONTRACT_ADDRESS, CrossFi } from './components/contractConfig';
import { ethers } from 'ethers';
import {RunUP} from './hooks/useDelegationContract'


const PublicClient =  createPublicClient({
  chain: CrossFi,
  transport: http()
})

function App() {
  const {
    account,
    signer,
    isConnecting,
    isConnected,
    isOnCrossFi,
    connectWallet,
    switchtoCrossFi,
    disconnect
  } = useWeb3();

  const {
    loading,
    stewards,
    delegationInfo,
    stats,
    onDeposit,
    initiate_Withdraw,
  } = useDelegationContract(signer);

  const [transactionStatus, setTransactionStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [Stake,setStake] = useState<any>();
  const [Reallocated,setReallocated] = useState<any>();
  const [Unstake,setUnstake] = useState<any>();


  

  useEffect(()=>{

    const getData = async () => {

       const Data = await PublicClient.simulateContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName:"unloadData",
          account: account
       })

      console.log("Data:....", Data.result, account)

      setStake(Data.result[0])
      setReallocated(Data.result[1])
      setUnstake(Data.result[3])
  }

  
    getData()
    console.log("The Stake...", Stake)

  },[account, Stake, RunUP])

  const handleDeposit = async () => {
    try {
      await onDeposit();
      setTransactionStatus({
        type: 'success',
        message: 'Successfully Deposited '+deposit_amount+' XFI tokens',
      });
    } catch (error) {
      setTransactionStatus({
        type: 'error',
        message: 'Failed to Deposit XFI Tokens.',
      });
    }
  };


  const initWithdraw = async () => {
    try {
      await initiate_Withdraw();
      setTransactionStatus({
        type: 'success',
        message: 'Successfully initiated withdraw',
      });
    } catch (error) {
      setTransactionStatus({
        type: 'error',
        message: 'Failed to initiate withdraw. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Vote className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">XFI-Safe</h1>
                  <p className="text-sm text-gray-600">Earn reward on your deposit</p>
                </div>
              </div>
            </div>

           
            
            <div className="flex items-center space-x-4">
             
               <button
            style={{display: account ? 'flex' : 'none'}}
            onClick={disconnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
          >
            {!isConnecting ? 'Disconnect' : 'Disconnecting...'}
          </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Save your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">XFI Tokens</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
           Earn a 5% annual reward by securely saving your XFI tokens on the Cross Finance.
          </p>
        </div>


        {transactionStatus.type && (
          <div className={`mb-8 p-4 rounded-lg ${
            transactionStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{transactionStatus.message}</p>
            <button
              onClick={() => setTransactionStatus({ type: null, message: '' })}
              className="text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex space-x-4 justify-around mb-6 bg-gray-100 p-1 rounded-lg">
                <div
                  className={`flex py-2 px-4 align-center rounded-md font-medium transition-colors bg-white text-blue-600 shadow-sm'`}>
                 
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 
                  to-purple-600">
                  In Stake: <span className=" font-bold text-gray-900 mb-4"> {Stake ? Number(formatEther(Stake)).toFixed(3) : ".."} XFI </span>
                </h3>

                </div>

                {/* <div 
                  style={{display: Unstake && Number((formatEther(Unstake))/86400) <= 7? 'flex' : 'none'}}
                  className={`flex py-2 px-4 align-center rounded-md font-medium transition-colors bg-white text-blue-600 shadow-sm'`}>
                 
                  {
                  Number((formatEther(Unstake))/86400) <= 7 ?
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 
                  to-purple-600">

                  <span>Unstaking In:</span> {
                    (Number(formatEther(Unstake))/86400).toFixed(0) > 0 ? 
                  <span className=" font-bold text-gray-900 mb-4"> {
                  (Number(formatEther(Unstake))/86400).toFixed(0)} Days</span> :

                  (Number(formatEther(Unstake))/3600).toFixed(0) > 0 ?
                  <span className=" font-bold text-gray-900 mb-4"> {
                  (Number(formatEther(Unstake))/3600).toFixed(0)} Hours</span> : 
                  
                  (Number(formatEther(Unstake))/60).toFixed(0) > 0 ? 
                  <span className=" font-bold text-gray-900 mb-4"> {
                  (Number(formatEther(Unstake))/60).toFixed(0)} Minutes</span> : 

                  
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 
                  to-purple-600">
                  Unstaked</h3>
                }
                  
                
                </h3> :

                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 
                  to-purple-600">
                  Un..staked</h3>
                
              }

                </div> */}

                {/* <div
                  style={{display: Reallocated ? 'flex' : 'none'}}
                  className={`flex py-2 px-4 align-center rounded-md font-medium transition-colors bg-white text-blue-600 shadow-sm'`}>
                 
                   <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 
                  to-pink-600">
                  Reallocated: <span className=" font-bold text-gray-900 mb-4"> { Number(formatEther(Reallocated)).toFixed(3)} XFI </span>
                </h3> 

                </div> */}

                

                {/* <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Save your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 
                  to-purple-600">XFI Tokens</span>
                </h2> */}


                {/* <button
                  onClick={() => setSelectedTab('custom')}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    selectedTab === 'custom'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Target className="w-4 h-4 inline mr-2" />
                  Withdraw
                </button> */}
              </div>


        <div className="mb-8">
          <WalletConnection
            account={account}
            isConnecting={isConnecting}
            isOnCrossFi={isOnCrossFi}
            connectWallet={connectWallet}
            switchtoCrossFi={switchtoCrossFi}
          />
        </div>

        {isConnected && isOnCrossFi && (
          <>
        
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">

              <DepositForm
                account={account!}
                onDeposit={handleDeposit}
                initiateWithdraw={initWithdraw}
                loading={loading}
              />
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200 mt-16">
          <p className="text-gray-600">
            Built for the Cross Finance community.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Contract Address: <a className="text-green-500" href="https://test.xfiscan.com/address/0xc753e7cb4cc1f26c0bcc363d2106d22690579f53">0xc7...9f53</a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;