/**
 * DIVINI exo — Point d'entrée des primitives du Design System
 *
 * Un module importe ses primitives d'ici, jamais d'un fichier interne :
 * c'est ce qui rend visible toute duplication (règle l. 3423-3439).
 */

export { Icon, ICON_NAMES, type IconName } from './Icon';
export {
  Title,
  Subtitle,
  Body,
  Caption,
  MonoValue,
  SectionLabel
} from './Typography';
export {
  Avatar,
  Badge,
  SeverityIndicator,
  StatusDot,
  TONE_SEVERITY,
  type Tone
} from './Identity';
export {
  Button,
  IconButton,
  type ButtonSize,
  type ButtonVariant
} from './Button';
export { ContextMenu, Dropdown, type MenuItem } from './Menu';
export { ConfirmDialog, Drawer, Modal } from './Overlay';
export { ToastProvider, useToast, type ToastInput, type ToastTone } from './Toast';
export {
  Alert,
  EmptyState,
  ErrorState,
  ModuleUnavailable,
  OfflineState,
  PermissionDenied,
  Skeleton,
  SkeletonBlock,
  SyncingState
} from './Feedback';
export {
  Checkbox,
  DatePicker,
  FieldGroup,
  FileUpload,
  Input,
  RadioGroup,
  Search,
  Select,
  Stepper,
  Switch,
  type FieldSize
} from './Field';
