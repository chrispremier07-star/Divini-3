/**
 * DIVINI exo — Command Center · barrel (LOT 04)
 */

export { CommandCenterProvider, useCommandCenter } from './CommandCenter';

export {
  buildCommandIndex,
  searchCommands,
  scoreCommand,
  highlightSegments,
  normalize,
  SECTION_LABELS,
  SECTION_ORDER
} from './search';
export type { CommandItem, CommandSection, CommandKind } from './search';
