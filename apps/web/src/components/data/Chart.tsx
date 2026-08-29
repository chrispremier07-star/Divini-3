/**
 * DIVINI exo — Graphiques SVG maison (LOT 03)
 *
 * Décision §2.3 : rendu maison, aucune bibliothèque. Grille subtile, trait fin,
 * aire translucide faible, légende compacte, reveal progressif, couleurs
 * sémantiques (l. 7902-7909).
 *
 * Le reveal utilise `pathLength=1` + `stroke-dashoffset` animé par une keyframe
 * CSS en tokens (`--dur-progress`, `--ease-standard`) ; avec reduced-motion le
 * tracé est immédiat.
 */

'use client';

import { useId } from 'react';

import styles from './data.module.css';

export type ChartSeries = {
  id: string;
  label: string;
  values: number[];
  /** Variable de token de couleur. Défaut : rotation sémantique. */
  color?: string;
};

export type ChartKind = 'line' | 'area' | 'bar' | 'spark';

const SEMANTIC_ROTATION = [
  'var(--accent)',
  'var(--text-info)',
  'var(--text-success)',
  'var(--text-critical)'
];

const W = 600;
const H = 200;
const PAD = 8;

function extent(series: ChartSeries[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const s of series) {
    for (const v of s.values) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (!Number.isFinite(min)) return [0, 1];
  if (min === max) return [min - 1, max + 1];
  return [Math.min(0, min), max];
}

function toPoints(values: number[], min: number, max: number): Array<[number, number]> {
  const n = Math.max(1, values.length - 1);
  return values.map((v, i) => {
    const x = PAD + (i / n) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
    return [Number(x.toFixed(1)), Number(y.toFixed(1))];
  });
}

function linePath(points: Array<[number, number]>): string {
  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ');
}

function areaPath(points: Array<[number, number]>): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return '';
  return `${linePath(points)} L${last[0]} ${H - PAD} L${first[0]} ${H - PAD} Z`;
}

export type ChartProps = {
  kind?: ChartKind;
  labels: string[];
  series: ChartSeries[];
  formatValue?: (value: number) => string;
};

export function ChartLegend({ series }: { series: ChartSeries[] }) {
  return (
    <div className={styles.chartLegend}>
      {series.map((s, i) => (
        <span key={s.id} className={styles.chartLegendItem}>
          <span
            className={styles.chartLegendSwatch}
            style={{ backgroundColor: s.color ?? SEMANTIC_ROTATION[i % SEMANTIC_ROTATION.length] }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function Chart({ kind = 'line', labels, series, formatValue }: ChartProps) {
  const uid = useId();
  const [min, max] = extent(series);
  const gridLines = [0.25, 0.5, 0.75].map((p) => PAD + p * (H - PAD * 2));

  return (
    <div className={styles.chartWrap}>
      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Graphique ${kind}, ${series.length} série(s), ${labels.length} points`}
      >
        {/* grille subtile */}
        {gridLines.map((y) => (
          <line
            key={y}
            x1={PAD}
            x2={W - PAD}
            y1={y}
            y2={y}
            stroke="var(--border-soft)"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}

        {kind === 'bar' ? (
          <g>
            {series.map((s, si) => {
              const color = s.color ?? SEMANTIC_ROTATION[si % SEMANTIC_ROTATION.length];
              const groupW = (W - PAD * 2) / Math.max(1, s.values.length);
              const barW = Math.max(2, (groupW / series.length) * 0.7);
              return s.values.map((v, i) => {
                const h = ((v - min) / (max - min)) * (H - PAD * 2);
                const x = PAD + i * groupW + si * barW;
                return (
                  <rect
                    key={`${s.id}-${i}`}
                    x={x}
                    y={H - PAD - h}
                    width={barW}
                    height={Math.max(1, h)}
                    fill={color}
                    opacity={0.85}
                    rx={1}
                  />
                );
              });
            })}
          </g>
        ) : (
          series.map((s, si) => {
            const color = s.color ?? SEMANTIC_ROTATION[si % SEMANTIC_ROTATION.length];
            const points = toPoints(s.values, min, max);
            const gradId = `${uid}-g${si}`;
            return (
              <g key={s.id}>
                {(kind === 'area' || kind === 'spark') && (
                  <>
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <path d={areaPath(points)} fill={`url(#${gradId})`} className={styles.chartArea} style={{ animationDelay: `${si * 40}ms` }} />
                  </>
                )}
                <path
                  d={linePath(points)}
                  fill="none"
                  stroke={color}
                  strokeWidth={kind === 'spark' ? 1.5 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  className={styles.chartLine}
                  style={{ animationDelay: `${si * 40}ms` }}
                />
              </g>
            );
          })
        )}
      </svg>

      {kind !== 'spark' ? <ChartLegend series={series} /> : null}

      {/* valeurs en mono sous le graphe — version mobile (§7) */}
      <div className={styles.chartValues}>
        {series.map((s) => {
          const last = s.values[s.values.length - 1];
          return (
            <span key={s.id} className={styles.chartValueItem}>
              {s.label} : {formatValue ? formatValue(last ?? 0) : last}
            </span>
          );
        })}
      </div>
    </div>
  );
}
