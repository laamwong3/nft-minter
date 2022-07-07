import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Minter__factory,
  Minter,
  MockContract__factory,
  MockContract,
} from "../typechain";
import { parseEther } from "ethers/lib/utils";
// 1. perform unit testing
// 2. change all public state variables to private to save gas
describe("Unit Testing for all public / external functions", () => {
  let Minter: Minter__factory;
  let minter: Minter;
  let MockContract: MockContract__factory;
  let mockContract: MockContract;
  let owner: SignerWithAddress;
  let users: SignerWithAddress[];
  const tokenUri = "http://test123/metadata/";
  const valueInEther = 0.001;

  beforeEach(async () => {
    [owner, ...users] = await ethers.getSigners();
    Minter = await ethers.getContractFactory("Minter");
    minter = await Minter.deploy(tokenUri);
    await minter.deployed();
    MockContract = await ethers.getContractFactory("MockContract");
    mockContract = await MockContract.deploy(minter.address);
    await mockContract.deployed();
  });

  describe("constructor", () => {
    it("Should set the token uri", async () => {
      expect(await minter.baseTokenUri()).to.be.equal(tokenUri);
    });
  });
  describe("minNfts", () => {
    it("Should only be called by user", async () => {
      const valueSent = ethers.utils.parseEther(valueInEther.toString());
      const tx = mockContract.mintALot(1, { value: valueSent });
      await expect(tx).to.be.reverted;
    });
    it("Should revert if exceed maximum supplies", async () => {
      await expect(minter.mintNfts(31)).to.be.reverted;
    });
    it("should revert if amount is invalid", async () => {
      await expect(minter.mintNfts(0)).to.be.reverted;
    });
    it("Should revert if not enough fund sent", async () => {
      const valueSent = ethers.utils.parseEther((valueInEther / 2).toString());
      const tx = minter.connect(users[0]).mintNfts(1, { value: valueSent });
      await expect(tx).to.be.reverted;
    });
    it("Should receive fund after user mint NFTs", async () => {
      const valueSent = ethers.utils.parseEther(valueInEther.toString());
      await minter.connect(users[0]).mintNfts(1, { value: valueSent });
      expect(await minter.getContractBalance()).to.be.equal(valueSent);
    });
    it("Should token id start with 1", async () => {
      await (await minter.mintNfts(10)).wait(1);
      await expect(minter.tokenURI(0)).to.be.reverted;
    });
    it("Should mint nft with the corresponding token uri", async () => {
      const amount: number = 5;
      await (await minter.mintNfts(amount)).wait(1);
      for (let i = 1; i <= amount; i++) {
        let expectedTokenUri = `${tokenUri}${i}.json`;
        expect(await minter.tokenURI(i)).to.be.equal(expectedTokenUri);
      }
    });
  });
  describe("withdraw", () => {
    // beforeEach(async () => {});
    it("Should be only withdrawn by owner", async () => {
      await expect(minter.connect(users[0]).withdraw()).to.be.reverted;
    });
    it("Should send money to owner", async () => {
      const valueSent = ethers.utils.parseEther((valueInEther * 2).toString());
      await minter.connect(users[0]).mintNfts(2, { value: valueSent });
      // console.log("contract balance = ", await minter.getContractBalance());
      // console.log(`owner before = ${await owner.getBalance()}`);
      // // await minter.connect(owner).withdraw();
      // console.log(`owner after = ${await owner.getBalance()}`);

      await expect(() =>
        minter.connect(owner).withdraw()
      ).to.changeEtherBalance(owner, valueSent);
    });
  });
});
