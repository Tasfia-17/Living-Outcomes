# Living Outcomes

> A marketplace where AI-generated work keeps getting better over time -- and every contributor gets paid automatically, forever.

Built for the **Mantle Turing Test Hackathon 2026** -- Track 6 (Agentic Wallets and Economy) + Track 3 (AI x RWA).

---

## The Problem

Every day, AI agents create incredible work -- trading strategies, audit reports, market analysis. But here is what happens:

You pay once. You get the output. That is it.

No ongoing life. No way to improve it. No way to track if it actually works. No way to combine it with other work. And if someone takes your work, improves it, and sells it for more -- you get nothing.

This is why the best AI work stays private. Why everyone rebuilds from scratch. Why innovation moves at 10% of its potential speed.

Three concrete examples:

**The Developer Problem.** A developer spends 40 hours building a smart contract audit tool. Sells it for $500. Someone improves it and sells the improved version for $2,000. The original developer gets $0.

**The Waste Problem.** 100 DeFi protocols each spend $100,000 building similar risk models. Total waste: $10 million. No one shares because sharing pays nothing.

**The Trust Problem.** A Twitter influencer sells a "guaranteed 20% APY" strategy for $1,000. 50 people buy it. The strategy loses money in week 1. The influencer disappears. Buyers have no recourse because there is no verifiable track record.

---

## What We Built

Living Outcomes is a marketplace where AI-generated work keeps getting better over time -- and every person who contributed gets paid automatically, forever.

Think of it as GitHub with automatic royalties -- or OutcomeX with a lifetime of earnings.

---

## How It Works

### Step 1: Create

Alice is a trader. She creates a strategy: "Buy mETH when RSI < 30, sell when RSI > 70."

She uploads it to Living Outcomes. The system:
- Stores the strategy on-chain (Mantle)
- Creates a digital certificate (NFT) proving Alice created it
- Sets the price: $50

Alice earns $50 every time someone uses her strategy.

### Step 2: Improve

Bob sees Alice's strategy. He thinks: "Good, but it doesn't account for EigenLayer slashing risk."

Bob creates an improved version: "Buy mETH when RSI < 30 AND slashing probability < 5%, sell when RSI > 70."

He uploads it as a "child" of Alice's original. The system automatically:
- Links Bob's version to Alice's original (like a GitHub fork)
- Sets Bob's price: $80
- Sends Alice 15% ($12) every time Bob's version sells

Alice earns $12 every time Bob's version sells -- even though she did no new work. Bob earns $68. Buyers get a better strategy. Everyone wins.

### Step 3: Combine

Charlie is a portfolio manager. He wants a bundle:
- Alice's original momentum strategy
- Bob's improved version with slashing protection
- Dave's volatility hedge strategy

Charlie creates "Mantle Alpha Bundle" and sells it for $200.

The system automatically splits the money:

| Contributor | Share | Amount |
|---|---|---|
| Alice | 10% | $20 |
| Bob | 10% | $20 |
| Dave | 10% | $20 |
| Charlie (assembler) | 70% | $140 |

No negotiation. No invoices. All automatic.

### Step 4: Self-Improve

The system watches how each strategy performs in the real market -- not backtests, not simulations, but actual execution on Mantle DeFi protocols.

| Strategy | Return | Drawdown |
|---|---|---|
| Alice's original | 12% | 8% |
| Bob's improved | 15% | 5% |
| Dave's hedge | 18% | 3% |

The system automatically:
- Ranks strategies by performance
- Suggests improvements: "Bob's version performs 25% better -- consider adding slashing protection"
- Adjusts prices: Bob's version goes from $80 to $100 (market demand)
- Rebalances bundles: "Mantle Alpha Bundle" now weights Dave's strategy higher

Like having a stock analyst who never sleeps.

---

## Why This Only Works on Mantle

| Feature | Why It Matters |
|---|---|
| Low gas ($0.01) | Ethereum ($5+) makes frequent royalty updates impossible. We update prices, rankings, and royalties daily. |
| ERC-8004 identity | Every creator is a verified AI agent. No fake accounts. No stolen work. Reputation is real. |
| Byreal Skills CLI | Strategies don't just sit in a PDF -- they execute automatically against real DeFi protocols. |
| x402 payments | Micropayments for every strategy use, every improvement, every bundle sale -- all automatic. |
| $4B+ treasury | Institutional credibility. Real-world asset focus. This isn't a toy -- it is a financial product. |

---

## Architecture

```
+------------------------------------------+
|  LAYER 5: USER INTERFACE                 |
|  - Marketplace (browse, search, filter)  |
|  - Creator dashboard (upload, earnings)  |
|  - Performance dashboard (real data)     |
|  - Bundle builder (drag and drop)        |
|  - Improvement suggestions               |
+------------------------------------------+
                    |
+------------------------------------------+
|  LAYER 4: ORCHESTRATION                  |
|  - Request routing                       |
|  - Strategy ranking                      |
|  - Improvement suggestions               |
|  - Execution routing                     |
|  - Outcome tracking                      |
+------------------------------------------+
                    |
+------------------------------------------+
|  LAYER 3: FINANCIAL                      |
|  - Strategy creation (mint NFT)          |
|  - Strategy sale (auto-payment)          |
|  - Improvement royalties (auto-split)    |
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
|  - Audit trail (Mantle blockchain)       |
+------------------------------------------+
                    |
+------------------------------------------+
|  LAYER 1: INFRASTRUCTURE                 |
|  - Mantle Network (low gas)              |
|  - ERC-8004 (agent identity)             |
|  - Byreal Skills CLI (execution)         |
|  - x402 (micropayments)                  |
|  - DeFi Protocols (real markets)         |
+------------------------------------------+
```

### Code Structure

```
living-outcomes/
  contracts/        Solidity smart contracts (Foundry)
    src/
      StrategyNFT.sol         ERC-721 + ERC-2981 strategy ownership with forking and royalties
      StrategyMarketplace.sol Fixed-price listings, enforces royalty splits on every sale
      BundleRegistry.sol      Assembles strategy sets, splits revenue automatically
      PerformanceOracle.sol   Records snapshots, computes EWA score on-chain
      AgentRegistry.sol       Maps wallet to agent identity (ERC-8004 compatible)
    test/
      LivingOutcomes.t.sol    17 tests, all passing
    script/
      Deploy.s.sol            Deploy all contracts in sequence

  backend/          Python FastAPI server
    app/
      main.py                 App factory, router registration
      config.py               Pydantic settings from .env
      chain.py                web3.py wrapper (call + send)
      dependencies.py         FastAPI DI -- service construction
      models/domain.py        Pure Python dataclasses (no ORM)
      services/
        strategy.py           Reads StrategyNFT + PerformanceOracle
        bundle.py             Reads BundleRegistry
        leaderboard.py        Ranks strategies by EWA score
      routes/
        strategies.py         GET/POST /api/v1/strategies/
        bundles.py            GET /api/v1/bundles/
        leaderboard.py        GET /api/v1/leaderboard/
        health.py             GET /health
      abis/                   Extracted ABIs from Foundry build output
    tests/
      test_backend.py         10 tests, all passing (chain fully mocked)

  frontend/         React + Vite
    src/
      App.jsx                 Router + animated page transitions
      pages/
        Landing.jsx           Hero, gallery, how-it-works, CTA
        Strategies.jsx        Sortable strategy grid
        StrategyDetail.jsx    Detail + animated SVG performance chart
        Bundles.jsx           Bundle grid
        BundleDetail.jsx      Detail + animated revenue split bar
        Leaderboard.jsx       Dark room ranked table with animated bars
      components/
        Nav.jsx               Minimal fixed header
        StrategyCard.jsx      Score bar, tier styling, fork indicator
        BundleCard.jsx        Dark card, strategy tag links
        Loader.jsx            Skeleton animation
      lib/
        api.js                Fetch wrapper for backend
        useApi.js             Data fetching hook
        mockData.js           Development mock data (no backend needed)
```

---

## Sponsor Integration

We didn't just build a project. We built a project that uses every major sponsor deeply.

| Sponsor | How We Use Them | Why They Care |
|---|---|---|
| **Bybit** | Price data for performance benchmarking; execution API for trading strategies; white-label for 30M+ users | Post-$1.4B hack, they need verified, on-chain performance tracking |
| **Byreal** | Execution engine (Byreal Skills CLI); agent identity framework; Emily Bao (judge) understands our architecture | We bring buyers to their execution infrastructure |
| **BGA** | Public verifiability; democratized access ($50-200 vs hedge fund $50K); fair creator compensation | Real-world example of blockchain for economic fairness |
| **Tencent Cloud** | GPU instances for backtesting; AI model hosting; enterprise distribution to TradFi clients | Compelling Web3 use case for their cloud services |
| **Mirana Ventures** | Drive mETH/cmETH usage; investable marketplace ($100K+ monthly volume); deal flow from quant creators | We grow Mantle's ecosystem and create investable businesses |
| **Nansen** | Verify performance claims; smart money signals for strategy building; institutional sales channel | New use case for their data (strategy verification) |
| **Elfa AI** | Sentiment-based strategies; social monitoring for strategy quality; viral detection for pricing | New distribution channel for their sentiment data |
| **Surf / Orbit / Z.ai** | Host AI models (LSTM, NLP); agent framework integration; compute cost optimization | Customers who need AI inference at scale |
| **Animoca Minds** | Gamification (leaderboards, badges, NFTs); strategy-as-NFT design; consumer app interfaces | New category of composable, improvable digital assets |
| **DoraHacks** | Developer onboarding pipeline; hackathon project distribution; grant recipient monetization | Monetization layer for their hackathon ecosystem |
| **Virtuals Protocol** | Agent-to-agent payment coordination; multi-agent strategy collaboration; reputation system integration | Real-world agent economy use case |
| **Caladan** | Strategy quality review; risk assessment frameworks; institutional buyer network; market making | Marketplace for their quant expertise |
| **Hashed** | Series A investment target; Korean market access; protocol connections; governance advocacy | High-growth marketplace with network effects |

---

## Economics

**Strategy sale:**
- Seller net = price minus platform fee minus parent royalty
- Parent royalty: configurable per fork (default 10% of price to original creator)
- Platform fee: 10 basis points

**Bundle sale:**
- Assembler: 70% of revenue
- Each constituent strategy: 30% divided by N strategies

**Performance scoring (EWA -- Exponentially Weighted Average):**
- Computed on-chain from reporter-submitted snapshots
- Older snapshots carry higher weight -- rewards consistent performance over lucky spikes
- Score updates trigger automatic price and ranking adjustments

**Transfer guard:**
- Strategy NFT cannot be transferred while listed for sale (safe ownership semantics)

---

## Running Locally

### Contracts

```bash
cd contracts
forge test -vv          # 17/17 tests pass
forge script script/Deploy.s.sol --broadcast --rpc-url <RPC_URL>
```

### Backend

```bash
cd backend
cp .env.example .env    # fill in contract addresses after deploy
pip install -e ".[dev]"
uvicorn app.main:app --reload
python -m pytest tests/ -v   # 10/10 tests pass
```

### Frontend

```bash
cd frontend
cp .env.example .env    # VITE_USE_MOCK=true by default
npm install
npm run dev             # runs on http://localhost:5173
```

Set `VITE_USE_MOCK=false` and configure `VITE_API_URL` to connect to a live backend.

### API Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/strategies/` | List all active strategies |
| GET | `/api/v1/strategies/{id}` | Single strategy with EWA score |
| GET | `/api/v1/strategies/{id}/snapshots` | Performance snapshot history |
| POST | `/api/v1/strategies/{id}/snapshots` | Submit snapshot (reporter key required) |
| GET | `/api/v1/bundles/` | List all active bundles |
| GET | `/api/v1/bundles/{id}` | Single bundle with constituent strategies |
| GET | `/api/v1/leaderboard/?limit=20` | Ranked strategies by EWA score |
| GET | `/health` | Chain connectivity check |

---

## Design

The frontend uses a Renaissance gallery aesthetic -- warm putty-beige canvas, stark black sections, classical painting imagery, serif display typography. Every animation is purposeful: score bars fill on scroll, performance charts draw in on load, leaderboard rows cascade in with staggered delays.

No gradients. No shadows. No modern illustrations. Depth comes from alternating light and dark full-bleed sections.

---

## License

MIT
