import { isInBinance } from "@binance/w3w-utils";
// import { getWagmiConnectorV2 } from "@binance/w3w-wagmi-connector-v2";
import { getWagmiConnectorV2 } from "@/lib/wallets/binance-wagmi-connector";
import {
  Wallet,
  RainbowKitWalletConnectParameters,
  WalletDetailsParams,
  getWalletConnectConnector,
} from "@rainbow-me/rainbowkit";
import { createConnector } from "wagmi";

const instructions = {
  learnMoreUrl:
    "https://www.binance.com/en/blog/markets/introducing-binance-web3-wallet-5931309459106555347",
  steps: [
    {
      description:
        "Log in to your Binance app and tap [Wallets]. Go to [Web3].",
      step: "install" as any,
      title: "Open Binance app",
    },
    {
      description: "Tap [Create Wallet] to start using your Web3 Wallet.",
      step: "create" as any,
      title: "Create or Import a Wallet",
    },
    {
      description:
        "After you scan, a connection prompt will appear for you to connect your wallet.",
      step: "scan" as any,
      title: "Tap the scan button",
    },
  ],
};

export interface BinanceW3WOptions {
  projectId: string;
  options?: RainbowKitWalletConnectParameters;
}

export default function rainbowConnector(): Wallet {
  const shouldUseWalletConnect = !isInBinance();

  return {
    id: "wallet.binance.com",
    name: "Binance Wallet",
    iconUrl: "/binanceWallet.svg",
    iconAccent: "#1E1E1E",
    iconBackground: "#1E1E1E",
    installed: isInBinance() || undefined,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.binance.dev",
      ios: "https://apps.apple.com/us/app/binance-buy-bitcoin-crypto/id1436799971",
      mobile: "https://www.binance.com/en/download",
      qrCode: "https://www.binance.com/en/download",
    },
    mobile: {
      getUri: (uri) => {
        console.log("---- mobile getUrl", uri);
        return uri;
      },
    },
    qrCode: shouldUseWalletConnect
      ? {
          getUri: (uri) => {
            console.log("----- binance qrcode uri", uri);
            return uri;
          },
          instructions,
        }
      : undefined,
    extension: {
      instructions,
    },
    createConnector: (walletDetails: WalletDetailsParams) =>
      createConnector((config) => {
        const wagmiConnectorV2 = getWagmiConnectorV2()();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return {
          ...wagmiConnectorV2(config as any),
          ...walletDetails,
        } as any;
      }),
  };
}
