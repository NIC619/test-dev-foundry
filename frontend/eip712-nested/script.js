(function() {
	const connectBtn = document.getElementById('connectBtn');
	const accountDisplay = document.getElementById('accountDisplay');
	const chainIdInput = document.getElementById('chainId');
	const domainNameInput = document.getElementById('domainName');
	const domainVersionInput = document.getElementById('domainVersion');
	const verifyingContractInput = document.getElementById('verifyingContract');
	const primaryTypeInput = document.getElementById('primaryType');
	const userAccountAddressInput = document.getElementById('userAccountAddress');
	const expiryInput = document.getElementById('expiry');
	const callsContainer = document.getElementById('callsContainer');
	const addCallBtn = document.getElementById('addCallBtn');
	const signBtn = document.getElementById('signBtn');
	const typedDataPreview = document.getElementById('typedDataPreview');
	const signatureOutput = document.getElementById('signatureOutput');
	const errorOutput = document.getElementById('errorOutput');

	let selectedAccount = null;
	let currentChainId = null;

	function hexlifyNumber(value) {
		if (value === '' || value === null || value === undefined) return undefined;
		const bn = BigInt(value);
		return '0x' + bn.toString(16);
	}

	function sanitizeAddress(addr) {
		if (!addr) return '';
		return addr.trim();
	}

	function renderCallRow(index, data = {}) {
		const wrapper = document.createElement('div');
		wrapper.className = 'call-row';
		wrapper.dataset.index = String(index);
		wrapper.innerHTML = `
			<div class="grid grid-3">
				<label>
					<span>to</span>
					<input type="text" class="call-to" placeholder="0x..." value="${data.to || ''}">
				</label>
				<label>
					<span>value (wei)</span>
					<input type="number" min="0" class="call-value" placeholder="0" value="${data.value || ''}">
				</label>
				<label>
					<span>data (hex)</span>
					<input type="text" class="call-data" placeholder="0x" value="${data.data || ''}">
				</label>
			</div>
			<div class="row end">
				<button class="danger remove-call">Remove</button>
			</div>
		`;
		wrapper.querySelector('.remove-call').addEventListener('click', () => {
			callsContainer.removeChild(wrapper);
			updatePreview();
		});
		['call-to','call-value','call-data'].forEach(cls => {
			wrapper.querySelector(`.${cls}`).addEventListener('input', updatePreview);
		});
		callsContainer.appendChild(wrapper);
	}

	function readCalls() {
		const rows = Array.from(callsContainer.getElementsByClassName('call-row'));
		return rows.map(row => {
			const to = sanitizeAddress(row.querySelector('.call-to').value);
			const value = row.querySelector('.call-value').value;
			const data = row.querySelector('.call-data').value.trim();
			return { to, value, data };
		}).filter(c => c.to || c.value || c.data);
	}

	function addressesEqual(a, b) {
		if (!a || !b) return false;
		return a.toLowerCase() === b.toLowerCase();
	}

	function buildTypedData() {
		const name = domainNameInput.value.trim() || 'Nested712Demo';
		const version = domainVersionInput.value.trim() || '1';
		const verifyingContractRaw = verifyingContractInput.value.trim();
		const chainId = currentChainId ? Number(currentChainId) : undefined;

		if (verifyingContractRaw && selectedAccount && addressesEqual(verifyingContractRaw, selectedAccount)) {
			throw new Error('verifyingContract cannot be your own account. Leave it blank or use a contract address.');
		}

		const userAccountAddress = sanitizeAddress(userAccountAddressInput.value);
		const expiry = expiryInput.value;
		const calls = readCalls().map(c => ({
			to: sanitizeAddress(c.to),
			value: c.value ? c.value.toString() : '0',
			data: c.data || '0x'
		}));

		const domain = {
			name,
			version,
			...(verifyingContractRaw ? { verifyingContract: verifyingContractRaw } : {}),
			...(chainId ? { chainId } : {}),
		};

		const types = {
			Call: [
				{ name: 'to', type: 'address' },
				{ name: 'value', type: 'uint256' },
				{ name: 'data', type: 'bytes' },
			],
			NestedMessage: [
				{ name: 'userAccountAddress', type: 'address' },
				{ name: 'expiry', type: 'uint256' },
				{ name: 'calls', type: 'Call[]' },
			],
		};

		const message = {
			userAccountAddress,
			expiry: expiry ? expiry.toString() : '0',
			calls,
		};

		return {
			domain,
			message,
			primaryType: 'NestedMessage',
			types,
		};
	}

	function updatePreview() {
		try {
			errorOutput.textContent = '';
			const typed = buildTypedData();
			const payload = {
				domain: typed.domain,
				message: typed.message,
				primaryType: typed.primaryType,
				types: typed.types,
			};
			typedDataPreview.value = JSON.stringify(payload, null, 2);
		} catch (err) {
			errorOutput.textContent = String(err && err.message ? err.message : err);
		}
	}

	async function connectWallet() {
		if (!window.ethereum) {
			throw new Error('MetaMask not detected. Install it to continue.');
		}
		const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
		selectedAccount = accounts[0];
		accountDisplay.textContent = selectedAccount;
		await refreshChainId();
		updatePreview();
	}

	async function refreshChainId() {
		if (!window.ethereum) return;
		const hexId = await window.ethereum.request({ method: 'eth_chainId' });
		currentChainId = parseInt(hexId, 16);
		chainIdInput.value = String(currentChainId);
		updatePreview();
	}

	async function signTypedData() {
		try {
			errorOutput.textContent = '';
			if (!window.ethereum) throw new Error('MetaMask not detected');
			if (!selectedAccount) await connectWallet();

			const typed = buildTypedData();
			const params = [
				selectedAccount,
				JSON.stringify({
					domain: typed.domain,
					message: typed.message,
					primaryType: typed.primaryType,
					types: typed.types,
				})
			];

			const signature = await window.ethereum.request({
				method: 'eth_signTypedData_v4',
				params,
			});
			signatureOutput.value = signature;
		} catch (err) {
			signatureOutput.value = '';
			errorOutput.textContent = String(err && err.message ? err.message : err);
		}
	}

	function addDefaultCallIfEmpty() {
		if (callsContainer.children.length === 0) {
			renderCallRow(0, { to: '', value: '', data: '0x' });
		}
	}

	// Event bindings
	connectBtn.addEventListener('click', () => {
		connectWallet().catch(err => errorOutput.textContent = err.message || String(err));
	});

	addCallBtn.addEventListener('click', () => {
		renderCallRow(callsContainer.children.length);
		updatePreview();
	});

	[userAccountAddressInput, expiryInput, domainNameInput, domainVersionInput, verifyingContractInput, primaryTypeInput].forEach(el => {
		el.addEventListener('input', updatePreview);
	});

	signBtn.addEventListener('click', signTypedData);

	// Wallet listeners
	if (window.ethereum) {
		window.ethereum.on('accountsChanged', (accs) => {
			selectedAccount = accs && accs.length ? accs[0] : null;
			accountDisplay.textContent = selectedAccount || 'Not connected';
			updatePreview();
		});
		window.ethereum.on('chainChanged', () => {
			refreshChainId();
		});
	}

	// Initialize
	addDefaultCallIfEmpty();
	refreshChainId();
	updatePreview();
})();
