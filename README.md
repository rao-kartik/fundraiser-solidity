# **FUNDRAISER PROJECT**

It's a decentralized fundraising platform built on the Ethereum blockchain.

## **Getting Started**

### **Prerequisites**

To run this project, you need to have the following software installed on your computer:

- Node.js (version 16.18.1)
- NPM (version 8.19.2)

## **Installing**

1. Clone the repository:

   ```js
   git clone https://github.com/<your-username>/fundraising-project.git
   ```

2. Install the dependencies:
   ```properties
   cd fundraising-project
   npm i
   ```
3. Create a .env file and add these keys to your env file:

   ```env
   INFURA_PROJECT_ID=<your infura project id>
   ALCHEMY_PROJECT_ID=<your alchemy project id>
   POLYGON_MUMBAI_PRIVATE_KEY=<your wallet private key>
   ```

   Replace < your infura project id > and other with your keys and project ID.

## **Compiling**

To compile the code, run the following command:

```properties
npm run compile
or
yarn compile
```

## **Testing**

To run test cases, run the following command:

```properties
npm run test
or
yarn test
```

#### **Test Report**

The contract is thorughly test on all possible conditions.

![image](https://github.com/rao-kartik/pesto-assignments/assets/77038631/62ed98d6-96a9-4e64-a2cd-294dacca4cfc)

## **Deploying**

1. To deploy the smart contract on localhost, run following command:

   ```properties
   npm run h_node
   or
   yarn h_node
   ```

   ```Properties
   npm run deploy localhost
   or
   yarn deploy localhost
   ```

2. To deploy the smart contract on Ethereum Blockchain , run following command:

   ```Properties
   npm run deploy <network-name>
   or
   yarn deploy localhost  <network-name>
   ```

   Replace the **< network-name >** with the name of the Ethereum network you want to deploy to. Eg: 'polygon', 'rinkeby', 'ropsten' or 'mainnet' etc

   Currently the following testnet are added in the config:

   - localhost
   - hardhat
   - polygon mumbai (ppl_mum_t_alchemy)
   - infura (ppl_mum_t_infura)

   You can add more networks in **hardhat.config.js**

After the contracts are deployed, you should see the contract address, transaction hash and other details in the console.

![image](https://github.com/rao-kartik/fundraiser-solidity/assets/77038631/0c866241-2a82-4a9e-af1e-949c77cbdb98)

## **Built With**

- Solidity: The smart contract programming language
- Hardhat - A development environment for building and testing Ethereum applications

## **Author Details**

- Kartik Yadav
- Email: kartikyadav@gmail.com

## **License**

This project is licensed under the MIT License
