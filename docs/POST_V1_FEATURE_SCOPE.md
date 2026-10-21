# Deep Focus Post-V1 Feature Scope

This document records capabilities that remain outside the protected Deep Focus
V1 scope unless a later approved scope decision explicitly promotes them.

Keeping these items separate protects the 2027-01-01 V1 release target, core
focus-session reliability, privacy, accessibility, and test quality.

---

## 1. V1.1 Candidates

The following features are candidates for the first post-V1 release:

- automatic rescheduling of missed or delayed tasks;
- AI weekly planning;
- a more detailed daily review;
- longer conversational AI assistance;
- enhancements deferred by the 2026-11-15 V1 checkpoint;
- refined AI access and entitlement behavior based on real usage evidence.

Promotion into V1.1 requires a defined user flow, privacy review, data contract,
API contract, testing plan, and explicit product-owner approval.

---

## 2. Advanced AI and Personalization

Future AI capabilities may include:

- voice AI assistance;
- long-form AI chat;
- adaptive daily and weekly planning;
- predictive or adaptive recommendations;
- live coaching during focus sessions;
- intelligent session optimization;
- advanced productivity-pattern interpretation;
- advanced AI analytics;
- adaptive recovery guidance;
- adaptive soundscapes;
- long-term personalization from sufficient, consented evidence.

These capabilities must remain transparent and optional. They must not diagnose
medical or psychological conditions, silently change important state, or make
core focus functionality depend on an AI provider.

---

## 3. Integrations and Multi-Device Expansion

Future platform capabilities may include:

- calendar integrations;
- third-party task-management integrations;
- cloud-drive or productivity-service integrations;
- wearable integrations;
- connected-device management;
- cross-device continuity beyond required V1 synchronization;
- desktop, full productivity Web App, tablet, or browser-extension expansion
  where approved. The Public Website and Account Portal are required for January
  under [V1 scope section 15](V1_FEATURE_SCOPE.md), not deferred by this item.

No provider or platform is selected by this list.

---

## 4. Social, Community, and Collaboration

Future social capabilities may include:

- optional leaderboards;
- community challenges;
- seasonal challenges;
- team challenges;
- collaboration features;
- shared productivity spaces;
- community events.

Any future social system must avoid unhealthy comparison, manipulative
engagement, privacy leakage, or pressure to work excessive hours.

---

## 5. Advanced Rewards and Business Features

Future capabilities may include:

- expanded achievement collections;
- cosmetic rewards;
- advanced milestone systems;
- optional licensed productivity assets such as sounds or cosmetics, not
  Deep Focus-supplied academic videos, papers, notes or answer libraries;
- advanced subscription/business capabilities beyond the required January
  Account Portal; exact paid offers and release placement still need approval;
- additional sustainable business-model experiments.

Deep Focus must not introduce gambling, real-money rewards, cash stakes, or
misleading paid progression. No XP stakes, forfeiture or missed-work penalties
may be reintroduced through a future challenge or commitment module.
Rewarded advertising must remain optional,
non-intrusive, and absent from active focus and recovery experiences.

---

## 6. Advanced Analytics and Well-Being Support

Future capabilities may include:

- longer-term trend analysis;
- richer comparisons and reports;
- predictive productivity insights;
- advanced sustainable-work pattern signals;
- expanded recovery analytics;
- exportable reports;
- deeper reflection workflows.

The product must not claim to diagnose or prevent burnout, mental-health
conditions, attention disorders, or other medical states.

---

## 7. Global, Education, and Enterprise Expansion

October22 reconciliation against main `adebb0fdf9ade89a551c38d15ac22c4060c1b6e4`:
this section covers expansion **beyond** the already admitted V1 Sri Lanka
learner/independent-teacher/bounded-classroom organizer, General/Custom no-pack
use, si/ta/en and local-default/optional paid-cloud resource direction. Optional
reviewed Sri Lanka metadata remains an existing candidate/detail gate, not an
implemented pack or a blanket post-V1 deferral. Current V1/owner decisions and
implementation order take precedence; no new scope cut/promotion here.

Future global capabilities may include:

- additional verified languages beyond the owner-approved si/ta/en launch locales;
- regional AI experiences;
- a reusable Global Education Core;
- richer learner/educator workflows beyond the bounded V1 subset, and institutions;
- modular Country Packs;
- separate Curriculum Packs, Exam Packs, Language Packs, and Compliance Packs;
- Generic International Mode for countries without dedicated Country Packs;
- country-aware academic planning and AI context;
- school, tutoring, tuition/coaching, university, professional-course, and lifelong-learning workflows;
- enterprise administration;
- organization policies;
- advanced data residency or compliance controls;
- team-level analytics with appropriate privacy boundaries.

Deep Focus should use one shared product and codebase rather than separate
country-specific applications. Country-specific education behavior should be
configuration-driven where practical and must not be hard-coded into the global
productivity core.

The education direction should connect academic requirements to actual focused
execution through a flow such as:

```text
Class / Course Requirement
    -> Assignment / Paper / Revision Need
        -> Personal Study Plan
            -> Focus Sessions
                -> Progress / Assessment Evidence
                    -> Next Study Action
```

Country Pack, Curriculum Pack, Exam Pack, Language Pack, and Compliance Pack
responsibilities must remain separate so that local differences can evolve
without coupling unrelated concerns.

A Generic International Mode should allow users to configure subjects, courses,
classes, assignments, examinations, academic dates, grading information where
needed, and study targets even when a dedicated Country Pack does not yet exist.

Potential initial country-pack research and rollout direction may prioritize Sri
Lanka, the United States, Japan, South Korea, the United Kingdom, India,
Singapore, and China, followed by additional countries according to validated
demand and implementation feasibility. This is an inherited research candidate
list, not validated demand, an approved market sequence or a release commitment.

Country-specific functionality involving minors, educators, institutions,
academic records, communications, AI data handling, or materially different
privacy/data/regulatory requirements must receive the appropriate product,
security, privacy, accessibility, and jurisdiction review before release.

The [global planning reference](GLOBAL_EDUCATION_COUNTRY_PACK_ARCHITECTURE.md)
preserves pack separation, optional context and future direction. It is not a
normative schema, new security/legal policy, or override of canonical V1 scope.

The proposed **Today → Focus → Done** screen flow, Sri Lanka learner features,
and educator dashboard/workflows are recorded as **unapproved design and feature
candidates** in [the proposed backlog](PROPOSED_PRODUCT_FLOWS_AND_EDUCATION_FEATURES.md).
This backlog preserves the ideas for owner review; it does not modify V1 or promise
implementation.

---

## 8. Promotion Rules

A post-V1 feature may move into an active release only when:

1. the user problem and product value are clear;
2. the feature does not weaken the core focus experience;
3. architecture, data, API, security, privacy, and UI impacts are documented;
4. accessibility and failure states are defined;
5. required tests and release criteria exist;
6. the implementation fits the approved release capacity;
7. the project owner explicitly approves the scope change.

For Global Education or a Country Pack, promotion should additionally define the
relevant academic data sources, pack versioning, localization behavior, age and
role boundaries, migration behavior, and country/jurisdiction review where
required.

Ideas in this file are directions, not promises of implementation or release.

The owner's enterprise expansion is preserved in the
[capability register](revision/01-REQUIREMENTS-AND-DECISIONS.md), including the
Personal/Professional and Education branches. Resources are local by default;
optional paid cloud is required for the January target by the September 25 owner
decision, with price, limits, security and production acceptance still open.
Language is independent of a country/curriculum pack; si/ta/en launch selection
does not promote every regional feature. This future list
neither reverses those decisions nor promotes all associated draft features into V1.
