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
import { useMoralis } from "react-moralis";

export default function MintCard() {
  const {
    account,
    enableWeb3,
    isWeb3Enabled,
    isWeb3EnableLoading,
    Moralis,
    deactivateWeb3,
  } = useMoralis();

  // React.useEffect(() => {
  //   Moralis.onAccountChanged(async () => {
  //     await deactivateWeb3();
  //   });
  // }, []);

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
          1 out of 30 Minted
        </Typography>
        <Typography textAlign="center" variant="body2">
          {account}
        </Typography>
      </CardContent>
      <CardActions sx={{ paddingBottom: 5 }}>
        <Stack gap={2} direction="row" justifyContent="center" width="100%">
          {account ? (
            <Button
              size="large"
              onClick={() => {
                if (isWeb3Enabled) alert("clicked");
              }}
            >
              Mint
            </Button>
          ) : (
            <Button
              disabled={isWeb3EnableLoading}
              // disable={isWeb3EnableLoading}
              size="large"
              onClick={async () => await enableWeb3()}
            >
              Connect Wallet
            </Button>
          )}
          <Button
            onClick={async () => {
              await deactivateWeb3();
            }}
          >
            Disconnect
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
