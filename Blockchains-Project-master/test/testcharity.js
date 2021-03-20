var Charity = artifacts.require("./Charity.sol")
var expect = require("chai").expect;

contract("Test Charity", function(accounts) {
    describe("Deploying Charity test contract", function() {
        it("should catch test contract instance", function() {
            return Charity.new().then(function(instance) {
                testContract = instance;
            });
        });
    });

    describe("Check contract variables", function() {
        it("should have account[0] as owner", function() {
            return testContract.creator().then(function(res) {
                expect(res.toString()).to.be.equal(accounts[0]);
            });
        });
    });

    describe("Testing charity functions (integration)", function() {
        it("creator can add new charity", function() {
            // Let accounts[2] be the "WWF" address
            testContract.getAccountBalance(accounts[2]).then(function(res) {
                originalBalance = parseFloat(res.toString());
            });
            testContract.addVoteOption("WWF", accounts[2]);
            testContract.votingOptions(0).then(function(res) {
                expect(res.toString()).to.be.equal(
                    "0x5757460000000000000000000000000000000000000000000000000000000000");
            });
            return testContract.votingOptionAddresses(0).then(function(res) {
                expect(res).to.be.equal(accounts[2]);
            });
        });
        it("non-creator cannot add new charity", function() {
            // Let accounts[3] be the RedCross address
            testContract.addVoteOption("RedCross", accounts[3], {from: accounts[1]});
            return testContract.votingOptionsCount().then(function(res) {
                expect(res.toString()).to.be.equal("1");
            });
        });
        it("donations go to correct address", function() {
            testContract.donate({from: accounts[1], value: 100});
            testContract.getBalance().then(function(res) {
                expect(res.toString()).to.be.equal("100");
            });
            return testContract.donations(accounts[1]).then(function(res) {
                expect(res.toString()).to.be.equal("100");
            });
        });
        it("voting cannot proceed without creator calling startVoting", function() {
            testContract.startVoting(100000000, {from: accounts[1]});
            testContract.vote(0, {from: accounts[1]});
            return testContract.votingOptionVotes(0).then(function(res) {
                expect(res.toString()).to.be.equal("0");
            });
        });
        it("voting can proceed after calling startVoting", function() {
            testContract.startVoting(5);
            testContract.vote(0, {from: accounts[1]});
            return testContract.votingOptionVotes(0).then(function(res) {
                expect(res.toString()).to.be.equal("100");
            });
        });
        // we assume that this runs within 10s, this might lead to low probability of flakiness
        it("disperse cannot proceed during voting", function() {
            testContract.disperse();
            return testContract.getBalance().then(function(res) {
                expect(res.toString()).to.be.equal("100");
            });
        });
        it("disperse can proceed after voting", function() {
            // wait out the rest of the voting
            var start = new Date().getTime();
            var end = start;
            while(end < start + 5000) {
                end = new Date().getTime();
            }
            testContract.disperse();
            testContract.getAccountBalance(accounts[2]).then(function(res) {
                expect(parseFloat(res.toString())).to.be.equal(originalBalance + 100);
            });
            return testContract.getBalance().then(function(res) {
                expect(res.toString()).to.be.equal("0");
            });
        });
        it("endTime, startTime, votes reset after disperse", function() {
            testContract.votingOptionVotes(0).then(function(res) {
                expect(res.toString()).to.be.equal("0");
            })
            testContract.startTime().then(function(res) {
                expect(parseFloat(res.toString())).to.be.equal(2**256 - 1);
            });
            return testContract.endTime().then(function(res) {
                expect(parseFloat(res.toString())).to.be.equal(2**256 - 1);
            });
        });
        it("cannot vote after voting", function() {
            testContract.donate(100, {from: accounts[1]});
            testContract.vote(0, {from: accounts[1]});
            testContract.votingOptionVotes(0).then(function(res) {
                expect(res.toString()).to.be.equal("0");
            });
        });
    });
});
