import { Moralis as MoralisRef } from "moralis/types/node";
import * as MoralisImport from "moralis/node";
import { config } from "dotenv";
import minterContract from "../constants/contractAbi/Minter.json";

config({ path: "../.env" });
const Moralis = MoralisImport as unknown as MoralisRef;

const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
const masterKey = process.env.MASTER_KEY;

(async () => {
  await Moralis.start({
    serverUrl: serverUrl,
    appId: appId,
    masterKey: masterKey,
  });

  let options: MoralisRef.Cloud.Params = {
    chainId: "mumbai",
    address: minterContract.address,
    topic: "NftMinted(address,uint256)",
    abi: minterContract.abi,
    limit: 500000,
    tableName: "MintedNFTs",
    sync_historical: false,
  };
  await Moralis.Cloud.run("watchContractEvent", options, {
    useMasterKey: true,
  });
})();
