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
  'download'
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
  download: 'M12 4.5V16M7.5 11.5L12 16l4.5-4.5M4.5 15.5v3a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5v-3'
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
