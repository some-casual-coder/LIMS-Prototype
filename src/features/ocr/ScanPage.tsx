import type { OcrLine } from '@/data/types';
import styles from './ScanPage.module.css';

interface Props {
  lines: OcrLine[];
  pageNumber: number;
  enhanced?: boolean;
  showRegions?: boolean;
  activeLineId?: string | null;
  // Vertical position (0–100) of the scanning band; null hides it.
  band?: number | null;
  scanning?: boolean;
  onSelectRegion?: (lineId: string) => void;
  // Only reveal lines up to this index (progressive extraction). Undefined = all.
  revealUpTo?: number;
  className?: string;
}

const KIND_CLASS: Record<OcrLine['kind'], string> = {
  title: styles.title,
  heading: styles.heading,
  subheading: styles.subheading,
  body: styles.body,
  'page-number': styles.pageNum,
  margin: styles.margin,
};

// A rendered "aged paper" scan of a historical page. The warm surface applies
// ONLY to this source-evidence document — the surrounding UI stays neutral.
export function ScanPage({
  lines, pageNumber, enhanced = true, showRegions = true, activeLineId, band = null,
  scanning = false, onSelectRegion, revealUpTo, className = '',
}: Props) {
  const regionLines = lines.filter((l) => l.region);
  return (
    <div className={`${styles.page} ${enhanced ? styles.enhanced : styles.original} ${className}`}>
      <div className={styles.paper}>
        {lines.map((l, i) => {
          const hidden = revealUpTo != null && i > revealUpTo;
          return (
            <p key={l.id} className={`${KIND_CLASS[l.kind]} ${hidden ? styles.lineHidden : ''}`}>
              {l.text}
            </p>
          );
        })}

        {/* Region outlines (corner-handle boxes) */}
        {showRegions && regionLines.map((l) => {
          const active = l.id === activeLineId;
          const revealed = revealUpTo == null || lines.findIndex((x) => x.id === l.id) <= revealUpTo;
          if (!revealed) return null;
          return (
            <button
              key={`r-${l.id}`}
              type="button"
              className={`${styles.region} ${l.low ? styles.regionLow : ''} ${active ? styles.regionActive : ''}`}
              style={{ top: `${l.region!.top}%`, left: `${l.region!.left}%`, width: `${l.region!.width}%`, height: `${l.region!.height}%` }}
              onClick={() => onSelectRegion?.(l.id)}
              aria-label={`Scan region: ${l.text.slice(0, 40)}${l.text.length > 40 ? '…' : ''}${l.low ? ' (low confidence)' : ''}`}
            >
              <span className={`${styles.handle} ${styles.hTL}`} aria-hidden />
              <span className={`${styles.handle} ${styles.hTR}`} aria-hidden />
              <span className={`${styles.handle} ${styles.hBL}`} aria-hidden />
              <span className={`${styles.handle} ${styles.hBR}`} aria-hidden />
            </button>
          );
        })}

        {/* Scanning band */}
        {band != null && (
          <div className={styles.band} style={{ top: `${band}%` }} aria-hidden>
            <span className={styles.bandLineTop} />
            {scanning && <span className={styles.bandLabel}>Scanning…</span>}
            <span className={styles.bandLineBottom} />
            <span className={`${styles.bandHandle} ${styles.bhTL}`} />
            <span className={`${styles.bandHandle} ${styles.bhTR}`} />
            <span className={`${styles.bandHandle} ${styles.bhBL}`} />
            <span className={`${styles.bandHandle} ${styles.bhBR}`} />
          </div>
        )}
      </div>
      <span className={styles.pageFoot}>Page {pageNumber}</span>
    </div>
  );
}

// A compact skeleton thumbnail of a scanned page for navigators/stacks.
export function ScanThumb({ pageNumber, enhanced = false }: { pageNumber: number; enhanced?: boolean }) {
  // Deterministic bar layout so each page thumbnail is stable but slightly varied.
  const bars = [92, 78, 84, 60, 88, 72, 80, 54];
  return (
    <div className={`${styles.thumb} ${enhanced ? styles.enhanced : ''}`} aria-hidden>
      <span className={styles.thumbTitle} />
      {bars.map((w, i) => (
        <span key={i} className={styles.thumbBar} style={{ width: `${(w + ((pageNumber * 7 + i * 5) % 12)) % 96}%` }} />
      ))}
    </div>
  );
}
