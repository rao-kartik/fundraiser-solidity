import { ethers } from "hardhat";

async function main() {
  const Fundraiser = await ethers.getContractFactory("Fundraiser");
  const fundraiser = await Fundraiser.deploy();

  await fundraiser.deployed();

  console.log("contract deployed");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
