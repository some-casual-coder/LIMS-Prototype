import type { BillContent } from './types';

// Full structured content of the primary demonstration record.
// Realistic (but fictional) legislative drafting prose — no placeholder text.
// Clause 14 is the recurring focal point for review, AI, validation and audit.
export const primaryBillContent: BillContent = {
  recordId: 'NA-BILL-2026-015',
  longTitle:
    'AN ACT of Parliament to establish principles and standards for the provision of digital public services; to safeguard access for persons who require assistance or who are without digital means; to provide for the protection of personal data collected in the course of such services; and for connected purposes.',
  preamble:
    'ENACTED by the Parliament of Kenya, recognising that public services delivered by digital means must remain accessible, accountable and inclusive for every person, and that no individual should be excluded from a public service by reason of the manner in which that service is delivered.',
  clauses: [
    {
      number: 1,
      heading: 'Short title',
      paragraphs: [
        'This Act may be cited as the Digital Public Services Act, 2026.',
      ],
    },
    {
      number: 2,
      heading: 'Interpretation',
      paragraphs: [
        'In this Act, unless the context otherwise requires—',
        '"assisted digital access" means the provision of support to enable a person who is unable to use a digital public service independently to access that service;',
        '"digital public service" means a public service that is provided, in whole or in part, through electronic means by or on behalf of a public entity;',
        '"public entity" has the meaning assigned to it under Article 260 of the Constitution;',
        '"vulnerable user" means a person who, by reason of age, disability, literacy, language, income, location or connectivity, faces a substantial barrier to the independent use of a digital public service.',
      ],
    },
    {
      number: 3,
      heading: 'Application',
      paragraphs: [
        'This Act applies to every public entity that provides a digital public service to members of the public.',
        'This Act does not apply to a service to the extent that its provision by digital means is prohibited by any other written law.',
      ],
    },
    {
      number: 4,
      heading: 'Principles of digital public services',
      paragraphs: [
        'A public entity providing a digital public service shall have regard to the principles that the service is to be—',
        '(a) accessible to every person entitled to use it, including a vulnerable user;',
        '(b) simple, reliable and secure in its operation;',
        '(c) designed to minimise the personal data collected from a user; and',
        '(d) capable of being used without recourse to a digital channel where a person requires an alternative.',
      ],
    },
    {
      number: 5,
      heading: 'Accessibility of digital services',
      paragraphs: [
        'A public entity shall ensure that a digital public service conforms to the accessibility standards prescribed by the Cabinet Secretary in regulations made under this Act.',
        'Where a digital public service does not conform to a prescribed accessibility standard, the public entity shall provide an equivalent means of accessing the service.',
      ],
      commentCount: 1,
    },
    {
      number: 6,
      heading: 'Assisted digital access',
      paragraphs: [
        'A public entity shall make available assisted digital access to a person who is unable to use a digital public service independently.',
        'Assisted digital access shall be provided at no additional cost to the person receiving it.',
      ],
      commentCount: 1,
    },
    {
      number: 7,
      heading: 'Identity verification',
      paragraphs: [
        'Where a digital public service requires the verification of a user’s identity, the public entity shall adopt a method of verification that is proportionate to the service concerned.',
        'A public entity shall not require a person to create or hold a digital credential as the sole means of accessing a public service.',
      ],
    },
    {
      number: 8,
      heading: 'Service availability',
      paragraphs: [
        'A public entity shall take reasonable measures to ensure that a digital public service remains available to users during its published hours of operation.',
        'A public entity shall publish the expected hours of availability of each digital public service.',
      ],
    },
    {
      number: 9,
      heading: 'Data minimisation',
      paragraphs: [
        'A public entity shall collect only the personal data that is necessary for the provision of a digital public service.',
        'Personal data collected under this section shall be processed in accordance with the Data Protection Act, 2019.',
      ],
    },
    {
      number: 10,
      heading: 'Interoperability',
      paragraphs: [
        'A public entity shall design a digital public service so that it is capable of exchanging information with other public services in accordance with standards prescribed in regulations.',
        'A public entity shall not require a person to supply information already held by another public entity, except where necessary to confirm its accuracy.',
      ],
    },
    {
      number: 11,
      heading: 'Notification of decisions',
      paragraphs: [
        'Where a decision affecting a person is made through a digital public service, the public entity shall notify that person of the decision and the reasons for it.',
        'A notification under this section shall be given in a form accessible to the person to whom it is addressed.',
      ],
    },
    {
      number: 12,
      heading: 'Appeals',
      paragraphs: [
        'A person aggrieved by a decision made through a digital public service may appeal against that decision to the public entity concerned.',
        'The Cabinet Secretary may prescribe the procedure for an appeal under this section.',
      ],
    },
    {
      number: 13,
      heading: 'Service performance reporting',
      paragraphs: [
        'A public entity shall, at least once in every financial year, report on the performance of each digital public service it provides.',
        'A report under this section shall include information on availability, accessibility and the use of assisted digital access.',
      ],
    },
    {
      number: 14,
      heading: 'Protection of vulnerable users',
      paragraphs: [
        'A public entity shall take all reasonable measures to ensure that a vulnerable user is not disadvantaged in accessing a digital public service.',
        'Without limiting the generality of subsection (1), a public entity shall—',
        '(a) provide an alternative non-digital channel for a vulnerable user who requires it;',
        '(b) ensure that assisted digital access under section 6 is available at locations reasonably accessible to vulnerable users; and',
        '(c) have regard to the needs of vulnerable users in the design and review of the service.',
        'A public entity shall, in accordance with section 13, report on the measures taken under this section.',
      ],
      changed: true,
      commentCount: 2,
      hasWarning: true,
    },
    {
      number: 15,
      heading: 'Regulations',
      paragraphs: [
        'The Cabinet Secretary may make regulations for the better carrying into effect of the provisions of this Act.',
        'Regulations made under this Act shall be laid before the National Assembly in accordance with the Statutory Instruments Act, 2013.',
      ],
    },
    {
      number: 16,
      heading: 'Transitional provisions',
      paragraphs: [
        'A digital public service in operation immediately before the commencement of this Act shall be brought into conformity with this Act within twelve months of that commencement.',
      ],
    },
    {
      number: 17,
      heading: 'Commencement',
      paragraphs: [
        'This Act shall come into operation on such date as the Cabinet Secretary may, by notice in the Gazette, appoint.',
      ],
    },
  ],
};
