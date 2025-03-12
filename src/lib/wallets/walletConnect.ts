import type {
  RainbowKitWalletConnectParameters,
  Wallet,
} from "@rainbow-me/rainbowkit";
import { getWalletConnectConnector } from "./getWalletConnector";

export interface WalletConnectWalletOptions {
  projectId: string;
  options?: RainbowKitWalletConnectParameters;
}

export const walletConnectWallet = ({
  projectId,
  options,
}: WalletConnectWalletOptions): Wallet => {
  const getUri = (uri: string) => uri;

  return {
    id: "walletConnect",
    name: "WalletConnect",
    installed: undefined,
    iconUrl: "/walletConnectWallet.svg",
    iconBackground: "#3b99fc",
    qrCode: { getUri },
    createConnector: getWalletConnectConnector({
      projectId,
      walletConnectParameters: options,
    }),
  };
};
