import * as fse from "fs-extra";
import { Moralis as MoralisRef } from "moralis/types/node";
import * as MoralisImport from "moralis/node";
import { config } from "dotenv";

interface OpenseaMetadata {
  name: string;
  description: string;
  image: string;
  dna: string;
  edition: number;
  date: number;
  attributes: Attribute[];
}
interface OpenseaContractURI {
  name?: string;
  description?: string;
  image?: string;
  external_link?: string;
  seller_fee_basis_points?: number;
  fee_recipient?: string;
}

interface Attribute {
  trait_type: string;
  value: string;
}

config({ path: "../.env" });
const Moralis = MoralisImport as unknown as MoralisRef;

const collectionName = "Your Collection Name";
const collectionDescription = "Your Collection Description";
const imageFolder = "../build/images";
const metadataFolder = "../build/json";
const _metadataPath = `${metadataFolder}/_metadata.json`;
const contractUriMetadataFile = "contractUriMetadata.json";

const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;

const copyCollection = async () => {
  const destFolder = "../build";
  const srcFolder = "../hashlips_art_engine-1.1.2_patch_v6 2/build";

  if (fse.existsSync(destFolder)) {
    await fse.rm(destFolder, { recursive: true, force: true });
  }
  fse.copySync(srcFolder, destFolder, { overwrite: true });

  console.log("Folder copied");
};

const uploadImageToIPFS = async () => {
  let imageArray: { path: string; content: string }[] = [];
  const totalFiles = fse.readdirSync(imageFolder).length;

  for (let i = 1; i <= totalFiles; i++) {
    let image = fse.readFileSync(`${imageFolder}/${i}.png`);
    imageArray.push({
      path: `${i}.png`,
      content: image.toString("base64"),
    });
  }
  //@ts-ignore
  const path = await Moralis.Web3API.storage.uploadFolder({ abi: imageArray });
  console.log("Images uploaded to IPFS");
  return path[0].path.split("/")[4];
};

const updateMetadata = async (imageCid: string) => {
  let rawData = fse.readFileSync(_metadataPath);
  let data: OpenseaMetadata[] = JSON.parse(rawData.toString());

  data.map((item) => {
    item.name = collectionName;
    item.description = collectionDescription;
    item.image = `ipfs://${imageCid}/${item.edition}.png`;
    fse.writeFileSync(
      `${metadataFolder}/${item.edition}.json`,
      JSON.stringify(item, null, 2)
    );
  });

  fse.writeFileSync(
    `${metadataFolder}/_metadata.json`,
    JSON.stringify(data, null, 2)
  );

  console.log("Metadata updated");
};

const uploadMetadataToIPFS = async () => {
  let metadataArray: { path: string; content: string }[] = [];
  const totalFiles = fse.readdirSync(imageFolder).length;

  for (let i = 1; i <= totalFiles; i++) {
    let metadata = fse.readFileSync(`${metadataFolder}/${i}.json`);
    metadataArray.push({
      path: `${i}.json`,
      content: metadata.toString("base64"),
    });
  }

  /**
   * for contractUri
   */
  let contractUriMetadata: OpenseaContractURI = {
    name: "Your Collection",
    description: "Your Description",
    image: "",
    seller_fee_basis_points: 100, //Royality
    fee_recipient: "0x2Ace8D81Dcb498765F2ec336ba826125E9486Cc4", //receiver
  };

  metadataArray.push({
    path: contractUriMetadataFile,
    content: btoa(JSON.stringify(contractUriMetadata, null, 2)),
  });
  //@ts-ignore
  const path = await Moralis.Web3API.storage.uploadFolder({
    abi: metadataArray,
  });

  console.log("Metadata uploaded to IPFS");
  // console.log(path);
  return path[0].path.split("/")[4];
};

const saveToDb = async (imageCid: string, metadataCid: string) => {
  let rawData = fse.readFileSync(_metadataPath);
  let data: OpenseaMetadata[] = JSON.parse(rawData.toString());
  let baseTokenUri = "https://ipfs.moralis.io:2053/ipfs";

  data.map(async (meta) => {
    let rawMetadata = meta;
    let id = meta.edition;
    let imagePath = `${baseTokenUri}/${imageCid}/${id}.png`;
    let metadataPath = `${baseTokenUri}/${metadataCid}/${id}.json`;

    const nft = new Moralis.Object("Collection");
    nft.set("Collection_ID", id);
    nft.set("Metadata", rawMetadata);
    nft.set("Image_Path", imagePath);
    nft.set("Metadata_Path", metadataPath);
    nft.set("Image_Hash", imageCid);
    nft.set("Metadata_Hash", metadataCid);
    await nft.save();
  });

  const metadataPath: { metadataUri: string; contractUri: string } = {
    metadataUri: `${baseTokenUri}/${metadataCid}/`,
    contractUri: `${baseTokenUri}/${metadataCid}/${contractUriMetadataFile}`,
  };

  fse.writeFileSync(
    "../../smart-contract/constants/metadataPath.json",
    JSON.stringify(metadataPath, null, 2)
  );
  console.log("Saved to database");
};

(async () => {
  await Moralis.start({ serverUrl: serverUrl, appId: appId });
  await copyCollection();
  const imageCid = await uploadImageToIPFS();
  await updateMetadata(imageCid);
  const metadataCid = await uploadMetadataToIPFS();
  await saveToDb(imageCid, metadataCid);
})().catch((error) => console.log(error));
