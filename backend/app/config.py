from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Living Outcomes"
    app_version: str = "0.1.0"

    # Chain
    rpc_url: str = "http://127.0.0.1:8545"
    chain_id: int = 31337

    # Contracts (populated after deploy)
    strategy_nft_address: str = "0x0000000000000000000000000000000000000000"
    marketplace_address: str  = "0x0000000000000000000000000000000000000000"
    bundle_registry_address: str = "0x0000000000000000000000000000000000000000"
    perf_oracle_address: str  = "0x0000000000000000000000000000000000000000"
    agent_registry_address: str = "0x0000000000000000000000000000000000000000"

    # Reporter key (only used server-side for oracle writes)
    reporter_private_key: str = ""

    # Optional integrations
    bybit_api_key: str = ""
    bybit_api_secret: str = ""
    nansen_api_key: str = ""
    elfa_api_key: str = ""


def get_settings() -> Settings:
    return Settings()
