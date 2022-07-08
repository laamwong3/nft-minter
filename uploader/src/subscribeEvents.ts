// import { Moralis as MoralisRef } from "moralis/types/node";
// import * as MoralisImport from "moralis/node";
import { config } from "dotenv";
import minterContract from "../constants/contractAbi/Minter.json";
// import Moralis from "moralis/node";
import Moralis from "moralis/node";

config({ path: "../.env" });
// const Moralis = MoralisImport as unknown as MoralisRef;

const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
const masterKey = process.env.MASTER_KEY;

// Moralis.Web3API.token.getNFTOwners({chain:'0x13881'})

(async () => {
  await Moralis.start({
    serverUrl: serverUrl,
    appId: appId,
    masterKey: masterKey,
  });
  let options = {
    chainId: "0x13881",
    address: minterContract.address,
    topic: "NftMinted(address,uint256)",
    abi: {
      type: "event",
      anonymous: false,
      name: "NftMinted",
      inputs: [
        {
          type: "address",
          name: "to",
          indexed: false,
        },
        {
          type: "uint256",
          name: "amount",
          indexed: false,
        },
      ],
    },
    limit: 500000,
    tableName: "MintedNFTs",
    sync_historical: true,
  };
  Moralis.Cloud.run("watchContractEvent", options, {
    useMasterKey: true,
  })
    .then(() => console.log("Event subscribed"))
    .catch((error) => console.log(error));
})().catch((error) => console.log(error));
