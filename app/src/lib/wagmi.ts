import { http, createConfig } from 'wagmi';
import { mainnet, base, optimism, polygon, arbitrum, bsc, scroll } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, base, optimism, polygon, arbitrum, bsc, scroll],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
    [scroll.id]: http(),
  },
});
