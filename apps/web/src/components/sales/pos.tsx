/**
 * DIVINI exo — Point de vente (LOT 06 §2.1.1)
 *
 * Parcours « vendre en moins d'une minute » : recherche → ajout → encaissement.
 * Tactile ET clavier. Aucune perte de saisie : mise en attente, reprise, et en
 * cas de coupure la vente part en file locale avec statut visible (offline/syncing).
 *
 * Paiements : moyens **abstraits** (jamais un prestataire réel, l. 499-516) ;
 * l'encaissement est une simulation locale explicitement signalée, jamais un
 * « paiement réussi » présenté comme provenant d'un prestataire.
 */

'use client';

import { useMemo, useState } from 'react';

import { Badge, Button, IconButton } from '../ui';
import { Icon } from '../ui/Icon';
import { Modal, Drawer } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

import { useShellState } from '../../lib/shell-state';

import {
  PAYMENT_MEAN_LABELS,
  searchProducts,
  docTotal,
  formatFcfa,
  type PaymentMean,
  type Product,
  type SaleLine,
  type SalesDoc
} from './mock';

import styles from './sales.module.css';

type CartLineState = { product: Product; qty: number };
type HeldSale = { id: string; label: string; lines: CartLineState[]; discount: number };

const ALL_MEANS: PaymentMean[] = ['especes', 'mobile', 'carte', 'banque'];

export function Pos() {
  const { connection } = useShellState();
  const { push } = useToast();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLineState[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customer, setCustomer] = useState('Vente anonyme');
  const [means, setMeans] = useState<PaymentMean[]>(['especes']);
  const [held, setHeld] = useState<HeldSale[]>([]);
  const [heldOpen, setHeldOpen] = useState(false);
  const [receipt, setReceipt] = useState<SalesDoc | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const offline = connection === 'offline';

  const products = useMemo(() => searchProducts(search), [search]);

  const lines: SaleLine[] = cart.map((c) => ({
    productId: c.product.id,
    label: c.product.label,
    qty: c.qty,
    unitPrice: c.product.price,
    tva: c.product.tva
  }));
  const total = docTotal({ lines, discount });

  const add = (product: Product) => {
    if (product.stock <= 0) {
      push({ tone: 'warning', title: 'Rupture de stock', description: `${product.label} n'est plus disponible (démo).` });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) return prev.map((c) => (c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { product, qty: 1 }];
    });
  };

  const setQty = (id: string, qty: number) => {
    setCart((prev) => (qty <= 0 ? prev.filter((c) => c.product.id !== id) : prev.map((c) => (c.product.id === id ? { ...c, qty } : c))));
  };

  const hold = () => {
    if (cart.length === 0) return;
    setHeld((prev) => [...prev, { id: `held-${Date.now()}`, label: `${customer} · ${cart.length} art.`, lines: cart, discount }]);
    setCart([]);
    setDiscount(0);
    push({ tone: 'info', title: 'Vente mise en attente', description: 'Reprenez-la depuis « Ventes en attente ».' });
  };

  const resume = (sale: HeldSale) => {
    setCart(sale.lines);
    setDiscount(sale.discount);
    setHeld((prev) => prev.filter((h) => h.id !== sale.id));
    setHeldOpen(false);
  };

  const checkout = () => {
    if (cart.length === 0 || checkingOut) return;
    setCheckingOut(true);
    window.setTimeout(() => {
      const sale: SalesDoc = {
        id: `vnt-session-${Date.now()}`,
        kind: 'vente',
        ref: `VNT-2026-${String(100 + held.length + cart.length).padStart(4, '0')}`,
        date: new Date().toISOString(),
        customer,
        lines,
        discount,
        status: offline ? 'offline' : 'encaissee',
        means,
        siteId: 'siege',
        synced: !offline
      };
      setCheckingOut(false);
      setReceipt(sale);
      setCart([]);
      setDiscount(0);
      push(
        offline
          ? { tone: 'warning', title: 'Vente en file locale', description: 'Hors ligne : elle sera synchronisée au retour (démo).' }
          : { tone: 'success', title: 'Encaissement enregistré (démo)', description: 'Simulation locale — aucun paiement réel.' }
      );
    }, 400);
  };

  return (
    <div className={styles.pos}>
      <p className={styles.demoBanner} role="note">
        Point de vente de démonstration — aucun paiement réel, aucun stock réel.
      </p>

      <div className={styles.posBody}>
        {/* ------------------------------ catalogue ----------------------------- */}
        <section className={styles.posCatalog} aria-label="Catalogue de produits">
          <div className={styles.posSearch}>
            <Icon name="search" size="var(--ctl-icon-sm)" />
            <input
              className={styles.posSearchInput}
              placeholder="Rechercher un produit, une référence…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher un produit"
            />
          </div>

          {products.length === 0 ? (
            <p className={styles.posEmpty}>Aucun produit ne correspond à « {search} ».</p>
          ) : (
            <div className={styles.productGrid}>
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={styles.productTile}
                  onClick={() => add(p)}
                  disabled={p.stock <= 0}
                >
                  <span className={styles.productLabel}>{p.label}</span>
                  <span className={styles.productRef}>n° {p.ref}</span>
                  <span className={styles.productPrice}>{formatFcfa(p.price)}</span>
                  <span className={styles.productStock}>
                    {p.stock <= 0 ? <Badge tone="critical">rupture</Badge> : p.stock < 10 ? <Badge tone="warning">stock {p.stock}</Badge> : <Badge tone="neutral">{p.stock}</Badge>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ------------------------------- panier ------------------------------ */}
        <aside className={styles.cart} aria-label="Panier">
          <div className={styles.cartHead}>
            <h2 className={styles.cartTitle}>Panier</h2>
            <Button variant="ghost" size="sm" onClick={() => setHeldOpen(true)}>
              Ventes en attente ({held.length})
            </Button>
          </div>

          <label className={styles.cartField}>
            <span className="t-label">Client</span>
            <select className={styles.select} value={customer} onChange={(e) => setCustomer(e.target.value)}>
              <option>Vente anonyme</option>
              <option>Client — Awa Diop</option>
              <option>Client — Moussa Traoré</option>
            </select>
          </label>

          {cart.length === 0 ? (
            <p className={styles.cartEmpty}>Panier vide — touchez un produit pour l'ajouter.</p>
          ) : (
            <ul className={styles.cartLines}>
              {cart.map((c) => (
                <li key={c.product.id} className={styles.cartLine}>
                  <div className={styles.cartLineInfo}>
                    <span className={styles.cartLineLabel}>{c.product.label}</span>
                    <span className={styles.cartLinePrice}>{formatFcfa(c.product.price)}</span>
                  </div>
                  <div className={styles.cartLineQty}>
                    <IconButton icon="minus" label="Réduire" size="sm" variant="ghost" onClick={() => setQty(c.product.id, c.qty - 1)} />
                    <span className={styles.num}>{c.qty}</span>
                    <IconButton icon="plus" label="Augmenter" size="sm" variant="ghost" onClick={() => setQty(c.product.id, c.qty + 1)} />
                    <span className={styles.cartLineTotal}>{formatFcfa(c.qty * c.product.price)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <label className={styles.cartField}>
            <span className="t-label">Remise (F)</span>
            <input
              className={styles.select}
              type="number"
              min={0}
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
            />
          </label>

          <fieldset className={styles.means}>
            <legend className="t-label">Moyens de paiement</legend>
            {ALL_MEANS.map((m) => (
              <label key={m} className={styles.meanRow}>
                <input
                  type="checkbox"
                  checked={means.includes(m)}
                  onChange={(e) =>
                    setMeans((prev) => (e.target.checked ? [...prev, m] : prev.filter((x) => x !== m)))
                  }
                />
                {PAYMENT_MEAN_LABELS[m]}
              </label>
            ))}
          </fieldset>

          <div className={styles.cartTotal}>
            <span>Total</span>
            <span className={`${styles.num} ${styles.total}`}>{formatFcfa(total)}</span>
          </div>

          <div className={styles.cartActions}>
            <Button variant="ghost" size="sm" onClick={hold} disabled={cart.length === 0}>
              Mettre en attente
            </Button>
            <Button variant="primary" size="sm" onClick={checkout} disabled={cart.length === 0 || means.length === 0} aria-busy={checkingOut || undefined}>
              {offline ? 'Encaisser (hors ligne)' : 'Encaisser'}
            </Button>
          </div>
        </aside>
      </div>

      {/* --------------------------- ventes en attente -------------------------- */}
      <Drawer open={heldOpen} onClose={() => setHeldOpen(false)} title="Ventes en attente" size="sm">
        {held.length === 0 ? (
          <p className={styles.cartEmpty}>Aucune vente en attente.</p>
        ) : (
          <ul className={styles.heldList}>
            {held.map((h) => (
              <li key={h.id} className={styles.heldItem}>
                <span>{h.label}</span>
                <Button variant="ghost" size="sm" onClick={() => resume(h)}>
                  Reprendre
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Drawer>

      {/* ------------------------------ aperçu du reçu -------------------------- */}
      <Modal open={receipt !== null} onClose={() => setReceipt(null)} title="Aperçu du reçu" size="sm">
        {receipt ? (
          <div className={styles.receipt}>
            <p className={styles.receiptTitle}>DIVINI exo — reçu (démo)</p>
            <p className={styles.receiptRef}>{receipt.ref}</p>
            <ul className={styles.receiptLines}>
              {receipt.lines.map((l) => (
                <li key={l.productId}>
                  <span>{l.qty} × {l.label}</span>
                  <span className={styles.num}>{formatFcfa(l.qty * l.unitPrice)}</span>
                </li>
              ))}
            </ul>
            {receipt.discount > 0 ? <p className={styles.num}>Remise −{formatFcfa(receipt.discount)}</p> : null}
            <p className={`${styles.num} ${styles.receiptTotal}`}>Total {formatFcfa(docTotal(receipt))}</p>
            <p className={styles.receiptMeans}>{(receipt.means ?? []).map((m) => PAYMENT_MEAN_LABELS[m]).join(' + ')}</p>
            <p className={styles.receiptNote}>
              {receipt.synced ? 'Synchronisé (démo).' : 'En file locale — sera synchronisé.'} Impression réelle et
              personnalisation au LOT 17.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
