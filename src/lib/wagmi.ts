import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, okxWallet, trustWallet, coinbaseWallet, rainbowWallet, walletConnectWallet, binanceWallet } from "@rainbow-me/rainbowkit/wallets";
import { createClient, createPublicClient, http, webSocket } from "viem";
import { createConfig } from "wagmi";
import { mainChain } from "@/lib/constant";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [binanceWallet],
    },
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, walletConnectWallet],
    },
  ],
  {
    appName: "Hares",
    projectId: "c995ef9d5ebc2b418a9aad43a22a27dc",
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainChain],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
  ssr: true,
});

export const publicClient = createPublicClient({
  chain: mainChain,
  transport: http(),
  // "https://polygon-mainnet.g.alchemy.com/v2/ewYI1qbiYF06opUs36WZ9qJJRZRstxNK"
});
export const publicWsClient = createPublicClient({
  chain: mainChain,
  transport: webSocket(
    // "wss://polygon-mainnet.g.alchemy.com/v2/ewYI1qbiYF06opUs36WZ9qJJRZRstxNK"
    "wss://eth-sepolia.g.alchemy.com/v2/exXbF9jEMjdKGJvFGZF8-WvjO3dPojMO"
  ),
});
