import type { RoleId } from './types';

export type PublicationState =
  | 'not-ready'
  | 'ready-for-signature'
  | 'fully-signed'
  | 'seal-required'
  | 'signed-and-sealed'
  | 'ready-to-publish'
  | 'publishing'
  | 'published'
  | 'publication-failed'
  | 'partially-transmitted';

export type DestinationStatus = 'Pending' | 'Ready' | 'Complete' | 'Failed' | 'Not configured';

export interface PublicationOutput {
  id: string;
  name: string;
  label: string;
  format: 'PDF' | 'HTML' | 'AKN XML';
  size: string;
  checksum: string;
  validation: 'Ready' | 'Passed' | 'Failed';
  signatureState: 'Required' | 'Verified';
  sealState: 'Required' | 'Verified';
  generatedAt: string;
}

export interface PublicationDestination {
  id: string;
  name: string;
  type: string;
  status: DestinationStatus;
  checksum: string;
}

export interface PublicationRecord {
  recordId: string;
  state: PublicationState;
  version: string;
  versionLabel: string;
  officialReference: string;
  signerId: string;
  signatureStatus: 'Required' | 'Verified' | 'Failed';
  signatureAppliedAt?: string;
  signatureAuditRef?: string;
  sealCustodianId: string;
  sealStatus: 'Required' | 'Applied' | 'Denied';
  sealAppliedAt?: string;
  sealReference: string;
  outputs: PublicationOutput[];
  destinations: PublicationDestination[];
  publicationTimestamp?: string;
  publicUrl?: string;
  immutableAuditRef?: string;
  preparedBy: RoleId;
  preparedAt: string;
  transmissionNote?: string;
}

export const DEPUTY_CLERK_SIGNATORY_ID = 'deputy-clerk-nyaga';
export const SEAL_CUSTODIAN_ID = 'seal-custodian-okello';

export const publicationSeed: PublicationRecord = {
  recordId: 'NA-BILL-2026-015',
  state: 'ready-for-signature',
  version: '5.0',
  versionLabel: 'Approved Publication Version',
  officialReference: 'Act No. 12 of 2026 (illustrative)',
  signerId: DEPUTY_CLERK_SIGNATORY_ID,
  signatureStatus: 'Required',
  sealCustodianId: SEAL_CUSTODIAN_ID,
  sealStatus: 'Required',
  sealReference: 'SEAL-NA-2026-1847',
  preparedBy: 'dlps-officer',
  preparedAt: '18 Jul 2026, 11:20 AM EAT',
  outputs: [
    {
      id: 'official-pdf',
      name: 'Digital_Public_Services_Bill_2026_Official.pdf',
      label: 'Official PDF',
      format: 'PDF',
      size: '1.4 MB',
      checksum: 'SHA-256: f13a...9c7d',
      validation: 'Ready',
      signatureState: 'Required',
      sealState: 'Required',
      generatedAt: '18 Jul 2026, 10:45 AM EAT',
    },
    {
      id: 'accessible-html',
      name: 'Digital_Public_Services_Bill_2026.html',
      label: 'Accessible HTML',
      format: 'HTML',
      size: '820 KB',
      checksum: 'SHA-256: 9a2b...7e11',
      validation: 'Ready',
      signatureState: 'Required',
      sealState: 'Required',
      generatedAt: '18 Jul 2026, 10:45 AM EAT',
    },
    {
      id: 'akn-xml',
      name: 'akn_ke_bill_2026_15.xml',
      label: 'Akoma Ntoso XML',
      format: 'AKN XML',
      size: '560 KB',
      checksum: 'SHA-256: bb7e...3d90',
      validation: 'Ready',
      signatureState: 'Required',
      sealState: 'Required',
      generatedAt: '18 Jul 2026, 10:45 AM EAT',
    },
  ],
  destinations: [
    { id: 'na-website', name: 'National Assembly website', type: 'Public website', status: 'Pending', checksum: 'SHA-256: f13a...9c7d' },
    { id: 'repository', name: 'Internal repository', type: 'Canonical repository', status: 'Pending', checksum: 'SHA-256: 9a2b...7e11' },
    { id: 'search-index', name: 'Legislative Search', type: 'Search index', status: 'Pending', checksum: 'SHA-256: bb7e...3d90' },
    { id: 'gazette', name: 'Kenya Gazette transfer', type: 'External destination', status: 'Not configured', checksum: 'Pending configuration' },
  ],
};

export const publicationStatusCopy: Record<PublicationState, { label: string; short: string }> = {
  'not-ready': { label: 'Not Ready', short: 'Readiness checks must be completed before signature.' },
  'ready-for-signature': { label: 'Ready for Signature', short: 'The approved publication version is ready for qualified signature.' },
  'fully-signed': { label: 'Fully Signed', short: 'Required qualified signature has been applied.' },
  'seal-required': { label: 'Seal Required', short: 'Apply the institutional seal before publication.' },
  'signed-and-sealed': { label: 'Signed and Sealed', short: 'Signature and seal are complete.' },
  'ready-to-publish': { label: 'Ready to Publish', short: 'All outputs and destinations are ready.' },
  publishing: { label: 'Publishing', short: 'Publication package is being transmitted.' },
  published: { label: 'Published', short: 'Official manifestations are published and indexed.' },
  'publication-failed': { label: 'Publication Failed', short: 'Publication stopped before transmission completed.' },
  'partially-transmitted': { label: 'Partially Transmitted', short: 'Some destinations need retry.' },
};
