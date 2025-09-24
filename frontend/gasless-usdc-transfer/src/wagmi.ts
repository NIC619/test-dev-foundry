import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'

// Define your custom Unifi testnet chain
export const unifiTestnet = {
  id: 2092151908, // Replace with actual chain ID if different
  name: 'Unifi Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-unifi-rpc.puffer.fi/']
    }
  },
  blockExplorers: {
    default: {
      name: 'Unifi Explorer',
      url: 'https://testnet-unifi-explorer.puffer.fi/',
      apiUrl: 'https://testnet-unifi-explorer.puffer.fi/api'
    }
  }
} as const

export const config = createConfig({
  chains: [unifiTestnet],
  connectors: [
    injected({
      target: 'metaMask',
    })
  ],
  multiInjectedProviderDiscovery: false, // Disable auto-discovery of multiple providers
  transports: {
    [unifiTestnet.id]: http('https://testnet-unifi-rpc.puffer.fi/'),
  }
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}