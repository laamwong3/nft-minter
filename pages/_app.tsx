import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import { ThemeProvider, CssBaseline } from "@mui/material";
import darkTheme from "../constants/darkTheme";
import { NotificationProvider } from "web3uikit";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider
      serverUrl={process.env.NEXT_PUBLIC_SERVER_URL!}
      appId={process.env.NEXT_PUBLIC_APP_ID!}
    >
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </ThemeProvider>
    </MoralisProvider>
  );
}

export default MyApp;
