/**
 * DIVINI exo — Système d'icônes linéaires
 *
 * Jeu unique, style linéaire cohérent (LOT 01 §2.1) :
 *   - viewBox 24 × 24, tracé `currentColor`, épaisseur 1,5 ;
 *   - aucun remplissage : une icône n'introduit jamais de couleur propre ;
 *   - bouts et jointures arrondis, même gabarit d'un bout à l'autre du jeu.
 *
 * Une icône est décorative par défaut (`aria-hidden`). Quand elle porte seule
 * le sens — IconButton sans libellé — l'appelant doit fournir `title`.
 */

import type { SVGProps } from 'react';

export const ICON_NAMES = [

  'check',
  'chevronDown',
  'chevronRight',
  'chevronLeft',
  'close',
  'search',
  'plus',
  'minus',
  'info',
  'checkCircle',
  'alertTriangle',
  'alertCircle',
  'wifiOff',
  'refresh',
  'lock',
  'upload',
  'calendar',
  'moreHorizontal',
  'trash',
  'arrowRight',
  'filter',
  'clock',
  'package',
  'sliders',
  'user',
  'file',
  'eye',
  'download',
  'gauge',
  'cart',
  'truck',
  'users',
  'wallet',
  'book',
  'receipt',
  'heart',
  'sparkles',
  'wand',
  'radar',
  'trendingUp',
  'trendingDown',
  'shield',
  'bell',
  'messageCircle',
  'share',
  'barChart',
  'zap',
  'building',
  'userCheck',
  'creditCard',
  'plug',
  'shieldCheck',
  'home',
  'menu',
  'sun',
  'moon',
  'panelLeft',
  'chevronUp',
  'help',
  'logOut',
  'layout',
  'globe',
  'layers',
  'command'
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** Tracés en coordonnées viewBox 24. Un seul gabarit pour tout le jeu. */
const PATHS: Record<IconName, string> = {
  check: 'M4.5 12.5l5 5 10-11',
  chevronDown: 'M6 9.5l6 6 6-6',
  chevronRight: 'M9.5 6l6 6-6 6',
  chevronLeft: 'M14.5 6l-6 6 6 6',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M10.5 4a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM15.4 15.4L20 20',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 7.6v.9',
  checkCircle: 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12.2l2.7 2.7L16 9.6',
  alertTriangle: 'M12 4.2L2.8 19.5h18.4L12 4.2zM12 10v4M12 16.6v.9',
  alertCircle: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.8v4.6M12 15.6v.9',
  wifiOff: 'M3 3l18 18M8.2 12.6a6 6 0 013.3-1.5M5 9.4a11 11 0 013.2-2M19 9.4a11 11 0 00-5.6-2.8M2.5 6.2A15 15 0 0112 3.2c2.6 0 5 .7 7 1.9M9.5 16.2a4 4 0 015 0M12 20.2v.1',
  refresh: 'M20 12a8 8 0 11-2.4-5.7M20 4v4.5h-4.5',
  lock: 'M6.5 10.5h11v9h-11v-9zM9 10.5V8a3 3 0 016 0v2.5M12 14v2.5',
  upload: 'M12 16V4.5M7.5 9L12 4.5 16.5 9M4.5 15.5v3a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5v-3',
  calendar: 'M4.5 6.5h15v13h-15v-13zM4.5 10.5h15M8.5 4v4M15.5 4v4',
  moreHorizontal: 'M6.5 12v.1M12 12v.1M17.5 12v.1',
  trash: 'M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13M10.5 10v6M13.5 10v6',
  arrowRight: 'M4.5 12h14M13.5 6.5L19 12l-5.5 5.5',
  filter: 'M4 5.5h16l-6.2 7.3v5.4l-3.6 1.8v-7.2L4 5.5z',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.5V12l3 2',
  package: 'M12 3.2l8 4.3v9l-8 4.3-8-4.3v-9l8-4.3zM4 7.5l8 4.3 8-4.3M12 11.8v9',
  sliders: 'M4 7.5h10M18 7.5h2M4 16.5h4M12 16.5h8M16 5v5M8 14v5',
  user: 'M12 4a3.8 3.8 0 100 7.6A3.8 3.8 0 0012 4zM4.8 20a7.2 7.2 0 0114.4 0',
  file: 'M6.5 3.5h7L18.5 8v12.5h-12V3.5zM13.5 3.5V8h5',
  eye: 'M2.8 12S6.5 6.2 12 6.2 21.2 12 21.2 12 17.5 17.8 12 17.8 2.8 12 2.8 12zM12 9.4a2.6 2.6 0 100 5.2 2.6 2.6 0 000-5.2z',
  download: 'M12 4.5V16M7.5 11.5L12 16l4.5-4.5M4.5 15.5v3a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5v-3',
  gauge: 'M4 18a8 8 0 1116 0M12 18l4-5.5',
  cart: 'M3 5h2.2l2.4 9.2h8.9l2-6.7H6.6M9 19.4v.1M16 19.4v.1',
  truck: 'M2.5 6.5h10v9.5h-10v-9.5zM12.5 10.5h3.8l3.2 3.2v2.3h-7M7 18.9v.1M16.5 18.9v.1',
  users: 'M9 4.5a3.4 3.4 0 100 6.8 3.4 3.4 0 000-6.8zM2.5 19.5a6.5 6.5 0 0113 0M16.6 5.3a3.2 3.2 0 010 6.2M18.2 14.3a6.4 6.4 0 013.3 5.2',
  wallet: 'M3 7.5h15a2 2 0 012 2v7a2 2 0 01-2 2H4.5A1.5 1.5 0 013 17V6a1.5 1.5 0 011.5-1.5H16M16.4 13v.1',
  book: 'M4.5 4.5h11a2 2 0 012 2v13h-11a2 2 0 01-2-2v-13zM4.5 16.5h13M8.5 4.5v12',
  receipt: 'M6 3.5h12v17l-2.4-1.6-2.4 1.6-2.4-1.6L8.4 20.5 6 18.9v-15.4zM9 8h6M9 12h6',
  heart: 'M12 20s-7.5-4.6-7.5-9.4A4.3 4.3 0 0112 8.2a4.3 4.3 0 017.5 2.4C19.5 15.4 12 20 12 20z',
  sparkles: 'M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8L12 3.5zM18.4 15.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9z',
  wand: 'M5 19l9.5-9.5M15.6 4.4l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1 1-2.4zM6 5l.7 1.7L8.4 7.4l-1.7.7L6 9.8l-.7-1.7-1.7-.7 1.7-.7L6 5z',
  radar: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.6a4.4 4.4 0 100 8.8 4.4 4.4 0 000-8.8zM12 12l6-4.4',
  trendingUp: 'M3.5 16.5l5.5-5.5 3.5 3.5 7-7M15 7.5h4.5V12',
  trendingDown: 'M3.5 7.5l5.5 5.5 3.5-3.5 7 7M15 16.5h4.5V12',
  shield: 'M12 3.2l7.5 3v5.4c0 4.4-3.1 7.6-7.5 9.2-4.4-1.6-7.5-4.8-7.5-9.2V6.2l7.5-3z',
  bell: 'M6.5 10.2a5.5 5.5 0 0111 0v4l1.8 3H4.7l1.8-3v-4zM10 20a2.2 2.2 0 004 0',
  messageCircle: 'M20.8 12a8.4 8.4 0 01-8.4 8.4 9 9 0 01-3.6-.7L3.4 21l1.3-4.2A8.4 8.4 0 013.2 12 8.4 8.4 0 0111.6 3.6 8.4 8.4 0 0120.8 12z',
  share: 'M17.6 8.4a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2zM6.4 14.6a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2zM17.6 20.8a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2zM8.7 10.7l6.6-3.2M8.7 13.3l6.6 3.2',
  barChart: 'M4 20v-9.5M9.5 20V4.5M15 20v-8M20.5 20v-12.5M3 20.5h18',
  zap: 'M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6l1-8z',
  building: 'M4 20.5V5.5A1.5 1.5 0 015.5 4h7A1.5 1.5 0 0114 5.5v15M14 10h4.5A1.5 1.5 0 0120 11.5v9M3 20.5h18M7.5 8h3M7.5 12h3M7.5 16h3',
  userCheck: 'M10 4.2a3.6 3.6 0 100 7.2 3.6 3.6 0 000-7.2zM3.2 20a6.8 6.8 0 0113.6 0M16.2 13.6l2 2 3.6-3.8',
  creditCard: 'M3 6.5h18v11H3v-11zM3 10.5h18M6.5 14.5h3',
  plug: 'M9 3.5v5M15 3.5v5M6.5 8.5h11v3a5.5 5.5 0 01-11 0v-3zM12 17v3.5',
  shieldCheck: 'M12 3.2l7.5 3v5.4c0 4.4-3.1 7.6-7.5 9.2-4.4-1.6-7.5-4.8-7.5-9.2V6.2l7.5-3zM8.9 11.9l2.2 2.2 4.1-4.4',
  home: 'M4 10.6L12 4l8 6.6V20h-5.5v-5.4h-5V20H4v-9.4z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  sun: 'M12 7.6a4.4 4.4 0 100 8.8 4.4 4.4 0 000-8.8zM12 2.6v2M12 19.4v2M4.4 4.4l1.4 1.4M18.2 18.2l1.4 1.4M2.6 12h2M19.4 12h2M4.4 19.6l1.4-1.4M18.2 5.8l1.4-1.4',
  moon: 'M20.4 14.2A8.6 8.6 0 019.8 3.6a8.7 8.7 0 1010.6 10.6z',
  panelLeft: 'M3.5 4.5h17v15h-17v-15zM9.5 4.5v15M13 9.5h4M13 14.5h4',
  chevronUp: 'M6 14.5l6-6 6 6',
  help: 'M12 3a9 9 0 100 18 9 9 0 000-18zM9.7 9.5a2.4 2.4 0 113.9 2c-.8.5-1.6 1-1.6 2M12 16.7v.1',
  logOut: 'M14.5 4.5h3a2 2 0 012 2v11a2 2 0 01-2 2h-3M10 8l-4 4 4 4M6 12h9',
  layout: 'M3.5 4.5h17v15h-17v-15zM3.5 9.5h17M9.5 9.5v10',
  globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3.3 9.5h17.4M3.3 14.5h17.4M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z',
  layers: 'M12 3.2L3 8l9 4.8L21 8l-9-4.8zM3 12.6l9 4.8 9-4.8M3 16.9l9 4.8 9-4.8',
  command: 'M9 8.6h6v6.8H9V8.6zM9 8.6V6.2A2.4 2.4 0 106.6 8.6H9zM15 8.6V6.2A2.4 2.4 0 1117.4 8.6H15zM9 15.4v2.4A2.4 2.4 0 116.6 15.4H9zM15 15.4v2.4a2.4 2.4 0 102.4-2.4H15z'
};

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName;
  /** Taille en pixels — passe par un token de contrôle, jamais en littéral. */
  size?: string;
  /** Rend l'icône porteuse de sens pour les lecteurs d'écran. */
  title?: string;
};

export function Icon({ name, size = 'var(--ctl-icon-md)', title, ...rest }: IconProps) {
  const decorative = !title;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
