"""
Chain client — thin wrapper around web3.py.
Only handles read calls and event decoding. Write calls are signed
externally and submitted here. No private keys stored in this module
except the reporter key (oracle writes only).
"""
import json
from pathlib import Path
from typing import Any

from web3 import Web3

_ABI_DIR = Path(__file__).parent / "abis"


def _load_abi(name: str) -> list[dict]:
    path = _ABI_DIR / f"{name}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text())


class ChainClient:
    def __init__(self, rpc_url: str):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))

    def is_connected(self) -> bool:
        return self.w3.is_connected()

    def get_contract(self, address: str, abi_name: str):
        abi = _load_abi(abi_name)
        return self.w3.eth.contract(
            address=Web3.to_checksum_address(address),
            abi=abi,
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
        c = self.get_contract(contract_address, abi_name)
        account = self.w3.eth.account.from_key(sender_key)
        tx = getattr(c.functions, fn)(*args).build_transaction({
            "from": account.address,
            "value": value_wei,
            "nonce": self.w3.eth.get_transaction_count(account.address),
            "gas": 500_000,
            "gasPrice": self.w3.eth.gas_price,
        })
        signed = self.w3.eth.account.sign_transaction(tx, sender_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        return tx_hash.hex()
