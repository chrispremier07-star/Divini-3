/**
 * DIVINI exo — Fidélité · barrel (LOT 10)
 */

export {
  LoyaltyOverview,
  LoyaltyRulesScreen,
  PointsLedgerScreen,
  ClientLoyaltyPanel
} from './loyalty';

export {
  CLIENTS,
  findClient,
  LOYALTY_PRESETS,
  LOYALTY_LEVELS,
  REWARDS,
  POINTS_OPERATIONS,
  EXPIRING_BATCHES,
  ATTRIBUTION_MODE_LABELS,
  POINTS_VALIDITY_DAYS,
  findPreset,
  operationsOf,
  levelFor,
  nextLevel,
  levelProgress,
  pointsForPayment,
  pointsFromAmount,
  loyaltyStats,
  formatFcfa
} from './mock';
export type {
  LoyaltyPreset,
  AttributionMode,
  PointsOperation,
  LoyaltyLevel,
  Reward,
  ExpiringBatch,
  LoyaltyStats
} from './mock';
