/**
 * DIVINI exo — Stocks · barrel (LOT 07)
 *
 * Un seul point d'entrée : les routes et le shell importent le module sans
 * connaître son découpage interne.
 */

export { StockOverview } from './overview';
export { ProductList, ProductDetail, ProductForm } from './products';
export { CategoriesScreen } from './categories';
export { MovementList, MovementDetail, MovementForm } from './movements';
export { InventoryList, InventoryDetail } from './inventories';
export { WarehouseList, WarehouseDetail } from './warehouses';

export {
  STOCK_PRODUCTS,
  MOVEMENTS,
  CATEGORIES,
  WAREHOUSES,
  INVENTORIES,
  VARIANTS,
  stockOf,
  stockLevel,
  stockValuation,
  atRiskProducts,
  dormantProducts,
  movementsOf,
  findProduct,
  findMovement,
  findCategory,
  findWarehouse,
  findInventory,
  categoryLabel,
  suggestCategories,
  warehouseUsed,
  warehouseSaturation,
  lineVariance,
  hasVariance,
  countProgress,
  variantsOf,
  canCreate,
  formatFcfa,
  STOCK_LEVEL_META,
  MOVEMENT_TYPE_LABELS,
  INVENTORY_STATUS_META,
  CREATE_PERMISSION,
  CREATE_CONTACT,
  DORMANT_DAYS
} from './mock';
export type {
  StockProduct,
  Movement,
  MovementType,
  Category,
  Warehouse,
  InventorySession,
  InventoryLine,
  InventoryStatus,
  Variant,
  StockLevel
} from './mock';
