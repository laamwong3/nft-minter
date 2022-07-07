/*
copy folder from engine
upload images to ipfs
rename the image path in json files
upload metadata to ipfs
save to database
*/
const fse = require("fs-extra");
const Moralis = require("moralis/node");
require("dotenv").config({ path: "../.env" });

const imageFolder = "../build/images";
const metadataFolder = "../build/json";
const _metadataPath = `${metadataFolder}/_metadata.json`;

const serverUrl = process.env.SERVER_URL;
const appId = process.env.APP_ID;
Moralis.start({ serverUrl: serverUrl, appId: appId });

const copyCollection = async () => {
  const destFolder = "../build";
  const srcFolder = "../../engine/build";

  if (fse.existsSync(destFolder)) {
    await fse.rm(destFolder, { recursive: true, force: true });
  }
  fse.copySync(srcFolder, destFolder, { overwrite: true });

  console.log("Folder copied");
};

const uploadImageToIPFS = async () => {
  let imageArray = [];
  const totalFiles = fse.readdirSync(imageFolder).length;

  for (let i = 1; i <= totalFiles; i++) {
    let image = fse.readFileSync(`${imageFolder}/${i}.png`);
    imageArray.push({
      path: `${i}.png`,
      content: image.toString("base64"),
    });
  }

  const path = await Moralis.Web3API.storage.uploadFolder({ abi: imageArray });
  console.log("Images uploaded to IPFS");
  return path[0].path.split("/")[4];
};

const updateMetadata = async (imageCid) => {
  let rawData = fse.readFileSync(_metadataPath);
  let data = JSON.parse(rawData);

  data.map((item) => {
    item.image = `ipfs://${imageCid}/${item.edition}.png`;
    fse.writeFileSync(
      `../build/json/${item.edition}.json`,
      JSON.stringify(item, null, 2)
    );
  });

  fse.writeFileSync(
    "../build/json/_metadata.json",
    JSON.stringify(data, null, 2)
  );

  console.log("Metadata updated");
};

const uploadMetadataToIPFS = async () => {
  let metadataArray = [];
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
  let contractUriMetadata = {
    name: "Opensea Creatures",
    description:
      "OpenSea Creatures are adorable aquatic beings primarily for demonstrating",
    seller_fee_basis_points: 100,
    fee_recipient: "0x2Ace8D81Dcb498765F2ec336ba826125E9486Cc4",
  };

  metadataArray.push({
    path: "contractUriMetadata.json",
    content: btoa(JSON.stringify(contractUriMetadata, null, 2)),
  });

  const path = await Moralis.Web3API.storage.uploadFolder({
    abi: metadataArray,
  });

  console.log("Metadata uploaded to IPFS");
  return path[0].path.split("/")[4];
};

const saveToDb = async (imageCid, metadataCid) => {
  let rawData = fse.readFileSync(_metadataPath);
  let data = JSON.parse(rawData);

  data.map(async (meta) => {
    let rawMetadata = meta;
    let id = meta.edition;
    let imagePath = `https://ipfs.moralis.io:2053/ipfs/${imageCid}/${id}.png`;
    let metadataPath = `https://ipfs.moralis.io:2053/ipfs/${metadataCid}/${id}.json`;

    const nft = new Moralis.Object("Collection");
    nft.set("Collection_ID", id);
    nft.set("Metadata", rawMetadata);
    nft.set("Image_Path", imagePath);
    nft.set("Metadata_Path", metadataPath);
    nft.set("Image_Hash", imageCid);
    nft.set("Metadata_Hash", metadataCid);
    await nft.save();
  });

  console.log("Saved to database");
};

(async () => {
  await copyCollection();
  const imageCid = await uploadImageToIPFS();
  await updateMetadata(imageCid);
  const metadataCid = await uploadMetadataToIPFS();
  await saveToDb(imageCid, metadataCid);
})();
