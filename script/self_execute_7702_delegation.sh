#!/usr/bin/env bash
# =============================================================================
# Self-sponsored EIP-7702 delegation via `cast`
# =============================================================================
#
# WHAT THIS DOES
#   Installs an EIP-7702 delegation on an EOA so that the EOA's code points at
#   IMPLEMENTATION. After this script succeeds, calls to the EOA execute the
#   implementation's bytecode in the EOA's storage/context. To clear the
#   delegation later, re-run with IMPLEMENTATION = address(0).
#
# USAGE
#   1. Edit IMPLEMENTATION below to the contract you want to delegate to.
#   2. Export the authority's private key:
#        export DELEGATOR_PRIVATE_KEY=0x....
#   3. (Optional) Override RPC and chain ID — defaults are Sepolia:
#        export RPC_URL=https://...
#        export CHAIN_ID=11155111
#   4. Run:
#        ./script/execute_7702_delegation.sh
#
#   The authority pays its own gas (self-sponsored). To use a separate relayer
#   instead, use Foundry's vm.signDelegation / vm.attachDelegation in a .s.sol
#   script — that path works fine when authority != broadcaster.
#
# WHY THE NONCE GYMNASTICS (the part that bit us)
#   Per EIP-7702, each authorization carries a `nonce` that must equal the
#   authority's account nonce *at the moment the authorization is processed*.
#   Authorizations are processed AFTER the tx's own nonce check increments the
#   sender's account nonce. So:
#
#     - When authority != tx.sender: the tx does NOT bump authority's nonce,
#       so auth.nonce == authority.current_nonce.
#     - When authority == tx.sender (self-sponsored, this script): the tx
#       bumps authority's nonce from N to N+1 first, THEN the authorization is
#       checked, so auth.nonce == N + 1 == tx.nonce + 1.
#
#   Both `cast wallet sign-auth` and Foundry's vm.signDelegation default to
#   the *current* account nonce (correct for the relayer case). For
#   self-sponsored we must pass `--nonce $((current + 1))` explicitly.
#   Foundry's vm.attachDelegation additionally rejects non-current nonces,
#   which is why this shell script exists instead of a .s.sol equivalent.
#
# FLAG NOTES
#   cast wallet sign-auth:
#     --chain        EIP-7702 signatures are chain-scoped (chainId 0 would
#                    mean "any chain"; we pin to the target chain for safety).
#     --nonce        Explicit auth nonce = current + 1, see above.
#     (no --rpc-url) Not needed once --nonce is supplied; avoids an extra RPC
#                    call and avoids any risk of cast re-deriving the nonce.
#
#   cast send:
#     --auth         Attaches the signed authorization tuple to a type-4 tx.
#     --confirmations 2
#                    Public RPCs (publicnode, Alchemy free tier, etc.) are
#                    load-balanced across replicas. Waiting 2 confirmations
#                    reduces (but does not eliminate) the chance the follow-up
#                    `cast code` call hits a replica that hasn't seen the tx.
#     (target = $AUTHORITY)
#                    The tx needs *some* call target; calling the authority
#                    itself with empty calldata is a cheap no-op that still
#                    produces a valid type-4 tx carrying the authorization.
#
# VERIFICATION
#   After success, `cast code <AUTHORITY>` returns 0xef0100 || implementation
#   (the EIP-7702 delegation designator: 3-byte prefix + 20-byte address).
# =============================================================================

set -euo pipefail

# Contract that the authority's EOA will delegate execution to.
# Set to 0x000...0 to CLEAR an existing delegation.
IMPLEMENTATION="0x0000000000000000000000000000000000000000"

RPC_URL="${RPC_URL:-https://ethereum-sepolia-rpc.publicnode.com}"
CHAIN_ID="${CHAIN_ID:-11155111}"

: "${DELEGATOR_PRIVATE_KEY:?DELEGATOR_PRIVATE_KEY must be set in env}"

AUTHORITY="$(cast wallet address --private-key "$DELEGATOR_PRIVATE_KEY")"

echo "Authority / sender: $AUTHORITY"
echo "Delegating to:      $IMPLEMENTATION"
echo "RPC:                $RPC_URL"
echo "Chain ID:           $CHAIN_ID"
echo

# Self-sponsored EIP-7702: tx consumes CURRENT_NONCE, account nonce becomes
# CURRENT_NONCE + 1, and the authorization is validated against that bumped
# value. So we must sign the authorization with CURRENT_NONCE + 1.
CURRENT_NONCE="$(cast nonce "$AUTHORITY" --rpc-url "$RPC_URL")"
AUTH_NONCE=$((CURRENT_NONCE + 1))
echo "Current account nonce: $CURRENT_NONCE"
echo "Signing authorization with nonce: $AUTH_NONCE (= current + 1, required for self-sponsored 7702)"

AUTH="$(cast wallet sign-auth "$IMPLEMENTATION" \
  --private-key "$DELEGATOR_PRIVATE_KEY" \
  --chain "$CHAIN_ID" \
  --nonce "$AUTH_NONCE")"

echo "Auth signature: $AUTH"
echo

echo "Broadcasting type-4 transaction (self-sponsored)..."
cast send "$AUTHORITY" \
  --auth "$AUTH" \
  --private-key "$DELEGATOR_PRIVATE_KEY" \
  --rpc-url "$RPC_URL" \
  --confirmations 2

echo
echo "Verifying on-chain code at authority..."
# Retry the read in case the public RPC routes us to a replica that hasn't
# caught up yet (cast send waits for confirmations on the node that mined it,
# not on every replica behind the load balancer).
for i in 1 2 3 4 5; do
  CODE="$(cast code "$AUTHORITY" --rpc-url "$RPC_URL")"
  if [ "$CODE" != "0x" ]; then
    echo "$CODE"
    echo "(expect: 0xef0100 followed by the implementation address)"
    exit 0
  fi
  echo "code still empty on this RPC node, retrying ($i/5)..."
  sleep 3
done
echo "WARNING: code still 0x after retries — tx may not have propagated to this RPC yet."
