/**
 * DIVINI exo — Cockpit · barrel (LOT 05)
 */

export { Cockpit } from './Cockpit';
export type { CockpitState } from './Cockpit';

export {
  revenueSeries,
  revenueFor,
  cockpitKpis,
  formatFcfa,
  PERIOD_LABELS,
  WATCH_SIGNALS,
  GOOD_SIGNALS,
  MISSIONS
} from './mock';
export type { CockpitPeriod, CockpitSignal, Mission, MissionStatus, SignalTone } from './mock';
