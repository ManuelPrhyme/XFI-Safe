import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { CONTRACT_ABI,CONTRACT_ADDRESS,CrossFi } from '../components/contractConfig';
import {createWalletClient,custom,parseEther} from 'viem'
import { deposit_amount } from '../components/DepositForm'
import { withdrawAmount } from '../components/DepositForm';

const WalletClient = createWalletClient({
  chain:CrossFi,
  transport:custom(window.ethereum)
});


export interface Steward {
  address: string;
  name: string;
  delegationCount: number;
}

export interface DelegationInfo {
  delegate: string;
  timestamp: number;
  delegationType: string;
  active: boolean;
}

export interface DelegationStats {
  total: number;
  self: number;
  steward: number;
  custom: number;
}

export let RunUP;

export const useDelegationContract = (signer: ethers.JsonRpcSigner | null) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [stewards, setStewards] = useState<Steward[]>([]);
  const [delegationInfo, setDelegationInfo] = useState<DelegationInfo | null>(null);
  const [stats, setStats] = useState<DelegationStats | null>(null);
  const [rerun, setRerun] = useState(false)

  const {account} = useWeb3()

  

  useEffect(() => {
    if (signer) {
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
      loadContractData();
    } 
    
    RunUP = rerun

  }, [signer, rerun]);

  //Get User Data
  const loadContractData = async () => {
    if (!contract) return;

    try {
      setLoading(true);

      // Load stewards
      const stewardsData = await contract.getActiveStewards();
      const stewardsList: Steward[] = stewardsData[0].map((address: string, index: number) => ({
        address,
        name: stewardsData[1][index],
        delegationCount: Number(stewardsData[2][index])
      }));
      setStewards(stewardsList);

      // Load delegation stats
      const statsData = await contract.getDelegationStats();
      setStats({
        total: Number(statsData[0]),
        self: Number(statsData[1]),
        steward: Number(statsData[2]),
        custom: Number(statsData[3])
      });

      // Load user's delegation info if signer is available
      if (signer) {
        const userAddress = await signer.getAddress();
        const delegationData = await contract.getDelegation(userAddress);
        setDelegationInfo({
          delegate: delegationData[0],
          timestamp: Number(delegationData[1]),
          delegationType: delegationData[2],
          active: delegationData[3]
        });
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDeposit = async () => {
    
    setLoading(true);

    try {

      const tx = await WalletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName:"depositToSafe",
        account: account,
        value: parseEther(deposit_amount)
      })
 
      await loadContractData(); 

      rerun ? setRerun(false) : setRerun(true);

      return tx;
      
    } catch (error) {
      console.error('Error Depositing XFI Tokens:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initiate_Withdraw = async () => {

    setLoading(true);
    try {

      const tx = await WalletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName:"userWithdraw",
        args:[parseEther(withdrawAmount)],
        account: account,
      })

      console.log("Withdraw..",tx)

      rerun ? setRerun(false) : setRerun(true);
      
      return tx;

    } catch (error) {
      console.error('Error initiating withdraw', error);
      throw error;

    } finally {
      setLoading(false);
    }
  };

  return {
    contract,
    loading,
    stewards,
    delegationInfo,
    stats,
    onDeposit,
    initiate_Withdraw,
    refreshData: loadContractData
  };
};