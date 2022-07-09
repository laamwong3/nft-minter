import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Stack } from "@mui/material";
import minterLogo from "../public/minterImage.jpeg";
import Moralis from "moralis";
import {
  useApiContract,
  useMoralis,
  useMoralisQuery,
  useMoralisSubscription,
  useWeb3ExecuteFunction,
} from "react-moralis";
import { useNotification } from "web3uikit";
import MinterContract from "../constants/contractABI/Minter.json";

//fetch data from the blockchain
//create button for users to mint
//display data in real time

const MAX_SUPPLY: number = 30;

export default function MintCard() {
  const [totalSupply, setTotalSupply] = React.useState(0);
  const [isFinishMinting, setIsFinishMinting] = React.useState(false);
  const [newEvent, setNewEvent] =
    React.useState<Moralis.Object<Moralis.Attributes>>();

  const {
    account,
    enableWeb3,
    isWeb3Enabled,
    isWeb3EnableLoading,
    deactivateWeb3,
  } = useMoralis();

  useMoralisSubscription("MintedNFTs", (q) => q, [], {
    onUpdate: (newData) => setNewEvent(newData),
  });

  const { fetch: getNewTotalSupply } = useMoralisQuery(
    "MintedNFTs",
    (q) => q.select("amount_decimal"),
    [],
    {
      autoFetch: false,
    }
  );

  React.useEffect(() => {
    (async () => {
      await getNewTotalSupply({
        onSuccess: (newData) => {
          let currentMintedTotal: number = 0;
          for (const each of newData) {
            currentMintedTotal += Number(
              each.attributes.amount_decimal.value.$numberDecimal
            );
          }
          setTotalSupply(currentMintedTotal);
          if (currentMintedTotal >= MAX_SUPPLY) {
            setIsFinishMinting(true);
          }
        },
      });
    })();
  }, [newEvent]);
  // console.log(totalSupplyData);
  const { runContractFunction } = useApiContract({
    address: MinterContract.address,
    functionName: "mintNfts",
    abi: MinterContract.abi,
    chain: "0x13881",
  });

  const { fetch: mintNfts, isLoading: isMinting } = useWeb3ExecuteFunction({
    abi: MinterContract.abi,
    contractAddress: MinterContract.address,
    functionName: "mintNfts",
    params: { _amount: 1 },
    msgValue: Moralis.Units.ETH("0.001"),
  });

  const { fetch: getTotalSupply } = useWeb3ExecuteFunction({
    abi: MinterContract.abi,
    contractAddress: MinterContract.address,
    functionName: "totalSupply",
    params: {},
  });
  const dispatch = useNotification();

  const handleMint = async () => {
    if (isWeb3Enabled && account) {
      await mintNfts({
        onSuccess: async (results) => {
          //@ts-ignore
          await results.wait(1);
          dispatch({
            position: "topR",
            type: "success",
            icon: "bell",
            title: "Minting Successfully",
            message: "Please verify on Etherscan",
          });
        },
        onError: (error) => {
          console.log(error);
          dispatch({
            position: "topR",
            type: "error",
            icon: "bell",
            title: "Minting Error",
            message: "Please mint again",
          });
        },
      });
    }
  };

  return (
    <Card sx={{ maxWidth: 400 }}>
      <Image src={minterLogo} objectFit="cover" />
      <CardContent>
        <Typography
          textAlign="center"
          gutterBottom
          variant="h6"
          component="div"
        >
          Public Mint
        </Typography>
        <Typography
          gutterBottom
          textAlign="center"
          variant="h4"
          color="text.secondary"
        >
          {`${totalSupply} out of ${MAX_SUPPLY} MINTED!`}
        </Typography>
        <Typography textAlign="center" variant="body2">
          {account}
        </Typography>
      </CardContent>
      <CardActions sx={{ paddingBottom: 5 }}>
        <Stack gap={2} direction="row" justifyContent="center" width="100%">
          {isWeb3Enabled && account ? (
            <>
              <Button
                disabled={isMinting || isFinishMinting}
                size="large"
                onClick={handleMint}
              >
                Mint
              </Button>
              <Button
                disabled={isMinting}
                onClick={async () => {
                  await deactivateWeb3();
                }}
              >
                Disconnect
              </Button>
              {/* <Button
                onClick={async () => {
                  await runContractFunction({
                    onSuccess: (res) => console.log(res),
                    onError: (err) => console.log(err),
                  });
                }}
              >
                TESTING
              </Button> */}
            </>
          ) : (
            <>
              <Button
                disabled={isWeb3EnableLoading || isMinting || isFinishMinting}
                size="large"
                onClick={async () => await enableWeb3()}
              >
                Connect Wallet
              </Button>
            </>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}
