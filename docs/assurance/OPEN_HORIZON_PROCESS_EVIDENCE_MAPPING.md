# Open Horizon Process Evidence Mapping from Deep Focus

## 1. Document Control

| Field | Value |
|---|---|
| Owner | Open Horizon founder / future management-system owner |
| Baseline date | 2026-10-06 |
| Scope | Use of genuine Deep Focus product records as supporting evidence of company processes |
| Status | Mapping proposal; no company certification or management-system audit claimed |
| Classification | Internal |

## 2. Purpose and Boundary

This document explains how Deep Focus records may support evidence that Open Horizon processes operate in practice. It does not assert that Open Horizon currently conforms to, or is certified against, ISO 9001, ISO/IEC 27001, or any other standard.

Product-level conformance and company-level certification readiness are separate:

- Deep Focus product assurance asks whether this app meets defined quality, security, privacy, accessibility, and release criteria.
- Open Horizon QMS/ISMS assurance asks whether the organization has established and consistently operates its defined management processes across the applicable scope.

A single app project cannot alone demonstrate organization-wide processes, management review, competence, resources, internal audit, risk treatment, or control across all products and operations.

## 3. Applicable References Checked

| Reference | Current version checked 2026-10-06 | Mapping use |
|---|---|---|
| ISO 9001 | ISO 9001:2026, published 2026-09-16, current edition on ISO site. | QMS process evidence at principle/process level. Use a licensed official copy before clause-level conformity assessment. |
| ISO/IEC 27001 | ISO/IEC 27001:2022 plus Amendment 1:2024 as listed by ISO. | ISMS risk, information protection, secure development, incident, monitoring and improvement evidence. |
| NIST SSDF | SP 800-218 v1.1. | Practical secure development lifecycle crosswalk; not a certification. |

Official sources:
- https://www.iso.org/standard/88464.html
- https://www.iso.org/standard/27001.html
- https://csrc.nist.gov/pubs/sp/800/218/final

## 4. Product Evidence to Company Process Crosswalk

| Company process capability | Genuine Deep Focus records that may support it | What the product record alone does not prove | Company-level evidence still needed |
|---|---|---|---|
| Customer/user requirements and product planning | Approved product vision, versioned requirements, feature-scope changes, user feedback, acceptance tests. | That the company consistently captures requirements for all clients/products or meets every ISO 9001 requirement. | Organization-wide process, responsibility, review records, contractual requirements, and sampling across projects. |
| Design and development control | Architecture decisions, threat/risk assessments, design reviews, change proposals and traceability. | That development controls operate consistently or that design validation is adequate across the company. | Controlled lifecycle procedure, role assignments, gates, competence, review/verification/validation records for multiple work items. |
| Change and configuration control | Git branches/PRs, commit references, dependency changes, approved release branch and build configuration. | That code changes are authorized, reviewed, tested, or protected unless actual records show this. | Organization policy, access reviews, backup/recovery, release authority, records across systems and products. |
| Quality verification and release | Test plans/results, release readiness decisions, defect/fix/retest records, store submissions. | That quality objectives and acceptance criteria are consistently met. | Defined metrics, quality objectives, release authority and management monitoring. |
| Information security risk management | Product asset/data inventory, threat model, risk register, security tests, vulnerability/incident records. | Organization-wide ISMS scope, risk assessment methodology, Statement of Applicability, or Annex A treatment. | Current ISO/IEC 27001 process, ISMS scope, risk criteria, treatment plan, SoA, owners, review and internal audit records. |
| Secure SDLC | Dependency/secret scanning, protected builds, least-privilege access, code review, security test and release artifact. | That all repositories and supplier pipelines are controlled or all security requirements are met. | Company Secure SDLC standard, tooling/configuration controls, training, exceptions and evidence across product lifecycle. |
| Privacy and data handling | Data inventory, minimization, privacy notices, consent, deletion testing, store declarations. | Legal compliance for all jurisdictions or all company activities. | Company privacy roles/process, processor contracts, retention schedule, request handling, incident handling and legal review. |
| Supplier/dependency control | Dependency inventory, SDK behavior review, license/security triage, vendor decisions. | Organization-wide supplier control. | Approved supplier assessment, contractual/security requirements, periodic review and issue escalation. |
| Competence and awareness | Developer training/skills records and review participation for Deep Focus. | Company competence planning or awareness for every relevant role. | Competency matrix, onboarding, training, role-specific awareness and effectiveness review. |
| Monitoring, feedback and improvement | User feedback, crash/defect trends, corrective actions, release retrospectives and changed acceptance tests. | Management review or continuous improvement across the organization. | Defined objectives, performance review, internal audits, leadership review, corrective action and effectiveness checks. |
| Incident and vulnerability response | Product incident record, affected-build analysis, containment, patch, disclosure decision, retest and lessons learned. | Company-wide incident readiness or customer/regulator notification capability. | Company incident process, communication/escalation tree, exercises, legal obligations and cross-product lessons learned. |
| Business continuity and recovery | Build reproducibility, repository backup, release rollback, data export/deletion and app recovery evidence. | Organization continuity, disaster recovery, service resilience or backup restoration for all company systems. | Business impact/risk analysis, recovery objectives, tested backups, continuity plans and supplier dependencies. |

## 5. Records That Must Be Created at Company Level

As Open Horizon becomes operational, establish and operate its own controlled records:

- QMS/ISMS scope, context, interested parties, policy, objectives, roles and responsibilities;
- company risk methodology and current risk registers;
- Secure SDLC and software release procedures;
- asset, information, supplier, access, incident, vulnerability and continuity processes;
- competence, onboarding and awareness records;
- internal audit plans/results and corrective-action effectiveness;
- management review inputs/decisions and continual improvement;
- certification-body scope, readiness review, audit findings, and transition plan for current standard versions.

Deep Focus can provide a practical case study and sample operating records. Do not mark company controls implemented merely because a Deep Focus document contains a mapping.

## 6. Use and Retention Rules

Retain source links to the exact repository commit, PR, build, test record, issue, or store submission. Identify the organization/product scope, evidence date, record owner, reviewer, classification, and retention rule. Redact secrets and user data. Preserve failed tests and corrective actions; do not retain only successful outcomes.

## 7. Review

Review this mapping when Open Horizon defines its formal QMS/ISMS scope, selects certification targets, adopts a Secure SDLC, adds products or client services, or when ISO publishes a new edition or transition requirements. Clause-level mapping must use the current official standard text and qualified review.
