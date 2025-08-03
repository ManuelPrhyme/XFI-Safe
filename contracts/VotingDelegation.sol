// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VotingDelegation
 * @dev Contract for delegating voting rights for Unlock Protocol token (UP) on Base network
 */
contract VotingDelegation is Ownable, ReentrancyGuard {
    // Events
    event VotingRightsDelegated(
        address indexed delegator,
        address indexed delegate,
        uint256 timestamp,
        string delegationType
    );
    
    event StewardAdded(address indexed steward, string name);
    event StewardRemoved(address indexed steward);

    // Structs
    struct Delegation {
        address delegate;
        uint256 timestamp;
        string delegationType; // "self", "steward", "custom"
        bool active;
    }

    struct Steward {
        string name;
        bool active;
        uint256 delegationCount;
    }

    // State variables
    mapping(address => Delegation) public delegations;
    mapping(address => Steward) public stewards;
    address[] public stewardsList;
    
    uint256 public totalDelegations;
    uint256 public selfDelegations;
    uint256 public stewardDelegations;
    uint256 public customDelegations;

    // Unlock Protocol token contract address on Base (placeholder)
    address public constant UP_TOKEN = 0x1234567890123456789012345678901234567890;

    constructor() {
        // Initialize with some known Unlock Protocol stewards (placeholder addresses)
        _addSteward(0xAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEfAbCdEf, "Core Team Alpha");
        _addSteward(0x1234567890123456789012345678901234567891, "Core Team Beta");
        _addSteward(0x9876543210987654321098765432109876543210, "Community Lead");
    }

    /**
     * @dev Delegate voting rights to self
     */
    function delegateToSelf() external nonReentrant {
        _delegate(msg.sender, msg.sender, "self");
        selfDelegations++;
    }

    /**
     * @dev Delegate voting rights to a steward
     * @param stewardAddress Address of the steward
     */
    function delegateToSteward(address stewardAddress) external nonReentrant {
        require(stewards[stewardAddress].active, "Invalid steward address");
        
        _delegate(msg.sender, stewardAddress, "steward");
        stewards[stewardAddress].delegationCount++;
        stewardDelegations++;
    }

    /**
     * @dev Delegate voting rights to a custom address
     * @param delegateAddress Address to delegate to
     */
    function delegateToCustom(address delegateAddress) external nonReentrant {
        require(delegateAddress != address(0), "Invalid delegate address");
        require(delegateAddress != msg.sender, "Use delegateToSelf for self-delegation");
        
        _delegate(msg.sender, delegateAddress, "custom");
        customDelegations++;
    }

    /**
     * @dev Internal function to handle delegation logic
     */
    function _delegate(
        address delegator,
        address delegate,
        string memory delegationType
    ) internal {
        // Update delegation record
        delegations[delegator] = Delegation({
            delegate: delegate,
            timestamp: block.timestamp,
            delegationType: delegationType,
            active: true
        });

        totalDelegations++;

        emit VotingRightsDelegated(
            delegator,
            delegate,
            block.timestamp,
            delegationType
        );
    }

    /**
     * @dev Add a new steward (only owner)
     */
    function addSteward(address stewardAddress, string memory name) external onlyOwner {
        _addSteward(stewardAddress, name);
    }

    /**
     * @dev Internal function to add steward
     */
    function _addSteward(address stewardAddress, string memory name) internal {
        require(stewardAddress != address(0), "Invalid steward address");
        require(!stewards[stewardAddress].active, "Steward already exists");

        stewards[stewardAddress] = Steward({
            name: name,
            active: true,
            delegationCount: 0
        });

        stewardsList.push(stewardAddress);
        emit StewardAdded(stewardAddress, name);
    }

    /**
     * @dev Remove a steward (only owner)
     */
    function removeSteward(address stewardAddress) external onlyOwner {
        require(stewards[stewardAddress].active, "Steward does not exist");
        
        stewards[stewardAddress].active = false;
        emit StewardRemoved(stewardAddress);
    }

    /**
     * @dev Get delegation info for a user
     */
    function getDelegation(address user) external view returns (
        address delegate,
        uint256 timestamp,
        string memory delegationType,
        bool active
    ) {
        Delegation memory delegation = delegations[user];
        return (
            delegation.delegate,
            delegation.timestamp,
            delegation.delegationType,
            delegation.active
        );
    }

    /**
     * @dev Get all active stewards
     */
    function getActiveStewards() external view returns (
        address[] memory addresses,
        string[] memory names,
        uint256[] memory delegationCounts
    ) {
        uint256 activeCount = 0;
        
        // Count active stewards
        for (uint256 i = 0; i < stewardsList.length; i++) {
            if (stewards[stewardsList[i]].active) {
                activeCount++;
            }
        }

        addresses = new address[](activeCount);
        names = new string[](activeCount);
        delegationCounts = new uint256[](activeCount);

        uint256 index = 0;
        for (uint256 i = 0; i < stewardsList.length; i++) {
            if (stewards[stewardsList[i]].active) {
                addresses[index] = stewardsList[i];
                names[index] = stewards[stewardsList[i]].name;
                delegationCounts[index] = stewards[stewardsList[i]].delegationCount;
                index++;
            }
        }
    }

    /**
     * @dev Get delegation statistics
     */
    function getDelegationStats() external view returns (
        uint256 total,
        uint256 self,
        uint256 steward,
        uint256 custom
    ) {
        return (totalDelegations, selfDelegations, stewardDelegations, customDelegations);
    }
}