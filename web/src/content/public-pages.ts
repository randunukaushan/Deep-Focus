export type PublicPage = {
  eyebrow: string;
  title: string;
  description: string;
  reviewPending?: boolean;
  sections: { kicker: string; heading: string; body: string; items?: string[] }[];
};

export const publicPages = {
  features: {
    eyebrow: 'WHAT WE ARE BUILDING',
    title: 'A useful rhythm, not another feed.',
    description: 'Deep Focus brings task planning, focus sessions, recovery and progress into one calm experience. The product is still in development; this is not a list of released or device-verified features.',
    sections: [
      { kicker: 'THE CORE', heading: 'Plan, focus, return', body: 'The V1 direction is a dependable focus timer, personal tasks and goals, and a clear history. Core focus is designed to work without AI or a network connection.' },
      { kicker: 'YOUR CONTROL', heading: 'A session can change with your day', body: 'Pause, resume or end a session using the choices presented in the app. Deep Focus does not use missed-work XP penalties or claim to diagnose health or attention.' },
      { kicker: 'NOT AVAILABLE HERE', heading: 'No active account or online service', body: 'Sign-in, synchronization, AI, advertising, paid plans and downloads have not been enabled from this preview. Their eventual availability and eligibility depend on separate implementation and review.' },
    ],
  },
  'solutions/personal': {
    eyebrow: 'PERSONAL WORK',
    title: 'Make a little room for your next step.',
    description: 'Deep Focus is being designed for people who want a simple place to decide what matters, focus for a while and notice the time they protected.',
    sections: [
      { kicker: 'START SMALL', heading: 'One task is enough', body: 'Keep the next step clear. A plan is a guide you can revise, not a promise you owe the app.' },
      { kicker: 'FOCUS YOUR WAY', heading: 'Choose a block that fits', body: 'The mobile focus flow is under development. No web timer or full browser productivity app is part of this release scope.' },
      { kicker: 'A GENTLER RECORD', heading: 'Progress without punishment', body: 'The product direction avoids missed-day penalties and unverified productivity or health claims.' },
    ],
  },
  'solutions/education': {
    eyebrow: 'EDUCATION',
    title: 'Support the work around learning.',
    description: 'The product direction includes personal study planning and tools for independent teachers, with an initial Sri Lankan education context.',
    sections: [
      { kicker: 'YOUR MATERIALS', heading: 'Bring your own resources', body: 'Deep Focus is not a source of lessons, papers or notes. The approved direction is to help people organize resources they already have; the resource feature is not yet available.' },
      { kicker: 'PERSONAL FIRST', heading: 'Study plans stay yours', body: 'Personal planning and teacher organization are distinct from classroom sharing. Classroom access and real-minor participation are not enabled in this preview.' },
      { kicker: 'LANGUAGE AND CONTEXT', heading: 'Keep language and curriculum separate', body: 'Sinhala, Tamil and English are target interface languages. Country, curriculum and language choices remain separate; reviewed localized website content is not yet available.' },
    ],
  },
  plans: {
    eyebrow: 'PLANS',
    title: 'Purchasing is not available.',
    description: 'No prices, subscription offers or checkout are active in this development preview.',
    reviewPending: true,
    sections: [
      { kicker: 'NO CHECKOUT', heading: 'Nothing to buy here', body: 'Commercial details, provider eligibility and billing safeguards are not finalized. This page does not offer a placeholder price or collect payment information.' },
      { kicker: 'CORE ACCESS', heading: 'Launch access is still being decided', body: 'The required purchase-free launch path has not yet been confirmed. Check back for a reviewed offer matrix before making a purchase decision.' },
    ],
  },
  roadmap: {
    eyebrow: 'ROADMAP',
    title: 'What is in progress.',
    description: 'This is a snapshot of work being built, not a delivery promise. Items move only after their quality, safety and review gates are met.',
    sections: [
      { kicker: 'IN DEVELOPMENT', heading: 'Mobile focus and personal planning', body: 'The team is building the Android and iOS foundation, focus session recovery, tasks, goals and progress.' },
      { kicker: 'IN DEVELOPMENT', heading: 'Public website and account portal', body: 'Public information pages are being implemented. The authenticated account portal depends on verified identity, shared APIs and security review.' },
      { kicker: 'GATED', heading: 'Online, paid and age-sensitive features', body: 'Sync, AI, ads, purchases, classroom sharing and real-minor access need their own policies, infrastructure and reviews before they can be offered.' },
    ],
  },
  updates: {
    eyebrow: 'UPDATES',
    title: 'No public release notes yet.',
    description: 'Engineering progress is not the same as a released, supported product. Public release notes will appear here after a verified release.',
    sections: [
      { kicker: 'STATUS', heading: 'Still in development', body: 'No app version is currently announced as publicly released from this preview.' },
    ],
  },
  help: {
    eyebrow: 'HELP',
    title: 'A preview, not a support channel.',
    description: 'This website does not yet accept support requests or personal information.',
    sections: [
      { kicker: 'LOCAL DATA', heading: 'The app preview is still changing', body: 'Do not use development builds as the only copy of important information. A local save is not a backup or a guarantee of recovery across reinstall or device loss.' },
      { kicker: 'INTERRUPTED SESSION', heading: 'Recovery is being tested', body: 'Session recovery is under development and has not yet completed installed-device verification.' },
      { kicker: 'NEED HELP?', heading: 'Support details are not published', body: 'A verified support contact and response policy have not been selected. Please do not send private account, study or health information to an unverified address.' },
    ],
  },
  contact: {
    eyebrow: 'CONTACT',
    title: 'Contact details are not ready.',
    description: 'A verified support channel has not been selected, so this preview has no contact form or email address.',
    reviewPending: true,
    sections: [{ kicker: 'PRIVACY', heading: 'Please do not send personal information', body: 'Publisher details and a support process must be confirmed before a public contact channel is added.' }],
  },
  privacy: {
    eyebrow: 'PRIVACY',
    title: 'Privacy information is being reviewed.',
    description: 'This page is a publication placeholder, not a privacy policy or legal notice.',
    reviewPending: true,
    sections: [{ kicker: 'NOT A POLICY', heading: 'Do not rely on this preview', body: 'Data flows, retention, processing regions, publisher identity and age/consent terms need to be verified and reviewed before publication.' }],
  },
  terms: {
    eyebrow: 'TERMS',
    title: 'Terms are not published.',
    description: 'This page is a status notice only; it does not create or summarize contractual terms.',
    reviewPending: true,
    sections: [{ kicker: 'PUBLICATION GATE', heading: 'Qualified review required', body: 'The publisher, service boundaries, consumer terms and applicable legal details have not been finalized.' }],
  },
  'data-deletion': {
    eyebrow: 'DATA AND DELETION',
    title: 'Data controls are still being built.',
    description: 'This page does not offer an account-deletion request or promise deletion from backups.',
    reviewPending: true,
    sections: [{ kicker: 'NOT YET AVAILABLE', heading: 'No online account service is active', body: 'Local data, account data, export and deletion need distinct verified flows. Do not treat uninstalling a development build as a tested deletion process.' }],
  },
  accessibility: {
    eyebrow: 'ACCESSIBILITY',
    title: 'Accessibility work is ongoing.',
    description: 'The product is being designed to support clear navigation, readable text and reduced motion, but no conformance claim has been verified.',
    reviewPending: true,
    sections: [{ kicker: 'VERIFICATION', heading: 'Platform checks remain', body: 'Keyboard, screen-reader, contrast, text scaling and supported-language testing must be completed on the actual website and mobile builds before supported capabilities are listed.' }],
  },
} satisfies Record<string, PublicPage>;

export function getPublicPage(slug: string) {
  return publicPages[slug as keyof typeof publicPages];
}
