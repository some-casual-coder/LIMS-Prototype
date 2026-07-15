import { useState } from 'react';
import { Search, ListTree, FileText, ChevronDown, ChevronRight, CircleAlert, TriangleAlert } from 'lucide-react';
import { documentParts, clauseTitle } from '@/data/draftContent';
import { LONG_TITLE, PREAMBLE, SCHEDULES } from './DocumentSurface';
import styles from './StructureNav.module.css';

export function StructureNav({ active, onSelect }: { active: number; onSelect: (n: number) => void }) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const q = query.trim().toLowerCase();
  const allCollapsed = documentParts.every((p) => collapsed[p.id]);

  const matches = (n: number) => !q || `clause ${n} ${clauseTitle(n)}`.toLowerCase().includes(q);
  const toggleAll = () => setCollapsed(allCollapsed ? {} : Object.fromEntries(documentParts.map((p) => [p.id, true])));
  const leafClass = (target: number) => `${styles.leaf} ${active === target ? styles.clauseActive : ''}`;

  return (
    <div className={styles.nav}>
      <div className={styles.header}>
        <span className={styles.title}>Document Structure</span>
        <button className={styles.iconBtn} aria-label={allCollapsed ? 'Expand all' : 'Collapse all'} title={allCollapsed ? 'Expand all' : 'Collapse all'} onClick={toggleAll}><ListTree width={16} height={16} /></button>
      </div>
      <label className={styles.search}>
        <Search width={14} height={14} aria-hidden />
        <input name="clause-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clauses, parts, schedules…" aria-label="Search clauses" />
      </label>

      <div className={styles.tree}>
        <button className={leafClass(LONG_TITLE)} onClick={() => onSelect(LONG_TITLE)}><FileText width={14} height={14} className={styles.leafIcon} /> Long Title</button>
        <button className={leafClass(PREAMBLE)} onClick={() => onSelect(PREAMBLE)}><FileText width={14} height={14} className={styles.leafIcon} /> Preamble</button>

        {documentParts.map((part) => {
          const isCollapsed = collapsed[part.id];
          const clauses = part.clauses.filter(matches);
          if (q && clauses.length === 0) return null;
          return (
            <div key={part.id} className={styles.part}>
              <button className={styles.partHead} onClick={() => setCollapsed((c) => ({ ...c, [part.id]: !c[part.id] }))} aria-expanded={!isCollapsed}>
                {isCollapsed ? <ChevronRight width={14} height={14} /> : <ChevronDown width={14} height={14} />}
                <span>{part.title}</span>
              </button>
              {!isCollapsed && clauses.map((n) => {
                const isC14 = n === 14;
                return (
                  <button
                    key={n}
                    className={`${styles.clause} ${active === n ? styles.clauseActive : ''}`}
                    onClick={() => onSelect(n)}
                    aria-current={active === n ? 'true' : undefined}
                  >
                    <FileText width={14} height={14} className={styles.leafIcon} />
                    <span className={styles.clauseLabel}>Clause {n} — {clauseTitle(n)}</span>
                    {isC14 && (
                      <span className={styles.badges}>
                        <span className={styles.badgeBlocking} title="1 blocking comment"><CircleAlert width={13} height={13} /> 1</span>
                        <span className={styles.badgeWarn} title="1 validation warning"><TriangleAlert width={13} height={13} /></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        <button className={leafClass(SCHEDULES)} onClick={() => onSelect(SCHEDULES)}><ChevronRight width={14} height={14} className={styles.leafIcon} /> Schedules</button>
      </div>
    </div>
  );
}
