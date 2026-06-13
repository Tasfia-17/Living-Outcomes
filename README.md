# Living Outcomes

An open protocol for AI-generated strategies that evolve over time, with every contributor earning automatically and permanently on-chain.

Built for the **Mantle Turing Test Hackathon 2026** - Track 6 (Agentic Wallets and Economy) + Track 3 (AI x RWA).

---

## The Problem

Every day, AI agents produce valuable work: trading strategies, audit reports, market analysis. The current model breaks this in four ways.

**AI work is disposable.** You pay for a strategy. You receive the output. The transaction ends. The work has no future life, no improvement path, and no performance record.

**There is no incentive to share.** Because creators receive nothing when their work is reused or improved, they keep their best ideas private. Every team rebuilds from scratch. A developer spends 40 hours building a smart contract audit tool, sells it for $500, watches someone improve it and sell that version for $2,000, and receives nothing from the second sale.

**There is no performance truth.** When you acquire a strategy, you cannot verify whether it actually works. The creator says "12% APY." There is no on-chain record proving or disproving that claim. The strategy could have worked once in a backtest and fail continuously in real markets.

**Combining work is practically impossible.** To assemble three strategies into a portfolio, you negotiate with three creators, manage three separate agreements, and coordinate three payment flows. Nobody does this. The best ideas stay isolated instead of compounding into something better.

---

## What Living Outcomes Is

Living Outcomes is a protocol where AI-generated strategies are issued as on-chain assets, where every improvement fork pays the original creator automatically, where bundles split revenue among all contributors without negotiation, and where real performance is tracked and scored on-chain.

Think of it as GitHub forks with automatic royalties, combined with an on-chain performance record that never stops updating.

---

## How It Works

### Step 1: Create

Alice is a trader. She creates a strategy: "Buy mETH when RSI < 30, sell when RSI > 70."

She submits it to the protocol. The system:
- Stores the strategy on-chain (Mantle)
- Mints an NFT proving Alice created it, with configurable royalty terms
- Sets the price: $50

Alice earns $50 every time someone acquires her strategy.

### Step 2: Improve

Bob examines Alice's strategy. He identifies a gap: it does not account for EigenLayer slashing risk.

Bob creates an improved version: "Buy mETH when RSI < 30 AND slashing probability < 5%, sell when RSI > 70."

He registers it as a child of Alice's original. The protocol automatically:
- Links Bob's version to Alice's original (a verifiable on-chain fork)
- Sets Bob's price: $80
- Routes 15% ($12) of every Bob sale to Alice

Alice earns $12 every time Bob's version is acquired, without any further work. Bob earns $68. Buyers receive a stronger strategy. The protocol enforces all of this without intermediaries.

### Step 3: Combine

Charlie is a portfolio manager. He wants to assemble three strategies into a single product:
- Alice's original momentum strategy
- Bob's improved version with slashing protection
- Dave's volatility hedge strategy

Charlie registers a bundle at $200. The protocol distributes revenue automatically on every sale:

| Contributor | Share | Amount |
|---|---|---|
| Alice | 10% | $20 |
| Bob | 10% | $20 |
| Dave | 10% | $20 |
| Charlie (assembler) | 70% | $140 |

No invoices. No negotiation. No trust required between parties.

### Step 4: Self-Improve

The protocol continuously tracks how each strategy performs against real Mantle DeFi protocols, not simulations or backtests.

| Strategy | Return | Drawdown |
|---|---|---|
| Alice's original | 12% | 8% |
| Bob's improved | 15% | 5% |
| Dave's hedge | 18% | 3% |

Based on verified on-chain performance, the system:
- Updates rankings automatically
- Surfaces improvement suggestions: "Bob's version outperforms Alice's by 25% - consider adding slashing protection"
- Adjusts pricing signals based on demand and performance
- Rebalances bundle weightings to reflect current performance data

---

## Why Mantle

| Feature | Why It Matters |
|---|---|
| Low gas ($0.01) | Ethereum gas ($5+) makes daily royalty updates, price adjustments, and performance snapshots economically unviable. This only works at sub-cent transaction costs. |
| ERC-8004 agent identity | Every creator is a verified AI agent with an on-chain identity. Reputation is permanent and unforgeable. |
| Byreal Skills CLI | Strategies execute automatically against live DeFi protocols. Performance data is real, not simulated. |
| x402 micropayments | Every strategy acquisition, improvement royalty, and bundle revenue split flows automatically without manual settlement. |
| $4B+ community treasury | Institutional credibility and real-world asset infrastructure. This is a financial product, not a demo. |

---

## Architecture

```
+------------------------------------------+
|  LAYER 5: USER INTERFACE                 |
|  - Strategy browser (search, filter)     |
|  - Creator dashboard (submit, earnings)  |
|  - Performance dashboard (live data)     |
|  - Bundle builder (compose, price)       |
|  - Improvement suggestions               |
+------------------------------------------+
                    |
+------------------------------------------+
|  LAYER 4: ORCHESTRATION                  |
|  - Request routing                       |
|  - Strategy ranking engine               |
|  - Improvement signal generation         |
|  - Execution routing to Byreal           |
|  - Outcome tracking                      |
+------------------------------------------+
                    |
+------------------------------------------+
|  LAYER 3: FINANCIAL                      |
|  - Strategy issuance (mint NFT)          |
|  - Acquisition payment (auto-split)      |
|  - Fork royalties (auto-route)           |
|  - Bundle revenue (auto-distribute)      |
|  - Performance bonuses                   |
+------------------------------------------+
                    |
+------------------------------------------+
|  LAYER 2: VERIFICATION                   |
|  - On-chain execution (real protocols)   |
|  - Performance oracle (Nansen + Bybit)   |
|  - Reputation scoring (ERC-8004)         |
|  - Fraud detection                       |
|  - Permanent audit trail (Mantle)        |
+------------------------------------------+
                    |
+------------------------------------------+
|  LAYER 1: INFRASTRUCTURE                 |
|  - Mantle Network (low-cost execution)   |
|  - ERC-8004 (agent identity registry)    |
|  - Byreal Skills CLI (live execution)    |
|  - x402 (automatic micropayments)        |
|  - Mantle DeFi Protocols (real markets)  |
+------------------------------------------+
```

---

## Code Structure

```
living-outcomes/
  contracts/        Solidity smart contracts (Foundry)
    src/
      StrategyNFT.sol         ERC-721 + ERC-2981 ownership with fork chains and royalties
      StrategyMarketplace.sol Fixed-price acquisition, royalty splits enforced on every sale
      BundleRegistry.sol      Registers strategy sets, distributes revenue automatically
      PerformanceOracle.sol   Records performance snapshots, computes EWA score on-chain
      AgentRegistry.sol       Maps wallet to agent identity (ERC-8004 compatible)
    test/
      LivingOutcomes.t.sol    17 tests, all passing
    script/
      Deploy.s.sol            Deploys all contracts in sequence

  backend/          Python FastAPI server
    app/
      main.py                 App factory, router registration
      config.py               Pydantic settings from .env
      chain.py                web3.py call and send wrapper
      dependencies.py         FastAPI dependency injection
      models/domain.py        Pure Python dataclasses, no ORM
      services/
        strategy.py           Reads StrategyNFT and PerformanceOracle
        bundle.py             Reads BundleRegistry
        leaderboard.py        Ranks strategies by EWA score
      routes/
        strategies.py         GET/POST /api/v1/strategies/
        bundles.py            GET /api/v1/bundles/
        leaderboard.py        GET /api/v1/leaderboard/
        health.py             GET /health
      abis/                   ABIs extracted from Foundry build output
    tests/
      test_backend.py         10 tests, all passing (chain fully mocked)

  frontend/         React + Vite
    src/
      App.jsx                 Router with animated page transitions
      pages/
        Landing.jsx           Hero, feature gallery, how-it-works, CTA
        Strategies.jsx        Sortable strategy grid
        StrategyDetail.jsx    Detail view with animated performance chart
        Bundles.jsx           Bundle grid
        BundleDetail.jsx      Detail view with animated revenue split bar
        Leaderboard.jsx       Ranked table with animated score bars
      components/
        Nav.jsx               Minimal fixed header
        StrategyCard.jsx      Score bar, tier styling, fork lineage indicator
        BundleCard.jsx        Dark card with constituent strategy links
        Loader.jsx            Skeleton loading animation
      lib/
        api.js                Fetch wrapper for backend API
        useApi.js             Data fetching hook with cancel support
        mockData.js           Dev mock data, no backend required
```

---

## Sponsor Integration

| Sponsor | How We Use Them | Why They Care |
|---|---|---|
| **Bybit** | Price data for performance benchmarking; execution API for live strategy runs; white-label distribution to 30M+ users | Post-$1.4B hack, Bybit needs verified on-chain performance records |
| **Byreal** | Execution engine via Byreal Skills CLI; agent identity framework | We route strategy execution through their infrastructure |
| **BGA** | Public performance verifiability; access to quant strategies at $50-200 instead of hedge fund minimums; permanent creator attribution | Concrete example of blockchain enabling economic fairness |
| **Tencent Cloud** | GPU instances for backtesting pipelines; AI model hosting for LSTM and NLP inference | Web3-native workload for their cloud infrastructure |
| **Mirana Ventures** | mETH and cmETH usage growth; investable protocol at scale | Protocol that deepens Mantle ecosystem liquidity |
| **Nansen** | On-chain data feeds for performance verification; smart money signals as strategy inputs | New product category: verified strategy performance as a data layer |
| **Elfa AI** | Social sentiment feed for sentiment-driven strategies; social signal monitoring for quality detection | New distribution channel for their intelligence product |
| **Surf / Orbit / Z.ai** | AI model hosting; agent framework integration for execution | Customers who need inference at consistent scale |
| **Animoca Minds** | Gamified performance leaderboards; strategy NFT design principles; consumer interfaces | New category of composable, improvable digital assets |
| **DoraHacks** | Developer onboarding pipeline; monetization path for hackathon submissions | Gives hackathon projects a revenue layer beyond the event |
| **Virtuals Protocol** | Agent-to-agent payment coordination; multi-agent collaboration protocols; cross-platform reputation | Production use case for their agent economy primitives |
| **Caladan** | Strategy quality review framework; institutional risk assessment standards; quant buyer network | Channel for their quant expertise beyond proprietary trading |
| **Hashed** | Investment track; Korean quant developer community; governance participation | High-growth protocol with compounding network effects |

---

## Economics

**Strategy acquisition:**
- Seller receives: price minus platform fee minus parent royalty
- Fork royalty: configurable per strategy (default 10% to original creator on every downstream sale)
- Platform fee: 10 basis points

**Bundle acquisition:**
- Assembler receives: 70% of revenue
- Each constituent strategy receives: 30% divided evenly across included strategies

**Performance scoring:**
- EWA (Exponentially Weighted Average) computed on-chain from reporter-submitted snapshots
- Older snapshots carry higher weight, rewarding consistent performance over single lucky results
- Score updates feed back into rankings and pricing signals automatically

**Ownership safety:**
- A strategy NFT cannot be transferred while it has an active listing

---

## Running Locally

### Contracts

```bash
cd contracts
forge test -vv
# 17/17 tests pass
forge script script/Deploy.s.sol --broadcast --rpc-url <RPC_URL>
```

### Backend

```bash
cd backend
cp .env.example .env    # fill in contract addresses after deploy
pip install -e ".[dev]"
uvicorn app.main:app --reload
python -m pytest tests/ -v
# 10/10 tests pass
```

### Frontend

```bash
cd frontend
cp .env.example .env    # VITE_USE_MOCK=true by default, no backend needed
npm install
npm run dev             # http://localhost:5173
```

Set `VITE_USE_MOCK=false` and set `VITE_API_URL` to connect to a running backend.

### API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/strategies/` | List all active strategies |
| GET | `/api/v1/strategies/{id}` | Single strategy with current EWA score |
| GET | `/api/v1/strategies/{id}/snapshots` | Full performance snapshot history |
| POST | `/api/v1/strategies/{id}/snapshots` | Submit a new snapshot (reporter key required) |
| GET | `/api/v1/bundles/` | List all active bundles |
| GET | `/api/v1/bundles/{id}` | Single bundle with constituent strategy list |
| GET | `/api/v1/leaderboard/?limit=20` | Strategies ranked by EWA score |
| GET | `/health` | Chain connectivity status |

---

## Frontend Design

The interface uses a Renaissance gallery aesthetic: warm putty-beige canvas, stark black sections, classical painting imagery, and serif display typography up to 280px. Animations are data-driven: score bars animate on scroll, performance charts draw in on load, leaderboard rows cascade with staggered delays.

No gradients. No shadows. No modern stock imagery. Visual depth comes entirely from alternating light and dark full-bleed sections.

---

## License

MIT
