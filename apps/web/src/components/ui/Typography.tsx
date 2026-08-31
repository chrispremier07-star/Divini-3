/**
 * DIVINI exo — Primitives typographiques
 *
 * Chaque composant applique exactement un rôle du contrat (LOT 00 §typographie) :
 * famille, taille, graisse, interlignage et tracking en une fois.
 *
 * Règle : on ne compose pas sa typographie à la main. On choisit un rôle.
 * C'est ce qui garantit que « dense mais aéré » tient sur tous les écrans.
 */

import type { ElementType, ReactNode } from 'react';

import styles from './ui.module.css';

type BaseProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

/**
 * Compose des noms de classes.
 *
 * `noUncheckedIndexedAccess` est actif : un accès à un module CSS vaut
 * `string | undefined`. On filtre explicitement plutôt que d'assouplir le
 * compilateur — une classe absente ne doit pas devenir "undefined" dans le DOM.
 */
function cx(...names: Array<string | undefined>): string {
  return names.filter((n): n is string => typeof n === 'string' && n.length > 0).join(' ');
}

function role(roleClass: string | undefined, { children, as: Tag = 'p', className }: BaseProps) {
  return <Tag className={cx(roleClass, className)}>{children}</Tag>;
}

/** Titre de page — Space Grotesk, 24 px, semibold. */
export function Title({ children, as = 'h1', className }: BaseProps) {
  return role(styles.title, { children, as, className });
}

/** Titre de section — Space Grotesk, 17 px. */
export function Subtitle({ children, as = 'h2', className }: BaseProps) {
  return role(styles.subtitle, { children, as, className });
}

/** Texte courant — Inter, 13,5 px, interligne 1,5. */
export function Body({ children, as = 'p', className }: BaseProps) {
  return role(styles.body, { children, as, className });
}

/** Texte secondaire — Inter, 11,5 px. Jamais en dessous : la lisibilité prime. */
export function Caption({ children, as = 'p', className }: BaseProps) {
  return role(styles.caption, { children, as, className });
}

/**
 * Valeur monospace — montants, identifiants, références.
 *
 * Ce n'est pas décoratif : le mono aligne les chiffres en colonnes et rend une
 * référence scannable dans un tableau de 200 lignes (corpus l. 7801-7811).
 */
export function MonoValue({ children, as = 'span', className }: BaseProps) {
  return role(styles.monoValue, { children, as, className });
}

/** Libellé de section — très petit, capitales, tracking large. */
export function SectionLabel({ children, as = 'span', className }: BaseProps) {
  return role(styles.sectionLabel, { children, as, className });
}
