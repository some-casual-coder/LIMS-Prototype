import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListFilter, MoreHorizontal, Reply, Check, ExternalLink, Sparkles, PencilLine, Info,
  TriangleAlert, CircleCheck, ArrowRight, ArrowLeft, Landmark, Copy, X, CircleAlert,
} from 'lucide-react';
import { Button, StatusBadge, Avatar } from '@/components/ui';
import {
  editorComments, resolvedCommentCount, editorValidation, clause14AiSuggestion,
} from '@/data/draftContent';
import { primaryBillContent } from '@/data/billContent';
import styles from './ContextPanel.module.css';

export type PanelTab = 'Comments' | 'AI Assistant' | 'Validation' | 'Metadata' | 'References';

interface Props {
  tab: PanelTab;
  onTab: (t: PanelTab) => void;
  aiInserted: boolean;
  aiDismissed: boolean;
  onInsertAi: (edited: boolean) => void;
  onDismissAi: () => void;
  resolvedComments: Set<string>;
  onResolveComment: (id: string) => void;
  onOpenClause: () => void;
  onToast: (msg: string) => void;
  onGoWarning: () => void;
}

const TABS: PanelTab[] = ['Comments', 'AI Assistant', 'Validation', 'Metadata', 'References'];

export function ContextPanel(p: Props) {
  const { tab, onTab } = p;
  return (
    <aside className={styles.panel}>
      <nav className={styles.tabs} aria-label="Context panel">
        {TABS.map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => onTab(t)}>
            {t}{t === 'Validation' && <span className={styles.tabBadge}>{editorValidation.warnings}</span>}
          </button>
        ))}
      </nav>

      <div className={styles.body}>
        {tab === 'Comments' && <CommentsTab resolved={p.resolvedComments} onResolve={p.onResolveComment} onOpenClause={p.onOpenClause} onToast={p.onToast} />}
        {tab === 'AI Assistant' && <AiTab aiInserted={p.aiInserted} aiDismissed={p.aiDismissed} onInsertAi={p.onInsertAi} onDismissAi={p.onDismissAi} onGoWarning={p.onGoWarning} onToast={p.onToast} />}
        {tab === 'Validation' && <ValidationTab onGoWarning={p.onGoWarning} onToast={p.onToast} />}
        {tab === 'Metadata' && <MetadataTab />}
        {tab === 'References' && <ReferencesTab />}
      </div>
    </aside>
  );
}

function CommentsTab({ resolved, onResolve, onOpenClause, onToast }: { resolved: Set<string>; onResolve: (id: string) => void; onOpenClause: () => void; onToast: (m: string) => void }) {
  const open = editorComments.filter((c) => !resolved.has(c.id));
  const hasBlockingOpen = open.some((c) => c.type === 'blocking');
  return (
    <div>
      <div className={styles.secHead}>
        <div><h3>Comments</h3><p className={styles.secSub}>{open.length} open · {resolvedCommentCount + resolved.size} resolved</p></div>
        <div className={styles.secTools}>
          <button className={styles.toolBtn} aria-label="Filter comments" onClick={() => onToast('Filter: showing open comments.')}><ListFilter width={15} height={15} /></button>
          <button className={styles.toolBtn} aria-label="Comment options" onClick={() => onToast('Comment options.')}><MoreHorizontal width={16} height={16} /></button>
        </div>
      </div>

      {open.length === 0 && <p className={styles.emptyState}>No open comments in this version.</p>}
      {open.map((c) => (
        <div key={c.id} className={`${styles.comment} ${c.type === 'blocking' ? styles.commentBlocking : styles.commentDrafting}`}>
          <div className={styles.commentTop}>
            <StatusBadge tone={c.type === 'blocking' ? 'red' : 'gold'} size="sm" icon={c.type === 'blocking' ? <CircleAlert width={12} height={12} /> : <PencilLine width={12} height={12} />}>
              {c.type === 'blocking' ? 'Blocking' : 'Drafting'}
            </StatusBadge>
            <span className={styles.commentClause}>{c.clause}</span>
            <span className={styles.commentAgo}>{c.ago}</span>
          </div>
          <div className={styles.commentAuthor}>
            <Avatar initials={c.by.split(' ').map((s) => s[0]).join('')} name={c.by} size={28} tone="neutral" />
            <span><span className={styles.authorName}>{c.by}</span><span className={styles.authorRole}>{c.role}</span></span>
          </div>
          <p className={styles.commentText}>{c.text}</p>
          <div className={styles.commentActions}>
            <button onClick={() => onToast(`Replying to ${c.by}…`)}><Reply width={13} height={13} /> Reply</button>
            <button onClick={() => onResolve(c.id)}><Check width={13} height={13} /> Resolve</button>
            <button onClick={onOpenClause}><ExternalLink width={13} height={13} /> Open clause</button>
          </div>
        </div>
      ))}

      <div className={styles.checklistCard}>
        <p className={styles.checklistTitle}>Required before submission</p>
        <ul className={styles.checklist}>
          <li>{hasBlockingOpen ? <span className={styles.ckRed}><CircleAlert width={15} height={15} /></span> : <span className={styles.ckGreen}><CircleCheck width={15} height={15} /></span>} Resolve blocking comments <span className={styles.ckNote}>{hasBlockingOpen ? '1 open' : 'Done'}</span></li>
          <li><span className={styles.ckAmber}><TriangleAlert width={15} height={15} /></span> Pass validation <span className={styles.ckNote}>1 warning</span></li>
          <li><span className={styles.ckGrey}><Info width={15} height={15} /></span> Add revision note <span className={styles.ckNote}>Not added</span></li>
        </ul>
        <button className={styles.link} onClick={() => onToast('Opening the full submission checklist.')}>View all checklist items <ArrowRight width={13} height={13} /></button>
      </div>
    </div>
  );
}

function AiTab({ aiInserted, aiDismissed, onInsertAi, onDismissAi, onGoWarning, onToast }: { aiInserted: boolean; aiDismissed: boolean; onInsertAi: (e: boolean) => void; onDismissAi: () => void; onGoWarning: () => void; onToast: (m: string) => void }) {
  const s = clause14AiSuggestion;
  return (
    <div>
      <div className={styles.aiHead}><span className={styles.aiIcon}><Sparkles width={16} height={16} /></span> <h3>Suggested wording</h3></div>

      {aiInserted ? (
        <div className={styles.aiConfirmed}>
          <CircleCheck width={16} height={16} /> AI suggestion inserted after confirmation by Grace Wanjiku. The change is recorded in the activity log.
        </div>
      ) : aiDismissed ? (
        <div className={styles.aiEmpty}>
          <p className={styles.aiEmptyTitle}>Select a clause or passage to request legislative assistance.</p>
          <ul className={styles.aiActionsList}>
            {['Suggest clearer wording', 'Check consistency', 'Identify ambiguity', 'Summarise selected clause', 'Draft explanatory note'].map((a) => (
              <li key={a}><button onClick={() => onToast(`AI: ${a} for Clause 14…`)}>{a}</button></li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={styles.aiCard}>
          <p className={styles.aiLabel}>Original wording</p>
          <p className={styles.aiOriginal}>{s.original}</p>
          <p className={styles.aiLabel}>Suggested wording</p>
          <p className={styles.aiSuggested}>{s.suggested}</p>
          <p className={styles.aiLabel}>Explanation <Info width={12} height={12} /></p>
          <p className={styles.aiExplanation}>{s.explanation}</p>
          <div className={styles.aiActions}>
            <Button variant="primary" size="sm" leftIcon={<PencilLine width={14} height={14} />} onClick={() => onInsertAi(true)}>Edit Before Inserting</Button>
            <Button variant="secondary" size="sm" onClick={() => onInsertAi(false)}>Insert</Button>
          </div>
          <div className={styles.aiFoot}>
            <button onClick={() => onToast('Suggestion copied to clipboard.')}><Copy width={13} height={13} /> Copy suggestion</button>
            <button onClick={onDismissAi}><X width={13} height={13} /> Dismiss</button>
          </div>
        </div>
      )}

      <div className={styles.warnCard}>
        <div className={styles.warnHead}><TriangleAlert width={15} height={15} /> <span>Validation warning</span> <span className={styles.warnCount}>1 warning</span></div>
        <p>{editorValidation.warning}</p>
        <button className={styles.link} onClick={onGoWarning}>Go to warning <ArrowRight width={13} height={13} /></button>
      </div>

      <div className={styles.relCard}>
        <div className={styles.relHead}><Landmark width={15} height={15} /> <span>Related legislation</span> <span className={styles.relCount}>{s.related.length} references</span></div>
        {s.related.map((r) => <p key={r} className={styles.relItem}><Landmark width={14} height={14} /> {r}</p>)}
        <button className={styles.link} onClick={() => onToast('Opening related legislation references.')}>View all references <ArrowRight width={13} height={13} /></button>
      </div>
    </div>
  );
}

function ValidationTab({ onGoWarning, onToast }: { onGoWarning: () => void; onToast: (m: string) => void }) {
  const v = editorValidation;
  return (
    <div>
      <div className={styles.secHead}><h3>Validation</h3></div>
      <div className={styles.valSummary}>
        <div className={styles.valStat}><span className={styles.valPass}>{v.passed}</span> checks passed</div>
        <div className={styles.valStat}><span className={styles.valWarn}>{v.warnings}</span> warning</div>
        <div className={styles.valStat}><span className={styles.valErr}>{v.errors}</span> errors</div>
      </div>
      <div className={styles.warnCard}>
        <div className={styles.warnHead}><TriangleAlert width={15} height={15} /> <span>Warning</span></div>
        <p>{v.warning}</p>
        <div className={styles.valActions}>
          <Button variant="secondary" size="sm" onClick={onGoWarning}>Go to Clause</Button>
          <Button variant="tertiary" size="sm" onClick={() => onToast('Warning marked as reviewed.')}>Mark reviewed</Button>
        </div>
      </div>
      {v.categories.map((cat) => (
        <div key={cat.name} className={styles.valCat}>
          <p className={styles.valCatName}>{cat.name}</p>
          <ul>{cat.items.map((it) => <li key={it} className={it.includes('requires review') ? styles.valItemWarn : styles.valItemOk}>{it.includes('requires review') ? <TriangleAlert width={14} height={14} /> : <CircleCheck width={14} height={14} />} {it}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

function MetadataTab() {
  const fields = [
    ['Title', 'Digital Public Services Bill, 2026'], ['Short title', 'Digital Public Services Bill'],
    ['Official reference', 'NA/BILL/2026/015'], ['Work type', 'Bill'], ['Jurisdiction', 'Republic of Kenya'],
    ['Language', 'English'], ['Sponsor', 'Parliamentary Legislative Proposal Unit'], ['Responsible directorate', 'Directorate of Legal Services'],
    ['Current stage', 'Revision Requested'], ['Classification', 'Internal'], ['Version label', 'Legal Review Draft'],
    ['Target publication', '24 July 2026'],
  ];
  return (
    <div>
      <div className={styles.secHead}><h3>Metadata</h3></div>
      <dl className={styles.metaList}>
        {fields.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <details className={styles.advanced}>
        <summary>Advanced (Akoma Ntoso)</summary>
        <dl className={styles.metaList}>
          <div><dt>FRBR Work URI</dt><dd>/akn/ke/bill/2026/015</dd></div>
          <div><dt>Expression URI</dt><dd>/akn/ke/bill/2026/015/eng@2026-07-15</dd></div>
          <div><dt>Manifestations</dt><dd>PDF · HTML · XML</dd></div>
        </dl>
      </details>
    </div>
  );
}

function ReferencesTab() {
  const refs = [
    { title: 'Public Service Delivery Act, 2019', relation: 'Referenced Act', reference: 'Act No. 23 of 2019', to: '/legislative/NA-BILL-2019-023', summary: 'Existing public-service delivery framework referenced by Clause 14.' },
    { title: 'Data Protection Act, 2019', relation: 'Referenced Act', reference: 'No. 24 of 2019', to: '/search?q=Data%20Protection%20Act', summary: 'Legal basis for processing personal data in the service-delivery provisions.' },
    { title: 'Motion on Digital Accessibility in Public Institutions', relation: 'Related motion', reference: 'NA/MOT/2026/046', to: '/legislative/NA-MOT-2026-046', summary: 'Related parliamentary business on accessibility standards and assisted access.' },
    { title: 'Petition on Assisted Access to Digital Government Services', relation: 'Public submission', reference: 'NA/PET/2026/084', to: '/legislative/NA-PET-2026-084', summary: 'Public submission linked to the policy intent and evidence for Clause 14.' },
  ];
  const [selected, setSelected] = useState<(typeof refs)[number] | null>(null);
  const definedTerms = primaryBillContent.clauses[1].paragraphs.length - 1;
  if (selected) {
    return (
      <div>
        <button className={styles.referenceBack} onClick={() => setSelected(null)}><ArrowLeft width={15} height={15} /> References</button>
        <div className={styles.referencePreview}>
          <span className={styles.referencePreviewIcon}><Landmark width={20} height={20} /></span>
          <p className={styles.referenceType}>{selected.relation}</p>
          <h3>{selected.title}</h3>
          <p className={styles.referenceNumber}>{selected.reference}</p>
          <p className={styles.referenceSummary}>{selected.summary}</p>
          <dl>
            <div><dt>Linked from</dt><dd>Clause 14</dd></div>
            <div><dt>Relationship</dt><dd>{selected.relation}</dd></div>
          </dl>
          <Link to={selected.to} className={styles.referenceOpen}>Open related record</Link>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className={styles.secHead}><h3>References</h3></div>
      <p className={styles.refsNote}>{definedTerms} defined terms · 4 external references linked.</p>
      <ul className={styles.refsList}>
        {refs.map((reference) => (
          <li key={reference.title}><button className={styles.refBtn} onClick={() => setSelected(reference)}><span className={styles.refIcon}><Landmark width={15} height={15} /></span><span><span className={styles.refTitle}>{reference.title}</span><span className={styles.refRel}>{reference.relation}</span></span></button></li>
        ))}
      </ul>
    </div>
  );
}
