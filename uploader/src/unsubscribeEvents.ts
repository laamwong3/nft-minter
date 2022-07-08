import { Moralis as MoralisRef } from "moralis/types/node";
import * as MoralisImport from "moralis/node";
import { config } from "dotenv";

config({ path: "../.env" });
const Moralis = MoralisImport as unknown as MoralisRef;
