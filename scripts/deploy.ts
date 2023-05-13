import { ethers } from "hardhat";

import { Contract, ContractFactory, TransactionReceipt } from "../Types/Fundraiser.types";

async function main() {
  const Fundraiser: ContractFactory = await ethers.getContractFactory("Fundraiser");
  const fundraiserContract: Contract = await Fundraiser.deploy();

  const receipt: TransactionReceipt = await ethers.provider.getTransactionReceipt(
    fundraiserContract.deployTransaction.hash
  );

  if (receipt)
    console.log(`Contract details:
  deployedBy: ${receipt.from},
  contractAddress: ${receipt.contractAddress},
  gas: ${receipt.gasUsed.toString()},
  `);
  else console.log(`Contract deloyed with contract address: ${fundraiserContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
