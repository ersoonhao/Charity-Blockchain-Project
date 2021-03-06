pragma solidity ^0.4.18;

contract Charity {

    address public creator;
    mapping (address => uint) public donations;

    uint public startTime;
    uint public endTime;

    event optionAdded(bytes32 option, address optionAddress);
    event donated(address donor, uint donationAmount);

    // Constructor
    function Charity() public {
        creator = msg.sender;
        startTime = 2**256 - 1;
        endTime = 2**256 - 1;
    }


    // Called after the current voting period ends to donate to the majority vote cause
    function disperse() public returns (bool){

        /* votingOptionAddresses[3].transfer(address(this).balance);
        return true; */

        // NOTE: Currently, there is an issue with ganache that does not allow us to zero out array indices (like in line 93)
        // So, the actual code is commented out below, while the code to demo is commented above.
        // The code below passes the tests, so we know it should work.
        // Source: https://github.com/trufflesuite/ganache-cli/issues/491

        // https://ethereum.stackexchange.com/questions/3373/how-to-clear-large-arrays-without-blowing-the-gas-limit
        if (now >= endTime) {
            uint maxVotes = 0;
            uint maxIndex = 2**256 - 1;
            for (uint i = 0; i < votingOptionsCount; i++) {
                if (votingOptionVotes[i] > maxVotes) {
                    maxIndex = i;
                    maxVotes = votingOptionVotes[i];
                    votingOptionVotes[i] = 0;
                }
            }
            votingOptionsCount = 0;
            startTime = 2**256 - 1;
            endTime = 2**256 - 1;
            if (maxIndex == 2**256 - 1) {
                return false; //no one voted
            } else {
                votingOptionAddresses[maxIndex].transfer(address(this).balance);
            }
            return true;
        }
        return false;
    }

    // Allows any individual to donate ethereum to this charity
    function donate() public payable {
        donations[msg.sender] += msg.value;
        emit donated(msg.sender, msg.value);
    }

    function getBalance() public constant returns (uint) {
        return address(this).balance;
    }



    function getAccountBalance(address addr) public view returns(uint) {
		  return addr.balance;
	  }
}
