import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { NextPage } from "next";
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
import { ReactElement, ReactNode } from "react";
import { cn, getDomain } from "@/lib/utils";

dayjs.extend(relativeTime);
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

type NextPageWithLayout = NextPage & {
  GetLayout?: (page: ReactElement, props?: any) => ReactNode;
};
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  return (
    <AppProvider>
      <AuthKitProvider
        config={{
          relay: "https://relay.farcaster.xyz",
          domain: getDomain(),
          rpcUrl: "https://mainnet.optimism.io",
        }}
      >
        <FarcasterProvider>
          <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
              <Providers>
                {Component.GetLayout ? (
                  Component.GetLayout(<Component {...pageProps} />, pageProps)
                ) : (
                  <>
                    <div className={cn("mt-[52px] h-[calc(100vh-52px)] ", "xl:mt-[72px] xl:h-[calc(100vh-72px)] xl:pb-20 overflow-auto")}>
                      <Component {...pageProps} />
                    </div>
                    <Header />
                    <ToastContainer theme="dark" position="bottom-right" pauseOnFocusLoss={false} pauseOnHover={false} />
                  </>
                )}
              </Providers>
            </NextThemesProvider>
          </NextUIProvider>
        </FarcasterProvider>
      </AuthKitProvider>
    </AppProvider>
  );
}
