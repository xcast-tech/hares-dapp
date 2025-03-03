import { HeroUIProvider } from "@heroui/react";
// import { heroui as NextThemesProvider } from "@heroui/theme";
import type { NextPage } from "next";
import { Header } from "@/components/header";
import "@/styles/globals.css";
import Providers from "@/lib/provider";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AppProvider } from "@/context/useAppContext";
import { ReactElement, ReactNode, use, useEffect } from "react";
import { cn, getDomain } from "@/lib/utils";
import { Inter, Climate_Crisis } from "next/font/google";

import styled from "@emotion/styled";
import { usePathname } from "next/navigation";

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

const inter = Inter({
  subsets: ["latin"], // 字体子集
  weight: ["400", "500", "600", "700"], // 字体粗细
});

const climateCrisis = Climate_Crisis({
  subsets: ["latin"], // 字体子集
  weight: ["400"], // 字体粗细
  variable: "--font-climate-crisis",
});

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.add(inter.className);
    document.body.classList.add(climateCrisis.variable);
    return () => {
      document.body.classList.remove(inter.className);
      document.body.classList.remove(climateCrisis.variable);
    };
  }, []);

  return (
    <AppProvider>
      <HeroUIProvider>
        {/* <NextThemesProvider attribute="class" defaultTheme="dark"> */}
        <Providers>
          {Component.GetLayout ? (
            Component.GetLayout(<Component {...pageProps} />, pageProps)
          ) : (
            <>
              <StyledMain className="dark">
                <Component {...pageProps} />
              </StyledMain>
              <Header enityOffset={pathname === "/" ? 200 : 0} />
              <ToastContainer
                theme="dark"
                position="bottom-right"
                pauseOnFocusLoss={false}
                pauseOnHover={false}
              />
            </>
          )}
        </Providers>
        {/* </NextThemesProvider> */}
      </HeroUIProvider>
    </AppProvider>
  );
}

const StyledMain = styled.main`
  // padding-top: var(--header-h);
  min-height: 100vh;
`;
