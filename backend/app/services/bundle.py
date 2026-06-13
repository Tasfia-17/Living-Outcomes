"""
BundleService — reads bundle data from the chain.
"""
from app.chain import ChainClient
from app.config import Settings
from app.models.domain import Bundle


class BundleService:
    def __init__(self, chain: ChainClient, settings: Settings):
        self._chain = chain
        self._settings = settings

    def get(self, bundle_id: int) -> Bundle:
        raw = self._chain.call(
            self._settings.bundle_registry_address,
            "BundleRegistry",
            "getBundle",
            bundle_id,
        )
        return Bundle(
            bundle_id=bundle_id,
            assembler=raw[0],
            strategy_ids=list(raw[1]),
            price_wei=raw[2],
            active=raw[3],
        )

    def next_bundle_id(self) -> int:
        return self._chain.call(
            self._settings.bundle_registry_address,
            "BundleRegistry",
            "nextBundleId",
        )

    def list_all(self) -> list[Bundle]:
        nxt = self.next_bundle_id()
        bundles = []
        for i in range(1, nxt):
            b = self.get(i)
            if b.active:
                bundles.append(b)
        return bundles
