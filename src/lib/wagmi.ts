import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  okxWallet,
  trustWallet,
  coinbaseWallet,
  rainbowWallet,
  // walletConnectWallet,
  // binanceWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createClient, createPublicClient, http, webSocket } from "viem";
import { createConfig } from "wagmi";
import { mainChain } from "@/lib/constant";
import { base, bsc, sepolia, polygon } from "viem/chains";
// import binanceWallet2 from "@binance/w3w-rainbow-connector-v2";
import { walletConnectWallet } from "@/lib/wallets/walletConnect";
import binanceWallet from "@/lib/wallets/binance";

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
    appName: "BAB.fun",
    projectId: "fa14a7c6aac63f27e22d18d4927498c7",
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainChain],
  client({ chain }) {
    return createClient({
      chain,
      transport: http("https://bsc.nodereal.io"),
    });
  },
  ssr: true,
});

export const publicClient = createPublicClient({
  chain: mainChain,
  transport: http("https://bsc.nodereal.io"),
  // mainChain.id === sepolia.id ? "https://rpc.ankr.com/eth_sepolia" : ""
  // "https://polygon-mainnet.g.alchemy.com/v2/ewYI1qbiYF06opUs36WZ9qJJRZRstxNK"
});
export const publicWsClient = createPublicClient({
  chain: mainChain,
  transport: webSocket(
    // "wss://polygon-mainnet.g.alchemy.com/v2/ewYI1qbiYF06opUs36WZ9qJJRZRstxNK"
    "wss://eth-sepolia.g.alchemy.com/v2/exXbF9jEMjdKGJvFGZF8-WvjO3dPojMO"
  ),
});
