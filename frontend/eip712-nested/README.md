# EIP-712 Nested Message Signer

A minimal frontend to build and sign an EIP-712 typed data object that contains nested structures (an array of `Call` objects). It’s intended to check how MetaMask displays nested EIP-712 content in its signature UI.

## What it signs

Primary type: `NestedMessage`

```
NestedMessage {
  userAccountAddress: address,
  expiry: uint256,
  calls: Call[]
}

Call {
  to: address,
  value: uint256,
  data: bytes
}
```

Domain fields supported:
- `name`
- `version`
- `chainId` (auto-detected)
- `verifyingContract` (optional)

## Files
- `index.html` — UI: wallet connect, domain fields, message fields, preview, and sign button
- `script.js` — logic to manage dynamic `calls[]`, build typed data, connect MetaMask, and request signature via `eth_signTypedData_v4`
- `styles.css` — basic styling

## Run locally
Serve the folder over HTTP so MetaMask can inject `window.ethereum` (extensions do not inject on `file://`). Any static server works; for example with Python:

```bash
cd /Users/nic619/localProjects/test-unifi-deploy/frontend/eip712-nested
python3 -m http.server 5500
```

Then open:

- http://localhost:5500/frontend/eip712-nested/

> If you see "MetaMask not detected", ensure you’re not on a `file://` URL and that the MetaMask extension is allowed on `http://localhost` (check the extension’s Site access settings).

## How to use
1. Click "Connect MetaMask" and select an account.
2. Fill the EIP-712 Domain (leave defaults unless testing specific values).
   - Leave `Verifying Contract` blank unless you have a real contract address. Do not set it to your own account.
3. Fill the Message section:
   - `User Account Address` — an address relevant to your test
   - `Expiry` — unix timestamp in seconds
   - `Calls` — Add one or more items, each with `to`, `value` (wei), and `data` (hex)
4. The right panel shows the live typed data JSON that will be sent to MetaMask.
5. Click "Sign with MetaMask" to open the signature prompt.
6. Inspect how MetaMask displays the nested content. The resulting signature is shown in the UI.

## Notes
- Uses `eth_signTypedData_v4` with a `types` section that includes `Call` and `NestedMessage`.
- `chainId` is auto-populated from MetaMask when connected.
- A guard prevents setting `verifyingContract` to the connected account, which causes MetaMask to return: "External signature requests cannot use internal accounts as the verifying contract." Leave it blank or use an actual contract address.
- Ethers is loaded from a CDN and not strictly required for signing; MetaMask injection is used for `ethereum.request`.
