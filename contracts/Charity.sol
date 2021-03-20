pragma solidity ^0.4.18;

contract Charity {

    address public creator;
    mapping (address => uint) public donations;
    bytes32[] public votingOptions;
    address[] public votingOptionAddresses;
    uint[] public votingOptionVotes;
    uint public votingOptionsCount;
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

    // The creator can add voting options before voting starts
    // @param option: the name of the charity being added
    // @param address: the address of the charity's wallet
    function addVoteOption(bytes32 option, address optionAddress) public {
        if (msg.sender == creator && startTime == (2**256 - 1)) {
            // TODO: Make this less susceptible to gas attacks; we need a max # of charities
            if (votingOptions.length <= votingOptionsCount) {
                votingOptions.push("");
                votingOptionAddresses.push(0);
                votingOptionVotes.push(0);
            }
            votingOptions[votingOptionsCount] = option;
            votingOptionAddresses[votingOptionsCount] = optionAddress;
            votingOptionVotes[votingOptionsCount] = 0;
            votingOptionsCount++;
            emit optionAdded(option, optionAddress);
        }
    }

    // Locks in the options and allows donors to start voting
    // @param duration: time that voting will be allowed, in seconds
    function startVoting(uint duration) public {
        if (msg.sender == creator && startTime == 2**256 - 1 && now < endTime) {
            startTime = now;
            endTime = now + duration;
        }
    }

    // If one donates money but hasn't voted, he/she can reclaim money back.
    function returnDonation() public {
        if (donations[msg.sender] > 0) {
            donations[msg.sender] = 0;
            msg.sender.transfer(donations[msg.sender]);
        }
    }

    // Allows one to vote for one of the choices, which will be weighted; remove voter's balance
    // @param option: the index of the option to vote for
    function vote(uint option) public {
        if (isVotingActive() && option < votingOptionsCount) {
            uint temp = donations[msg.sender];
            donations[msg.sender] = 0;
            votingOptionVotes[option] += temp;
        }
    }

    function isVotingActive() public returns (bool) {
        return (now >= startTime && now <= endTime);
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

    // Get which charity is at a certain index
    // @param index: the index of the voting option
    function getVotingOption (uint index) public constant returns (bytes32, address, uint) {
        if (index < votingOptionsCount) {
            return (votingOptions[index], votingOptionAddresses[index], votingOptionVotes[index]);
        } else {
            return ("null", 0, 0);
        }
    }

    function getAccountBalance(address addr) public view returns(uint) {
		  return addr.balance;
	  }
}
