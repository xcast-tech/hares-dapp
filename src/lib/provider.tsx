import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { GlobalProvider } from "@/context/useGlobalCtx";
import { wagmiConfig } from "./wagmi";

const client = new QueryClient();

const rainbowKitTheme = {
  accentColor: "#FCD535",
};

function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider locale="en-US" theme={darkTheme(rainbowKitTheme)}>
          <GlobalProvider>{children}</GlobalProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Providers;
