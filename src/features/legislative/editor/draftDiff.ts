import type { StructuredDraftSection, StructuredDraftBlock } from '@/data/types';

// Structural diff of a structured Bill draft. Blocks carry stable ids that are
// preserved when a revision is snapshotted, so we match by id: a block present
// only in the new draft is an addition, only in the baseline is a deletion, and
// one whose text/number/type changed is a modification. This powers both the
// version Compare view and the in-editor Track Changes markers.

export type BlockChangeKind = 'added' | 'removed' | 'modified';

export interface BlockDiff {
  kind: BlockChangeKind;
  blockId: string;
  sectionTag: string;
  sectionTitle: string;
  label: string;
  blockType: string;
  oldText: string;
  newText: string;
}

export interface DraftDiff {
  additions: number;
  deletions: number;
  modifications: number;
  changes: BlockDiff[];
  /** blockId → kind, for the blocks that still exist in the current draft. */
  byBlock: Record<string, 'added' | 'modified'>;
}

function blockDisplayLabel(block: StructuredDraftBlock): string {
  if (block.number && (block.type === 'clause' || block.type === 'subclause')) {
    return `${block.label} ${block.number}`;
  }
  return block.label;
}

function index(sections: StructuredDraftSection[]) {
  const map = new Map<string, { block: StructuredDraftBlock; section: StructuredDraftSection; order: number }>();
  let order = 0;
  sections.forEach((section) => {
    section.blocks.forEach((block) => {
      map.set(block.id, { block, section, order: order++ });
    });
  });
  return map;
}

export function diffSections(
  baseline: StructuredDraftSection[],
  current: StructuredDraftSection[],
): DraftDiff {
  const oldMap = index(baseline);
  const newMap = index(current);
  const changes: BlockDiff[] = [];
  const byBlock: Record<string, 'added' | 'modified'> = {};

  // Additions + modifications, in current-document order.
  newMap.forEach(({ block, section }, id) => {
    const prior = oldMap.get(id);
    if (!prior) {
      byBlock[id] = 'added';
      changes.push({
        kind: 'added', blockId: id, sectionTag: section.tag, sectionTitle: section.title,
        label: blockDisplayLabel(block), blockType: block.type, oldText: '', newText: block.text,
      });
    } else if (
      prior.block.text !== block.text
      || prior.block.number !== block.number
      || prior.block.type !== block.type
    ) {
      byBlock[id] = 'modified';
      changes.push({
        kind: 'modified', blockId: id, sectionTag: section.tag, sectionTitle: section.title,
        label: blockDisplayLabel(block), blockType: block.type, oldText: prior.block.text, newText: block.text,
      });
    }
  });

  // Deletions, in baseline order.
  const removed: BlockDiff[] = [];
  oldMap.forEach(({ block, section }, id) => {
    if (!newMap.has(id)) {
      removed.push({
        kind: 'removed', blockId: id, sectionTag: section.tag, sectionTitle: section.title,
        label: blockDisplayLabel(block), blockType: block.type, oldText: block.text, newText: '',
      });
    }
  });

  return {
    additions: changes.filter((c) => c.kind === 'added').length,
    deletions: removed.length,
    modifications: changes.filter((c) => c.kind === 'modified').length,
    changes: [...changes, ...removed],
    byBlock,
  };
}

export type WordToken = { text: string; status: 'same' | 'add' | 'del' };

// Word-level redline via longest-common-subsequence over whitespace-preserving
// tokens — used to show old → new wording inside a modified provision.
export function wordDiff(oldText: string, newText: string): WordToken[] {
  const a = oldText.split(/(\s+)/).filter((t) => t !== '');
  const b = newText.split(/(\s+)/).filter((t) => t !== '');
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: WordToken[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { out.push({ text: a[i], status: 'same' }); i += 1; j += 1; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ text: a[i], status: 'del' }); i += 1; }
    else { out.push({ text: b[j], status: 'add' }); j += 1; }
  }
  while (i < m) { out.push({ text: a[i], status: 'del' }); i += 1; }
  while (j < n) { out.push({ text: b[j], status: 'add' }); j += 1; }
  return out;
}
