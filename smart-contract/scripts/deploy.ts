import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const Minter = await ethers.getContractFactory("Minter");
  const minter = await Minter.deploy("http://test123/metadata/");

  console.log("deploying................");
  console.log(`contract Minter depolyed to ${minter.address}`);
  console.log("waiting for confirmation..........");

  // await minter.deployed();
  // console.log("confirmed");

  const data: { address: string; abi: string } = {
    address: minter.address,
    abi: JSON.parse(minter.interface.format("json").toString()),
  };

  fs.writeFileSync(
    "../constants/contractABI/Minter.json",
    JSON.stringify(data, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
