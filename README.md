# Using Ethereum Smart Contracts to Democratize Charities
Xueshan (Jessie) Bai, William Sun, Xi (Stanley) Wang, and Elaine Wong

## Testing
To run the Truffle tests, first install the node dependencies using `npm install` in the root project directory.

Then, compile the smart contracts using `truffle compile`.

In a new terminal window, run `ganache-cli -p=7545` to start the dummy blockchain. You can also download the Ganache GUI [here](http://truffleframework.com/ganache) and start it up.

Migrate the smart contracts to the contract by running `truffle migrate`.

Run the truffle tests by using `truffle test`.

## Running the app
To start the local web server, run `npm run dev`. The dev server will launch and automatically open a new browser tab containing your dapp.

Install MetaMask in your browser, import existing DEN from Ganache and update the custom RPC.(http://truffleframework.com/docs/advanced/truffle-with-metamask)

To play with the decentralized charity:
1. create 3 accounts in MetaMask: Admin, Donor, and Charity(import the private key of accounts[9] from Ganache).
2. Switch account to Admin and go to Admin Panel:
   (a) Click on Create to create a contract.
   (b) Add a Voting Option and click on Start Voting.
3. Switch account to Donor and go to Donate & Voting for a Cause. After donating, you will see Your donations change.
4. Switch account to Admin and click on Disperse.
5. Now the balance in your Charity account should increase.
