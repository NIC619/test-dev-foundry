// Contract addresses on Unifi Testnet
export const CONTRACTS = {
  USDC: '0xa1706a87F06d4F0F379A9123e41672924B654550',
  PAYMENT_FACILITATOR: '0x7501d27702C11dF27BDfACFCeb09AFe47EBCD8B4'
} as const;

// x402 Payment Configuration
export const X402_CONFIG = {
  MERCHANT_ADDRESS: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  MERCHANT_PRIVATE_KEY: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  AGENT_PRIVATE_KEY: '0x7bf22e1815f25b864be82bb9cad2f6b51a108cd25b90e7de3f05c3ccf16341d8',
  PAYMENT_AMOUNT: '1000000', // 1 USDC (6 decimals)
  SERVICE_NAME: 'Paid Content Access',
  TASK_DESCRIPTION: 'x402-api-payment'
} as const;

// EIP712 Domain for PaymentFacilitator
export const EIP712_DOMAIN = {
  name: 'PaymentFacilitator',
  version: '1',
  chainId: 2092151908, // Unifi Testnet
  verifyingContract: CONTRACTS.PAYMENT_FACILITATOR
} as const;