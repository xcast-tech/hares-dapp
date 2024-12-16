import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { binanceWallet, metaMaskWallet, okxWallet, trustWallet } from '@rainbow-me/rainbowkit/wallets';
import { createClient, http } from 'viem';
import { createConfig } from 'wagmi';
import { mainChain } from '@/lib/constant';

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, binanceWallet],
    },
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, trustWallet, okxWallet],
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
    return createClient({ chain, transport: http() })
  },
  ssr: true,
})

export const publicClient = createClient({ chain: mainChain, transport: http() })