import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from './wagmi';

const client = new QueryClient();

const rainbowKitTheme = {
  accentColor: '#6A3CD6',
}

function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <WagmiProvider config={wagmiConfig} >
      <QueryClientProvider client={client}>
        <RainbowKitProvider locale='en-US' theme={darkTheme(rainbowKitTheme)}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Providers;
