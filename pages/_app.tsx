import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import { ThemeProvider, CssBaseline } from "@mui/material";
import darkTheme from "../constants/darkTheme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </MoralisProvider>
  );
}

export default MyApp;
