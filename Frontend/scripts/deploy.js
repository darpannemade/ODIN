const { ethers } = require("hardhat");

async function main() {
  const ContractFactory = await ethers.getContractFactory("NFTMarketplace");
  const contract = await ContractFactory.deploy();

  await contract.waitForDeployment();  // ethers v6 uses waitForDeployment()

  console.log("Contract deployed to:", contract.target);  // contract.target = deployed address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});