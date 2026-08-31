/**
 * DIVINI exo — Ventes & Commandes · barrel (LOT 06)
 */

export { Pos } from './pos';
export {
  SalesList,
  DocDetail,
  SaleHistory,
  DocStatusBadge,
  OfflineQueueBar,
  KIND_LABELS,
  KIND_ROUTES
} from './lists';

export {
  PRODUCTS,
  searchProducts,
  SALES_DOCS,
  docsOf,
  findDoc,
  docTotal,
  lineTotal,
  paidAmount,
  remainingAmount,
  formatFcfa,
  STATUS_META,
  STATUS_TRANSITIONS,
  PAYMENT_MEAN_LABELS
} from './mock';
export type {
  Product,
  SaleLine,
  SalesDoc,
  DocKind,
  PaymentMean,
  PaymentStatus,
  InvoiceStatus,
  SaleStatus
} from './mock';
