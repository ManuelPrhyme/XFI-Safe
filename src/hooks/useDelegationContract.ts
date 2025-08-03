import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';

const {account} = useWeb3

// Contract ABI (simplified for this example)
const CONTRACT_ABI = [
  "function delegate(address Address)",
  "function delegateToCustom(address delegateAddress)",
  "function getDelegation(address user) view returns (address delegate, uint256 timestamp, string delegationType, bool active)",
  "function getActiveStewards() view returns (address[] addresses, string[] names, uint256[] delegationCounts)",
  "function getDelegationStats() view returns (uint256 total, uint256 self, uint256 steward, uint256 custom)",
  "event VotingRightsDelegated(address indexed delegator, address indexed delegate, uint256 timestamp, string delegationType)"
];

// Contract address (placeholder - would be deployed contract address)
const CONTRACT_ADDRESS = "0xac27fa800955849d6d17cc8952ba9dd6eaa66187";

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

export const useDelegationContract = (signer: ethers.JsonRpcSigner | null) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [stewards, setStewards] = useState<Steward[]>([]);
  const [delegationInfo, setDelegationInfo] = useState<DelegationInfo | null>(null);
  const [stats, setStats] = useState<DelegationStats | null>(null);

  useEffect(() => {
    if (signer) {
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
      loadContractData();
    }
  }, [signer]);

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

  const delegateToSelf = async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.delegate(account);
      await tx.wait();
      await loadContractData(); // Refresh data
      return tx;
    } catch (error) {
      console.error('Error delegating to self:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const delegateToSteward = async (stewardAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.delegate(stewardAddress);
      await tx.wait();
      await loadContractData(); // Refresh data
      return tx;
    } catch (error) {
      console.error('Error delegating to steward:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const delegateToCustom = async (delegateAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    try {
      const tx = await contract.delegate(delegateAddress);
      await tx.wait();
      await loadContractData(); // Refresh data
      return tx;
    } catch (error) {
      console.error('Error delegating to custom address:', error);
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
    delegateToSelf,
    delegateToSteward,
    delegateToCustom,
    refreshData: loadContractData
  };
};