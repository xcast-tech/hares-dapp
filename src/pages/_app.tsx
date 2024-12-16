import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Header } from "@/components/header";
import Providers from "@/lib/provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import FarcasterProvider from "@/hooks/farcaster";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { AppProvider } from "@/context/useAppContext";

dayjs.extend(relativeTime);
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <AuthKitProvider
        config={{
          relay: "https://relay.farcaster.xyz",
          rpcUrl: "https://mainnet.optimism.io",
        }}
      >
        <FarcasterProvider>
          <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
              <Providers>
                <div className="mt-[80px] h-[calc(100vh-80px)] pt-8 overflow-auto">
                  <Component {...pageProps} />
                </div>

                <Header />
                <ToastContainer theme="dark" position="bottom-right" pauseOnFocusLoss={false} />
              </Providers>
            </NextThemesProvider>
          </NextUIProvider>
        </FarcasterProvider>
      </AuthKitProvider>
    </AppProvider>
  );
}
