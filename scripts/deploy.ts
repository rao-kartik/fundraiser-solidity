import { ethers } from "hardhat";

import { Contract, ContractFactory, TransactionReceipt } from "../Types/Fundraiser.types";

async function main() {
  const Fundraiser: ContractFactory = await ethers.getContractFactory("Fundraiser");
  const fundraiserContract: Contract = await Fundraiser.deploy();

  const txHash = fundraiserContract.deployTransaction.hash;

  const receipt: TransactionReceipt =
    (await ethers.provider.getTransactionReceipt(txHash)) ||
    (await fundraiserContract.deployTransaction.wait());

  if (receipt)
    console.log(`Contract details:
      deployedBy: ${receipt.from},
      contractAddress: ${receipt.contractAddress},
      gas: ${receipt.gasUsed.toString()},
      blockNumber: ${receipt.blockNumber},
      transaction: ${receipt.transactionHash},
      block: ${receipt.blockHash}
  `);
  else console.log(`Contract deloyed with contract address: ${fundraiserContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
