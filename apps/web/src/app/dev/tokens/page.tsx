'use client';

/**
 * DIVINI exo — Galerie technique interne des tokens
 *
 * Surface technique, pas une maquette produit. Elle sert à :
 *   - inspecter le contrat de tokens rendu dans les deux thèmes ;
 *   - vérifier la bascule confort / compact ;
 *   - rendre visible ce qui est canonique et ce qui est dérivé (thème clair) ;
 *   - exposer les quinze états obligatoires (V2.7) ;
 *   - afficher le résultat réel du contrôle de contraste.
 *
 * Aucune valeur en dur : cette page lit le contrat et l'affiche.
 */

import {
  borderWidth,
  breakpoint,
  contrastRequirements,
  dark,
  density,
  densityLabels,
  duration,
  easing,
  fontFamily,
  fontSize,
  grid,
  light,
  motionRole,
  radius,
  radiusRole,
  shadow,
  sidebar,
  space,
  state,
  stateNames,
  target,
  themeStatus,
  typeRole,
  zIndex
} from '@divini/design-tokens';

import { useAppearance } from '@/lib/appearance';

import styles from './tokens.module.css';

/* ---------- contraste : même calcul que scripts/check-contrast.mjs ---------- */

function luminance(hex: string): number | null {
  const h = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const chan = [r, g, b].map((v) => {
    const c = (v as number) / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (chan[0] as number) + 0.7152 * (chan[1] as number) + 0.0722 * (chan[2] as number);
}

function ratio(fg: string, bg: string): number | null {
  const a = luminance(fg);
  const b = luminance(bg);
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Accesseur de table de tokens.
 * `noUncheckedIndexedAccess` est actif : une clé absente vaut `undefined`, et la
 * galerie doit l'afficher explicitement plutôt que rendre une cellule vide.
 */
function token(table: Record<string, string>, key: string): string {
  const value = table[key];
  return value === undefined ? `(${key} absent)` : value;
}

/* ---------------------------------- blocs ---------------------------------- */

function Section({
  id,
  title,
  intro,
  children
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.sectionHead}>
        <h2 id={`${id}-title`} className={styles.sectionTitle}>
          {title}
        </h2>
        {intro ? <p className={`${styles.sectionIntro} t-body-small`}>{intro}</p> : null}
      </header>
      {children}
    </section>
  );
}

function SwatchGrid({
  entries,
  paletteName,
  baseBg
}: {
  entries: Array<[string, string]>;
  paletteName: string;
  baseBg: string;
}) {
  return (
    <div className={styles.swatchGrid}>
      {entries.map(([key, value]) => {
        const isText = /text|muted|accent|info|positive|negative|attention|critical/.test(key);
        // Les couleurs de texte sont présentées sur le fond de LEUR propre palette,
        // pas sur celui du thème actif : sinon le rendu dépendrait de la bascule.
        const showOnBg = /^(text|muted|attentionText|infoText|positiveText|negativeText|criticalText|accent|info|positive|negative|attention|critical|onAccent|onInfo|onPositive|onNegative)$/.test(
          key
        );
        const isAlpha = value.startsWith('rgba');
        return (
          <div key={key} className={styles.swatch}>
            <div
              className={styles.swatchChip}
              style={
                showOnBg
                  ? { backgroundColor: baseBg, color: isAlpha ? undefined : value }
                  : { backgroundColor: value }
              }
            >
              {isText ? 'Aa' : ''}
            </div>
            <p className={`${styles.swatchName} t-mono-id`}>
              --c-{key.replace(/([A-Z])/g, '-$1').toLowerCase()}
            </p>
            <p className={`${styles.swatchValue} t-caption`}>{value}</p>
            <p className={`${styles.swatchPal} t-caption`}>{paletteName}</p>
          </div>
        );
      })}
    </div>
  );
}

function TokenTable({
  rows,
  columns
}: {
  rows: Array<Array<string>>;
  columns: Array<string>;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col" className="t-table-header">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join('|')}>
              {r.map((cell, i) => (
                <td key={i} className={i === 0 ? 't-mono-id' : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------- galerie --------------------------------- */

export default function TokensGallery() {
  const { theme, density: densityMode, setTheme, setDensity, toggleTheme } = useAppearance();

  const darkEntries = Object.entries(dark) as Array<[string, string]>;
  const lightEntries = Object.entries(light) as Array<[string, string]>;

  const contrastRows = contrastRequirements.map((r) => {
    const palette = r.theme === 'dark' ? dark : light;
    const fg = token(palette as Record<string, string>, r.fg);
    const bg = token(palette as Record<string, string>, r.bg);
    const value = ratio(fg, bg);
    return [
      r.theme,
      `${r.fg} / ${r.bg}`,
      value === null ? '—' : `${value.toFixed(2)}:1`,
      `${r.min}:1`,
      value !== null && value >= r.min ? 'conforme' : 'ÉCHEC'
    ];
  });

  const failures = contrastRows.filter((r) => r[4] === 'ÉCHEC').length;
  const worst = contrastRows
    .map((r) => parseFloat((r[2] as string).replace(':1', '')))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b)[0];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={`${styles.eyebrow} t-section-label`}>surface technique interne</p>
          <h1 className={styles.title}>Contrat de tokens</h1>
          <p className={`${styles.lede} t-body`}>
            Source unique de vérité visuelle. Cette page n’est pas une maquette produit :
            elle affiche le contrat tel qu’il est défini dans{' '}
            <code className="t-mono-id">packages/design-tokens</code>.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <span className={`${styles.controlLabel} t-section-label`}>thème</span>
            <div className={styles.segmented} role="group" aria-label="Thème">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.segment} ${theme === t ? styles.segmentActive : ''}`}
                  aria-pressed={theme === t}
                  onClick={() => setTheme(t)}
                >
                  {t === 'dark' ? 'sombre' : 'clair'}
                </button>
              ))}
            </div>
            <button type="button" className={styles.textButton} onClick={toggleTheme}>
              basculer
            </button>
          </div>

          <div className={styles.controlGroup}>
            <span className={`${styles.controlLabel} t-section-label`}>densité</span>
            <div className={styles.segmented} role="group" aria-label="Densité">
              {(['comfortable', 'compact'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`${styles.segment} ${densityMode === d ? styles.segmentActive : ''}`}
                  aria-pressed={densityMode === d}
                  onClick={() => setDensity(d)}
                >
                  {densityLabels[d]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <Section
        id="statut"
        title="Statut des thèmes"
        intro="Ce qui est canonique et ce qui est dérivé — distinction affichée sans ambiguïté."
      >
        <div className={styles.statusGrid}>
          {(['dark', 'light'] as const).map((t) => {
            const s = themeStatus[t];
            return (
              <article
                key={t}
                className={`${styles.statusCard} ${s.canonical ? styles.statusCanonical : styles.statusDerived}`}
              >
                <h3 className="t-card-title">{t === 'dark' ? 'Thème sombre' : 'Thème clair'}</h3>
                <p className={`${styles.statusBadge} t-label`}>
                  {s.canonical ? 'canonique' : 'dérivé — à valider'}
                </p>
                <p className={`${styles.statusOrigin} t-mono-value-small`}>{s.origin}</p>
                <p className="t-body-small">{s.note}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        id="couleurs"
        title="Couleurs"
        intro="Thème sombre : corpus l. 7785-7799, valeurs verrouillées. Thème clair : dérivé, contrastes vérifiés."
      >
        <h3 className={styles.subTitle}>Primitives — thème sombre (canonique)</h3>
        <SwatchGrid entries={darkEntries} paletteName="sombre" baseBg={dark.bg} />
        <h3 className={styles.subTitle}>Primitives — thème clair (dérivé)</h3>
        <SwatchGrid entries={lightEntries} paletteName="clair" baseBg={light.bg} />
      </Section>

      <Section
        id="contraste"
        title="Contraste WCAG"
        intro={`Contrôle calculé à la volée, identique à scripts/check-contrast.mjs. ${contrastRows.length} paires, pire ${worst?.toFixed(2)}:1, ${failures} échec(s).`}
      >
        <TokenTable
          columns={['thème', 'paire', 'ratio', 'seuil', 'verdict']}
          rows={contrastRows}
        />
      </Section>

      <Section
        id="typographie"
        title="Typographie"
        intro="Trois familles, rôles exclusifs. Aucune autre police n’est admise."
      >
        <TokenTable
          columns={['rôle', 'famille', 'taille', 'graisse', 'interlignage', 'tracking']}
          rows={Object.entries(typeRole).map(([role, r]) => [
            role,
            r.family,
            token(fontSize as Record<string, string>, r.size),
            r.weight,
            r.lineHeight,
            r.letterSpacing
          ])}
        />
        <div className={styles.typeSpecimen}>
          <p className="t-page-title">Espace Grotesk — titres et identité</p>
          <p className="t-body">
            Inter — interface, textes courants, formulaires, tableaux et navigation.
          </p>
          <p className="t-mono-value">IBM Plex Mono — 1 284 500 FCFA · DEV-2026-0042</p>
        </div>
        <TokenTable
          columns={['famille', 'déclaration']}
          rows={Object.entries(fontFamily).map(([k, v]) => [k, String(v)])}
        />
      </Section>

      <Section id="espacement" title="Espacement et densité">
        <h3 className={styles.subTitle}>Échelle (multiples de 4 px)</h3>
        <div className={styles.spaceScale}>
          {Object.entries(space).map(([k, v]) => (
            <div key={k} className={styles.spaceRow}>
              <span className="t-mono-id">--sp-{k}</span>
              <span className="t-caption">{v}</span>
              <span className={styles.spaceBar} style={{ width: v }} />
            </div>
          ))}
        </div>

        <h3 className={styles.subTitle}>
          Densité active : {densityLabels[densityMode]} — ligne {density[densityMode].row}
        </h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className="t-table-header">Référence</th>
                <th scope="col" className="t-table-header">DEV</th>
                <th scope="col" className="t-table-header">Montant</th>
                <th scope="col" className="t-table-header">Statut</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['DEV-2026-0041', 'Éts. Cocody', '1 284 500 FCFA', 'réglée'],
                ['DEV-2026-0042', 'Éts. Marcory', '486 200 FCFA', 'en attente'],
                ['DEV-2026-0043', 'Éts. Yopougon', '2 041 000 FCFA', 'relance'],
                ['DEV-2026-0044', 'Éts. Plateau', '97 350 FCFA', 'réglée']
              ].map((r) => (
                <tr key={r[0]}>
                  <td className="t-mono-id">{r[0]}</td>
                  <td>{r[1]}</td>
                  <td className="t-mono-value">{r[2]}</td>
                  <td>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`${styles.note} t-caption`}>
          Tableau de démonstration : il sert uniquement à mesurer la hauteur de ligne dans
          les deux densités. Les données sont fictives et ne représentent aucune activité réelle.
        </p>
        <TokenTable
          columns={['alias', 'confortable', 'compact']}
          rows={Object.keys(density.comfortable).map((k) => [
            k,
            token(density.comfortable as Record<string, string>, k),
            token(density.compact as Record<string, string>, k)
          ])}
        />
      </Section>

      <Section id="rayons" title="Rayons et bordures" intro="1 px, rayons 6-22 px. Rien de plus arrondi.">
        <div className={styles.radiusGrid}>
          {Object.entries(radius).map(([k, v]) => (
            <div key={k} className={styles.radiusItem}>
              <span className={styles.radiusBox} style={{ borderRadius: v }} />
              <span className="t-mono-id">--r-{k}</span>
              <span className="t-caption">{v}</span>
            </div>
          ))}
        </div>
        <TokenTable
          columns={['rôle', 'rayon', 'valeur']}
          rows={Object.entries(radiusRole).map(([k, v]) => [
            k,
            v,
            token(radius as Record<string, string>, v)
          ])}
        />
        <TokenTable
          columns={['épaisseur', 'valeur']}
          rows={Object.entries(borderWidth).map(([k, v]) => [k, String(v)])}
        />
      </Section>

      <Section id="ombres" title="Élévation" intro="Ombres très subtiles : l’élévation repose d’abord sur la surface.">
        <div className={styles.shadowGrid}>
          {Object.entries(shadow).map(([k, v]) => (
            <div key={k} className={styles.shadowItem}>
              <span className={styles.shadowBox} style={{ boxShadow: v }} />
              <span className="t-mono-id">--sh-{k.replace(/([A-Z])/g, '-$1').toLowerCase()}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="etats"
        title="Les quinze états obligatoires"
        intro="Corpus l. 7964-7984. Un état n’est jamais simulé : s’il n’est pas branché, il s’affiche « non disponible »."
      >
        <div className={styles.stateGrid}>
          {stateNames.map((name) => {
            const s = (state as Record<string, Record<string, string | boolean>>)[name] as Record<
              string,
              string | boolean
            >;
            return (
              <div key={name} className={styles.stateItem}>
                <span className="t-mono-id">{name}</span>
                <span className="t-caption">{String(s.role)}</span>
                <span className={`${styles.stateChip} t-caption`}>
                  {s.tone ? String(s.tone) : 'neutre'}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="motion" title="Motion" intro="Easing unique cubic-bezier(.2,.8,.2,1). Jamais de rebond.">
        <TokenTable
          columns={['durée', 'valeur']}
          rows={Object.entries(duration).map(([k, v]) => [k, String(v)])}
        />
        <TokenTable
          columns={['rôle', 'durée', 'easing']}
          rows={Object.entries(motionRole).map(([k, v]) => [
            k,
            token(duration as Record<string, string>, v.duration),
            v.easing
          ])}
        />
        <div className={styles.motionDemo}>
          <span className={styles.motionDot} aria-hidden="true" />
          <p className="t-caption">
            easing canonique : {easing.standard} · interdit : {easing.forbidden.join(', ')}
          </p>
        </div>
      </Section>

      <Section id="structure" title="Structure" intro="Shell applicatif et points de rupture du corpus.">
        <TokenTable
          columns={['sidebar', 'valeur']}
          rows={Object.entries(sidebar).map(([k, v]) => [k, String(v)])}
        />
        <TokenTable
          columns={['point de rupture', 'valeur']}
          rows={Object.entries(breakpoint).map(([k, v]) => [k, String(v)])}
        />
        <TokenTable
          columns={['grille', 'valeur']}
          rows={Object.entries(grid).map(([k, v]) => [k, String(v)])}
        />
        <TokenTable
          columns={['cible tactile', 'valeur']}
          rows={Object.entries(target).map(([k, v]) => [k, String(v)])}
        />
      </Section>

      <Section id="zindex" title="Échelle de z-index" intro="Échelle fermée : aucune valeur hors de cette liste.">
        <TokenTable
          columns={['couche', 'z-index']}
          rows={Object.entries(zIndex).map(([k, v]) => [k, String(v)])}
        />
      </Section>
    </main>
  );
}
