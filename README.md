## Test contract deployment and verification

### Deploy a contract

```bash
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY --contracts src/Counter.sol:Counter
```

### Verify a contract

Etherscan:

```bash
forge verify-contract --rpc-url $RPC_URL --etherscan-api-key $ETHERSCAN_API_KEY <CONTRACT_ADDRESS> src/Counter.sol:Counter
```

Blockscout:

```bash
forge verify-contract --rpc-url $RPC_URL --verifier blockscount --verifier-url $VERIFIER_URL <CONTRACT_ADDRESS> src/Counter.sol:Counter
```

### Deploy and verify a contract

Etherscan:

```bash
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY --verify --etherscan-api-key $ETHERSCAN_API_KEY --contracts src/Counter.sol:Counter
```

Blockscout:

```bash
forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY --verify --verifier blockscount --verifier-url $VERIFIER_URL --contracts src/Counter.sol:Counter
```

## Test EIP-7702

```bash
./script/runSignDelegation.sh
```