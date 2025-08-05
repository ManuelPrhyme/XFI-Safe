// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract safeDeposit is ReentrancyGuard {

    address immutable owner;
    uint256 ownersProfits;
    uint constant withdrawThreshold = 604800;

    uint withdrawnToInvest;
    uint returnedfromInvestment;
    uint owedToContract;
    
    uint constant annualYieldPercent = 5;
    uint constant secondsInYear = 365 * 24 * 60 * 60;
    uint constant yieldRatePerSecond = annualYieldPercent * 1e18 / 100 / secondsInYear;

   
    address[] public depositorsList;
    mapping(address => uint) private deposits;
    mapping(address => uint) withdrawInits;


    mapping(address => uint) private lastYieldTimestamp;

    modifier Own(){
        require(msg.sender == owner,"Unauthorized");
        _;
    }

    constructor(){
        owner = msg.sender;
    }

    function _updateYield(address user) internal {
        uint lastTime = lastYieldTimestamp[user];
        if (lastTime == 0) {
            lastYieldTimestamp[user] = block.timestamp;
            return;
        }
        uint timeElapsed = block.timestamp - lastTime;
        if(timeElapsed > 0 && deposits[user] > 0) {
            
            uint yield = deposits[user] * yieldRatePerSecond * timeElapsed / 1e18;
            deposits[user] += yield;
        }
        lastYieldTimestamp[user] = block.timestamp;
    }

    function Initiate_Withdraw(address _Address) private {
        if(withdrawInits[_Address] == 0){
            withdrawInits[_Address] = block.timestamp;
        } else if(block.timestamp - withdrawInits[_Address] < withdrawThreshold){
            revert("Return in 7 Days");
        } 
    }

    function netDeposit(uint Deposit) private returns(uint){
        uint Zero9Percent = (9*Deposit)/1000;
        ownersProfits = ownersProfits  + Zero9Percent ;
        return Deposit - Zero9Percent;
    }

    function arrayCheck(address _Depositor) private view returns(bool){
        bool check;
        for(uint c=0; c<depositorsList.length; c++){
            if(_Depositor == depositorsList[c]){
                check = true; 
            }
        }
        return check;
    }


    function depositToSafe() public payable {
        if(arrayCheck(msg.sender) == false){
            depositorsList.push(msg.sender);
        }

        // Update user's yield before adding new deposit
        _updateYield(msg.sender);

        uint _netDeposit = netDeposit(msg.value);
        deposits[msg.sender] =  deposits[msg.sender] + _netDeposit;
    }

    receive() external payable {
        depositToSafe();
    }


    function userWithdraw(uint _Amount) external Own nonReentrant{
      
        _updateYield(msg.sender);

        require(deposits[msg.sender]>=_Amount,"Insufficient Balance");
       
        Initiate_Withdraw(msg.sender);

        if(withdrawInits[msg.sender] > 0){
            (bool Success,) = payable(msg.sender).call{value:_Amount}("");
        
            if(Success == true){
                deposits[msg.sender] = deposits[msg.sender] - _Amount;
                withdrawInits[msg.sender] = 0;
            }
        }
    }

    function deployerWithdraw(uint256 Amount) external Own nonReentrant{
        require(ownersProfits >= Amount,"Overstated Balance");
        (bool Success,) = payable(msg.sender).call{value:Amount}("");

        if(Success == true){
            ownersProfits = ownersProfits - Amount;
        }
    }

    function withdrawToInvest(uint _amount) external Own{
        require(_amount<address(this).balance, "Amount is high");
        (bool Success,) = payable(owner).call{value:_amount}("");

        if(Success == true){
        withdrawnToInvest = _amount;
      
        }
    }

    function returnfromInvestment()external Own payable{
        require(msg.value > 0,"No value sent");

        withdrawnToInvest -= msg.value;
        returnedfromInvestment += msg.value;
        

    }

    function unloadData() external view returns(uint, uint, uint, uint, bool) {
        if(withdrawInits[msg.sender] > 0 && int(withdrawThreshold-(block.timestamp + withdrawInits[msg.sender])) > 0){
            return (
        deposits[msg.sender], 
        withdrawnToInvest, 
        returnedfromInvestment,
        withdrawThreshold-(block.timestamp + withdrawInits[msg.sender]),
        true
        );
        } else {
                  return (
        deposits[msg.sender], 
        withdrawnToInvest, 
        returnedfromInvestment,
        0,
        false
        );
        }
    }

}
