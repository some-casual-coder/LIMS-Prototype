import type { Persona, Officer } from './types';

// Synthetic personas used at entry. Selecting one drives navigation, permitted
// actions, notifications and assigned tasks. No passwords (a mock OTP appears
// only during the signature flow).
export const personas: Persona[] = [
  {
    id: 'dls-drafter',
    name: 'Grace Wanjiku',
    roleTitle: 'Senior Legal Counsel',
    directorate: 'Directorate of Legal Services',
    initials: 'GW',
    internal: true,
    summary: 'Registers instructions, drafts and structures clauses, runs validation and submits drafts for review.',
  },
  {
    id: 'dls-reviewer',
    name: 'David Otieno',
    roleTitle: 'Director, Legal Services',
    directorate: 'Directorate of Legal Services',
    initials: 'DO',
    internal: true,
    summary: 'Reviews submitted drafts, resolves redlines and comments, returns for revision and approves the legal stage.',
  },
  {
    id: 'dlps-officer',
    name: 'Ruth Naliaka',
    roleTitle: 'Principal Procedural Officer',
    directorate: 'Directorate of Legislative and Procedural Services',
    initials: 'RN',
    internal: true,
    summary: 'Conducts procedural review, confirms readiness and publication information and routes for signature.',
  },
  {
    id: 'clerk',
    name: 'Office of the Clerk',
    roleTitle: 'Clerk of the National Assembly',
    directorate: 'Office of the Clerk',
    initials: 'OC',
    internal: true,
    summary: 'Oversees legislative workload, authorises signature and publication, and inspects compliance and audit.',
  },
  {
    id: 'participation-officer',
    name: 'Miriam Achieng',
    roleTitle: 'Public Participation Officer',
    directorate: 'Directorate of Legislative and Procedural Services',
    initials: 'MA',
    internal: true,
    summary: 'Receives, validates, classifies and routes public submissions and maintains citizen-visible status.',
  },
  {
    id: 'records-officer',
    name: 'Lydia Mutua',
    roleTitle: 'Senior Records Officer',
    directorate: 'Parliamentary Records Service',
    initials: 'LM',
    internal: true,
    summary: 'Imports and digitises historical records, verifies OCR text, confirms metadata and archives verified records for search.',
  },
  {
    id: 'ict-admin',
    name: 'Samuel Kiprop',
    roleTitle: 'ICT Administrator',
    directorate: 'Office of the Clerk',
    initials: 'SK',
    internal: true,
    summary: 'Manages users and roles, configures workflows and document types and monitors system status.',
  },
];

// Public persona used for the citizen portal journey.
export const citizenPersona: Persona = {
  id: 'citizen',
  name: 'James Mwangi',
  roleTitle: 'Member of the public',
  directorate: 'Public',
  initials: 'JM',
  internal: false,
  summary: 'Finds Bills open for participation, reads accessible summaries, submits views and tracks submissions.',
};

// Officer directory used for assignments and audit rendering.
export const officers: Officer[] = [
  { id: 'dls-drafter', name: 'Grace Wanjiku', roleTitle: 'Senior Legal Counsel', directorate: 'Directorate of Legal Services', initials: 'GW' },
  { id: 'dls-reviewer', name: 'David Otieno', roleTitle: 'Director, Legal Services', directorate: 'Directorate of Legal Services', initials: 'DO' },
  { id: 'dlps-officer', name: 'Ruth Naliaka', roleTitle: 'Principal Procedural Officer', directorate: 'Directorate of Legislative and Procedural Services', initials: 'RN' },
  { id: 'clerk', name: 'Office of the Clerk', roleTitle: 'Clerk of the National Assembly', directorate: 'Office of the Clerk', initials: 'OC' },
  { id: 'participation-officer', name: 'Miriam Achieng', roleTitle: 'Public Participation Officer', directorate: 'Directorate of Legislative and Procedural Services', initials: 'MA' },
  { id: 'records-officer', name: 'Lydia Mutua', roleTitle: 'Senior Records Officer', directorate: 'Parliamentary Records Service', initials: 'LM' },
  { id: 'ict-admin', name: 'Samuel Kiprop', roleTitle: 'ICT Administrator', directorate: 'Office of the Clerk', initials: 'SK' },
  { id: 'counsel-mumo', name: 'Alice Mumo', roleTitle: 'Legal Counsel', directorate: 'Directorate of Legal Services', initials: 'AM' },
  { id: 'counsel-barasa', name: 'Peter Barasa', roleTitle: 'Senior Legal Counsel', directorate: 'Directorate of Legal Services', initials: 'PB' },
  { id: 'quality-reviewer', name: 'Samuel Kariuki', roleTitle: 'Principal Records Reviewer', directorate: 'Parliamentary Records Service', initials: 'SK' },
  { id: 'pbo-liaison', name: 'Sarah Njeri', roleTitle: 'Budget Policy Analyst', directorate: 'Office of the Clerk', initials: 'SN' },
  { id: 'archivist-edwin', name: 'Edwin Kamau', roleTitle: 'Archivist', directorate: 'Parliamentary Records Service', initials: 'EK' },
  { id: 'records-wanjiru', name: 'Ruth Wanjiku', roleTitle: 'Records Officer', directorate: 'Parliamentary Records Service', initials: 'RW' },
  { id: 'citizen', name: 'James Mwangi', roleTitle: 'Member of the public', directorate: 'Public', initials: 'JM' },

  // Workflow administrators — responsible for configuring each legislative
  // workflow template (Workflow Catalogue). All synthetic, distinct people.
  { id: 'wf-admin-njeri', name: 'Grace Njeri', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legal Services', initials: 'GN' },
  { id: 'wf-admin-mwangi-s', name: 'Sarah Mwangi', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legislative and Procedural Services', initials: 'SM' },
  { id: 'wf-admin-chebet', name: 'Mary Chebet', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legislative and Procedural Services', initials: 'MC' },
  { id: 'wf-admin-chelangat', name: 'Faith Chelangat', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legislative and Procedural Services', initials: 'FC' },
  { id: 'wf-admin-otieno-l', name: 'Lilian Otieno', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legislative and Procedural Services', initials: 'LO' },
  { id: 'wf-admin-wambui', name: 'Esther Wambui', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legal Services', initials: 'EW' },
  { id: 'wf-admin-ndiritu', name: 'Brian Ndiritu', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legal Services', initials: 'BN' },
  { id: 'wf-admin-mutua-c', name: 'Caroline Mutua', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legal Services', initials: 'CM' },
  { id: 'wf-admin-odhiambo', name: 'Patrick Odhiambo', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legal Services', initials: 'PO' },
  { id: 'wf-admin-auma', name: 'Beatrice Auma', roleTitle: 'Workflow Administrator', directorate: 'Directorate of Legislative and Procedural Services', initials: 'BA' },
];

export const allPersonas = [...personas, citizenPersona];
