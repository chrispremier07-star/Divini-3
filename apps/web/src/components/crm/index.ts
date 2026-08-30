/**
 * DIVINI exo — CRM · barrel (LOT 08)
 */

export { ClientList, ClientDetail, ClientHistory, ClientForm } from './clients';
export { ConsentPanel, DoNotContactBanner } from './consents';
export { SegmentsScreen, SegmentDetail } from './segments';
export { ProspectList, ProspectDetail, ProspectForm } from './prospects';
export { ScenarioList, ScenarioEditor } from './relances';
export { PublicPreferencePage } from './public';

export {
  CLIENTS,
  SEGMENTS,
  PROSPECTS,
  SCENARIOS,
  CONSENTS,
  CONSENT_HISTORY,
  PUBLIC_TOKENS,
  VIP_RULE,
  findClient,
  findSegment,
  findProspect,
  findScenario,
  purchasesOf,
  clientRevenue,
  clientMetrics,
  qualifiesVip,
  prospectMetrics,
  consentsOf,
  consentOf,
  isGranted,
  canSendNow,
  historyOf,
  buildConsentEvent,
  resolveToken,
  formatFcfa,
  CONSENT_STATUS_META,
  CONSENT_CATEGORY_LABELS,
  PROSPECT_STATUS_META,
  INTEREST_LABELS,
  SOURCE_LABELS,
  TRIGGER_LABELS,
  AUDIENCE_LABELS
} from './mock';
export type {
  Client,
  Segment,
  Prospect,
  ProspectStatus,
  ProspectSource,
  InterestLevel,
  Scenario,
  Consent,
  ConsentStatus,
  ConsentCategory,
  ConsentEvent,
  VipRule,
  ClientMetrics,
  PublicPreferenceToken,
  PublicTokenStatus
} from './mock';
