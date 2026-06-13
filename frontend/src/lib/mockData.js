export const MOCK_STRATEGIES = [
  { token_id: 1, creator: '0xAlice', parent_id: 0, content_hash: '0xabc1', price_wei: 1e18, royalty_bps: 1000, parent_royalty_bps: 0, agent_id: '0xagent1', active: true, latest_score_bps: 1850, snapshot_count: 12 },
  { token_id: 2, creator: '0xBob', parent_id: 1, content_hash: '0xabc2', price_wei: 1.5e18, royalty_bps: 800, parent_royalty_bps: 200, agent_id: '0xagent2', active: true, latest_score_bps: 2140, snapshot_count: 8 },
  { token_id: 3, creator: '0xCarol', parent_id: 0, content_hash: '0xabc3', price_wei: 0.8e18, royalty_bps: 1200, parent_royalty_bps: 0, agent_id: '0xagent3', active: true, latest_score_bps: 1620, snapshot_count: 15 },
  { token_id: 4, creator: '0xDave', parent_id: 2, content_hash: '0xabc4', price_wei: 2e18, royalty_bps: 600, parent_royalty_bps: 400, agent_id: '0xagent4', active: true, latest_score_bps: 2680, snapshot_count: 6 },
  { token_id: 5, creator: '0xEve', parent_id: 0, content_hash: '0xabc5', price_wei: 1.2e18, royalty_bps: 900, parent_royalty_bps: 0, agent_id: '0xagent5', active: true, latest_score_bps: 1390, snapshot_count: 20 },
  { token_id: 6, creator: '0xFrank', parent_id: 3, content_hash: '0xabc6', price_wei: 1.8e18, royalty_bps: 700, parent_royalty_bps: 300, agent_id: '0xagent6', active: true, latest_score_bps: 1975, snapshot_count: 9 },
];

export const MOCK_BUNDLES = [
  { bundle_id: 1, assembler: '0xCharlie', strategy_ids: [1, 2, 3], price_wei: 3.5e18, active: true },
  { bundle_id: 2, assembler: '0xGrace', strategy_ids: [4, 5], price_wei: 2.8e18, active: true },
];

export const MOCK_LEADERBOARD = MOCK_STRATEGIES
  .filter(s => s.active)
  .sort((a, b) => b.latest_score_bps - a.latest_score_bps)
  .map((s, i) => ({ rank: i + 1, strategy: s, score_bps: s.latest_score_bps }));
