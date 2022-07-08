import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Stack } from "@mui/material";
import MintCard from "../components/MintCard";
import { useMoralis } from "react-moralis";

const Home: NextPage = () => {
  return (
    <>
      <Stack
        height="100vh"
        width="100vw"
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <MintCard />
      </Stack>
    </>
  );
};

export default Home;
