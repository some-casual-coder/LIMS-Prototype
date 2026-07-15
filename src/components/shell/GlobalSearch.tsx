import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Bookmark, MessageSquareText, History } from 'lucide-react';
import { useDemoStore } from '@/store/demoStore';
import styles from './GlobalSearch.module.css';

interface Suggestion {
  icon: React.ReactNode;
  label: string;
  meta: string;
  to: string;
}

const ic = { width: 15, height: 15, strokeWidth: 1.9 } as const;

export function GlobalSearch() {
  const navigate = useNavigate();
  const records = useDemoStore((s) => s.records);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo<Suggestion[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const out: Suggestion[] = [];
    for (const r of records) {
      if (
        r.title.toLowerCase().includes(query) ||
        r.reference.toLowerCase().includes(query) ||
        r.shortTitle.toLowerCase().includes(query)
      ) {
        out.push({ icon: <FileText {...ic} />, label: r.title, meta: `${r.reference} · ${r.workflowType}`, to: `/legislative/${r.id}` });
      }
      if (out.length >= 4) break;
    }
    // Deterministic clause / submission / version entries for the primary Bill.
    if (query && ('digital public services'.includes(query) || query.includes('digital') || query.includes('vulnerable') || query.includes('clause'))) {
      out.push({ icon: <Bookmark {...ic} />, label: 'Clause 14 — Protection of vulnerable users', meta: 'Digital Public Services Bill, 2026', to: '/legislative/NA-BILL-2026-015?highlight=clause-14' });
      out.push({ icon: <History {...ic} />, label: 'Version 4.0 — Legal Review Draft', meta: 'NA/BILL/2026/015', to: '/legislative/NA-BILL-2026-015/versions' });
    }
    if (query.includes('pps') || query.includes('submission') || query.includes('digital')) {
      out.push({ icon: <MessageSquareText {...ic} />, label: 'Public submission PPS-2026-00841', meta: 'Awaiting classification', to: '/participation' });
    }
    return out.slice(0, 6);
  }, [q, records]);

  function go(to: string) {
    setOpen(false);
    setQ('');
    inputRef.current?.blur();
    navigate(to);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Enter' && q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === 'Enter') { e.preventDefault(); go(suggestions[active].to); }
    else if (e.key === 'Escape') { setOpen(false); }
  }

  return (
    <div className={styles.wrap} role="search">
      <div className={styles.field}>
        <Search className={styles.searchIcon} width={17} height={17} aria-hidden />
        <input
          ref={inputRef}
          type="text"
          name="global-search"
          className={styles.input}
          placeholder="Search Bills, clauses, petitions, references or legislative records"
          aria-label="Search legislative records"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => q && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          aria-expanded={open && suggestions.length > 0}
          aria-controls="global-search-suggestions"
          role="combobox"
          aria-autocomplete="list"
        />
        <kbd className={styles.kbd}>⌘K</kbd>
      </div>
      {open && suggestions.length > 0 && (
        <ul className={styles.results} id="global-search-suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <li key={s.label} role="option" aria-selected={i === active}>
              <button
                className={`${styles.result} ${i === active ? styles.resultActive : ''}`}
                onMouseDown={(e) => { e.preventDefault(); go(s.to); }}
                onMouseEnter={() => setActive(i)}
              >
                <span className={styles.resultIcon} aria-hidden>{s.icon}</span>
                <span className={styles.resultText}>
                  <span className={styles.resultLabel}>{s.label}</span>
                  <span className={styles.resultMeta}>{s.meta}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
