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
  { id: 'ict-admin', name: 'Samuel Kiprop', roleTitle: 'ICT Administrator', directorate: 'Office of the Clerk', initials: 'SK' },
  { id: 'counsel-mumo', name: 'Alice Mumo', roleTitle: 'Legal Counsel', directorate: 'Directorate of Legal Services', initials: 'AM' },
  { id: 'counsel-barasa', name: 'Peter Barasa', roleTitle: 'Senior Legal Counsel', directorate: 'Directorate of Legal Services', initials: 'PB' },
  { id: 'citizen', name: 'James Mwangi', roleTitle: 'Member of the public', directorate: 'Public', initials: 'JM' },
];

export const allPersonas = [...personas, citizenPersona];
