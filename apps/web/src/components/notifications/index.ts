/**
 * DIVINI exo — Notification Center · barrel (LOT 04)
 */

export {
  NotificationProvider,
  NotificationBell,
  NotificationPanel,
  NotificationItem,
  useNotifications
} from './NotificationCenter';

export { useNotificationPrefs, DEFAULT_PREFS, NOTIFICATION_PREFS_KEY } from './prefs';
export type { NotificationPrefs, PrefsStatus } from './prefs';

export { makeNotifications, formatNotificationTime } from './mock';

export {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  CATEGORY_LABELS,
  CATEGORY_ICON,
  CHANNEL_LABELS
} from './types';
export type {
  AppNotification,
  NotificationCategory,
  NotificationChannel,
  NotificationSeverity,
  NotificationDestination,
  NotificationFeedState
} from './types';
