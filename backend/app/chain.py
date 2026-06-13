"""
Chain client -- thin wrapper around web3.py.
Fails gracefully when no RPC is configured (e.g. Vercel preview with mock data).
"""
import json
from pathlib import Path
from typing import Any

_ABI_DIR = Path(__file__).parent / "abis"


def _load_abi(name: str) -> list[dict]:
    path = _ABI_DIR / f"{name}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text())


class ChainClient:
    def __init__(self, rpc_url: str):
        self._rpc_url = rpc_url
        self._w3 = None

    def _get_w3(self):
        if self._w3 is None:
            from web3 import Web3
            self._w3 = Web3(Web3.HTTPProvider(self._rpc_url))
        return self._w3

    def is_connected(self) -> bool:
        try:
            return self._get_w3().is_connected()
        except Exception:
            return False

    def get_contract(self, address: str, abi_name: str):
        from web3 import Web3
        w3 = self._get_w3()
        return w3.eth.contract(
            address=Web3.to_checksum_address(address),
            abi=_load_abi(abi_name),
        )

    def call(self, contract_address: str, abi_name: str, fn: str, *args) -> Any:
        c = self.get_contract(contract_address, abi_name)
        return getattr(c.functions, fn)(*args).call()

    def send(
        self,
        contract_address: str,
        abi_name: str,
        fn: str,
        sender_key: str,
        value_wei: int = 0,
        *args,
    ) -> str:
        from web3 import Web3
        w3 = self._get_w3()
        c = self.get_contract(contract_address, abi_name)
        account = w3.eth.account.from_key(sender_key)
        tx = getattr(c.functions, fn)(*args).build_transaction({
            "from": account.address,
            "value": value_wei,
            "nonce": w3.eth.get_transaction_count(account.address),
            "gas": 500_000,
            "gasPrice": w3.eth.gas_price,
        })
        signed = w3.eth.account.sign_transaction(tx, sender_key)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()
