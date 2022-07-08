import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import { ThemeProvider, CssBaseline } from "@mui/material";
import darkTheme from "../constants/darkTheme";
import { NotificationProvider } from "web3uikit";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
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
