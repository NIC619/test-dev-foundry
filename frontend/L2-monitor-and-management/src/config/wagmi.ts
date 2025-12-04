import { createConfig, configureChains, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';

// For Wagmi v1, use simpler configuration
// Users will connect their own wallet via MetaMask or similar
export const wagmiConfig = createConfig(
  configureChains(
    [mainnet], // Fallback chain, users will override via wallet
    [publicProvider()],
  ),
);
