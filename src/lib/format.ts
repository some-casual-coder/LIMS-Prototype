import type { Directorate } from '@/data/types';

// Short directorate codes for compact profile / metadata lines.
export function dirAbbrev(directorate: Directorate | 'Public'): string {
  switch (directorate) {
    case 'Directorate of Legal Services':
      return 'DLS';
    case 'Directorate of Legislative and Procedural Services':
      return 'DLPS';
    case 'Office of the Clerk':
      return 'Clerk';
    case 'Parliamentary Legislative Proposal Unit':
      return 'PLPU';
    case 'Parliamentary Records Service':
      return 'PRS';
    default:
      return '';
  }
}

// Time-of-day greeting based on the presenter's local clock.
export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
