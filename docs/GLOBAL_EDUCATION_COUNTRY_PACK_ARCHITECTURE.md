# Deep Focus Global Education and Country Pack Architecture

This document records the approved long-term product direction for expanding Deep Focus into a globally adaptable education experience without turning the protected V1 release into a country-specific learning-management system.

The decisions in this document define product and architecture direction. They do not promote these capabilities into V1 and do not represent a commitment to launch every listed country or education workflow at the same time.

---

## 1. Decision Summary

Deep Focus should be designed so that future education capabilities can scale internationally through a shared global platform rather than separate country-specific applications.

The approved direction is:

- keep one Deep Focus product and codebase;
- preserve the existing productivity and focus core;
- introduce a reusable Global Education Core as a post-V1 capability;
- adapt education behavior through modular Country Packs and related packs;
- avoid hard-coding one country's education system into the core domain;
- support a Generic International Mode for countries without a dedicated pack;
- keep Country Packs separate from Curriculum Packs, Exam Packs, Language Packs, and Compliance Packs;
- allow education-specific AI to use the active academic context while preserving user confirmation and control;
- treat teachers, tutors, lecturers, and educational institutions as future education-platform users in addition to learners;
- introduce country-specific functionality only after the required product, privacy, security, accessibility, data, and legal review.

---

## 2. Relationship to the Existing Deep Focus Product

Deep Focus remains an intelligent productivity and focus platform first.

The education expansion should build on existing capabilities such as:

- focus sessions;
- tasks;
- goals;
- planning;
- analytics;
- recovery and breaks;
- personalization;
- optional AI guidance;
- offline and synchronization behavior;
- notifications and reminders;
- accessibility and user-control requirements.

Education functionality should reuse these capabilities rather than duplicate them inside an isolated education application.

Conceptually:

```text
Deep Focus
    |
    +-- Global Productivity Core
    |     +-- Focus
    |     +-- Tasks
    |     +-- Goals
    |     +-- Planning
    |     +-- Recovery
    |     +-- Analytics
    |     +-- AI Guidance
    |
    +-- Global Education Core (post-V1)
          +-- Learner Experience
          +-- Educator Experience
          +-- Institution Experience
          +-- Academic Planning
          +-- Academic Progress
          +-- Assessment / Revision Workflows
          +-- Country and Academic Packs
```

The education layer must not weaken the reliability, simplicity, calm experience, privacy model, or accessibility of the core product.

---

## 3. Future Education User Families

The education direction expands the existing student and lifelong-learning audience into three broad future user families.

### 3.1 Learners

Potential learner groups include:

- school students;
- secondary-school examination students;
- tuition, tutoring, academy, and coaching students;
- university and higher-education students;
- professional-course and certification learners;
- lifelong learners.

Country-specific labels such as Sri Lankan O/L or A/L should be represented by packs rather than embedded as universal domain concepts.

### 3.2 Educators

Potential educator groups include:

- school teachers;
- private tutors;
- tuition and coaching teachers;
- lecturers;
- instructors;
- academic mentors where appropriate.

Educator capabilities should focus on helping learners execute meaningful study and revision work rather than merely recreating administrative systems that already exist elsewhere.

### 3.3 Educational Institutions

Potential institution users may include:

- tuition or coaching institutes;
- schools;
- universities and higher-education providers;
- learning organizations.

Institution-level functionality remains post-V1 and requires explicit approval before implementation.

---

## 4. Global Education Core

The Global Education Core should use country-neutral academic concepts wherever practical.

A possible generalized model is:

```text
Academic Program
    -> Subject / Course
        -> Unit
            -> Topic
                -> Learning Task / Assignment
                -> Assessment / Exam
                    -> Result / Evidence
                        -> Weak or Incomplete Areas
                            -> Recommended Study Actions
                                -> Focus Sessions
```

For higher education, the same core may support concepts such as:

```text
Program / Degree
    -> Term / Semester
        -> Course / Module
            -> Lecture / Tutorial / Lab
            -> Assignment / Project
            -> Assessment / Exam
```

Country-specific terminology should be supplied by configuration or packs where possible.

---

## 5. Country Pack Model

A Country Pack represents country-level education context and defaults.

A Country Pack may define or reference:

- country identifier and supported regions;
- education levels and local terminology;
- common academic-year patterns;
- grading conventions or references;
- local education pathways;
- country-level user-experience terminology;
- default language relationships;
- relevant regional configuration;
- references to supported Curriculum Packs and Exam Packs;
- references to required Compliance Packs;
- AI context metadata appropriate to the supported academic workflows.

A Country Pack should not become a container for every curriculum, exam, language, or compliance rule.

---

## 6. Pack Separation

The architecture should keep the following concerns separate.

### 6.1 Country Pack

Defines country-level academic context and connects related packs.

### 6.2 Curriculum Pack

Defines an approved curriculum or syllabus structure where Deep Focus needs structured curriculum awareness.

Potential data may include:

- subjects or courses;
- units;
- topics;
- optional topic ordering;
- curriculum version or effective period;
- authoritative source metadata where required.

### 6.3 Exam Pack

Defines a supported examination or assessment framework.

Potential data may include:

- examination name;
- relevant subjects;
- assessment structure;
- timing and scheduling concepts;
- scoring or grading metadata where appropriate;
- revision-planning context.

### 6.4 Language Pack

Defines localized interface content and education terminology.

Language support must remain compatible with accessibility, layout, text scaling, and locale-sensitive date/time behavior.

### 6.5 Compliance Pack

Represents feature constraints or configuration needed for a jurisdiction, audience, institution type, or regulated workflow.

It may control whether particular capabilities require additional consent, age handling, data-locality decisions, administrative controls, or legal review.

A Compliance Pack is not a substitute for qualified legal review.

---

## 7. Generic International Mode

Deep Focus should remain usable in countries that do not yet have a dedicated Country Pack.

A Generic International Mode should allow users to configure essential academic information manually, such as:

- subjects or courses;
- classes;
- assignments;
- examinations;
- academic dates;
- grading scale where required;
- study targets;
- university modules or equivalents.

The core productivity and education workflows should continue without requiring a country-specific pack.

When a dedicated Country Pack becomes available later, migration should preserve existing user data and avoid forcing destructive changes.

---

## 8. Education Execution Loop

The main education differentiation should connect academic requirements to actual focused execution.

A target workflow is:

```text
Class / Course Requirement
    -> Homework / Assignment / Paper / Revision Need
        -> Personal Study Plan
            -> Focus Sessions
                -> Completion / Assessment Evidence
                    -> Progress or Weak-Area Update
                        -> Next Recommended Study Action
```

The product should prioritize helping users turn learning requirements into realistic, focused work rather than attempting to replace every LMS, school-management system, tuition-management system, or examination platform.

---

## 9. Learner Capabilities

Potential post-V1 learner capabilities include:

- academic profile and study goals;
- subjects or courses;
- class and lecture timetable;
- assignments, homework, papers, and revision tasks;
- syllabus or topic progress where supported by an approved Curriculum Pack;
- examination countdowns and revision planning;
- paper or assessment review;
- weak-topic or incomplete-topic tracking where the underlying evidence is sufficient;
- study-time targets and actual focused time by subject or course;
- backlog and catch-up planning;
- AI-assisted academic planning;
- task-to-focus-session breakdown;
- university assignment and project planning;
- semester or term workload planning.

These capabilities should avoid presenting uncertain learning inferences as guaranteed facts.

---

## 10. Educator Capabilities

Potential post-V1 educator capabilities include:

- classes or cohorts;
- subject or course organization;
- class calendars;
- lesson or topic progress where appropriate;
- assignment or revision-work publishing;
- recommended independent-study time;
- paper or assessment publishing where supported;
- aggregated completion information;
- aggregated academic progress or weak-area signals where sufficiently supported;
- revision planning;
- controlled announcements and resource links.

Teacher-to-student capabilities must preserve appropriate privacy, age-related safeguards, role boundaries, and user control.

Deep Focus should not introduce unrestricted communication or surveillance features merely because an educator relationship exists.

---

## 11. University and Higher-Education Direction

The higher-education experience may support:

- degree or program structure;
- terms or semesters;
- modules or courses;
- lectures, labs, and tutorials;
- assignments and deadlines;
- examination calendars;
- project milestones;
- research and thesis planning;
- presentation or viva preparation;
- internship-related planning;
- optional grade or GPA tracking where the user's grading system is supported;
- study-group planning where privacy and collaboration requirements are defined.

Deep Focus should complement university LMS/VLE systems rather than assume that it must replace them.

---

## 12. Country-Aware AI

Education AI should use the user's selected academic context when available.

Relevant context may include:

- country or Generic International Mode;
- education level;
- curriculum or examination pack;
- subjects or courses;
- deadlines and exam dates;
- available study time;
- user preferences;
- verified progress and assessment evidence.

AI may propose plans, revision priorities, task breakdowns, or study schedules, but important state changes must remain subject to user confirmation where required by the existing Deep Focus AI rules.

AI must not fabricate official curriculum, examination, grading, or regulatory information when an authoritative pack is unavailable.

---

## 13. Data-Driven Implementation Direction

Country-specific behavior should be configuration-driven where practical rather than spread through screen-specific conditional code.

A future implementation may use a structure conceptually similar to:

```text
education/
    core/
    countries/
        <country-code>/
            country
            education-levels
            terminology
            academic-calendar
            pack-references
    curricula/
    exams/
    languages/
    compliance/
```

The exact file format, storage model, API contract, and backend implementation are not approved by this conceptual structure and must be defined during architecture design before implementation.

Packs should support:

- stable identifiers;
- explicit versions;
- source/provenance metadata where appropriate;
- validation;
- safe updates;
- backward compatibility or migration rules;
- testing;
- deprecation where a pack is superseded.

---

## 14. Initial Market Direction

The platform should be globally ready without requiring full localization for every country at initial launch.

The initial country-pack research and rollout direction may prioritize:

1. Sri Lanka;
2. United States;
3. Japan and South Korea;
4. United Kingdom, India, and Singapore;
5. China;
6. additional countries based on validated demand and implementation feasibility.

This ordering is a planning direction, not a release commitment.

China and any other market with materially different platform, education, privacy, data, or regulatory constraints requires dedicated review before enabling affected features.

---

## 15. Localization and Accessibility

Global education support should be designed for multiple languages and locale differences from the beginning of the education architecture.

Requirements include:

- avoid embedding user-facing education text directly into business rules;
- support locale-aware dates, times, numbers, and academic terminology;
- preserve screen-reader semantics across translations;
- support text expansion and dynamic text;
- avoid assuming Latin script or a single reading direction where future supported languages require otherwise;
- keep country, curriculum, examination, and language selection understandable and reversible where practical.

---

## 16. Privacy, Minors, Security, and Compliance

Education functionality may involve minors, educators, institutions, academic records, or other sensitive contexts.

Before a country-specific education capability is released, the project must determine the applicable requirements for the intended market and feature.

At minimum, design review should consider:

- age and account model;
- parental or guardian involvement where legally or product-wise required;
- educator and institution roles;
- authorization boundaries;
- data minimization;
- academic-data sensitivity;
- analytics aggregation and privacy;
- deletion and retention;
- consent and transparency;
- AI data handling;
- cross-border or regional data requirements where applicable;
- communication and collaboration safeguards.

No Country Pack should be treated as proof of legal or regulatory compliance by itself.

---

## 17. Relationship to V1

This document does not change the protected Deep Focus V1 scope.

The V1 release remains governed by `V1_FEATURE_SCOPE.md` and `V1_IMPLEMENTATION_PLAN.md`.

Global Education, educator/institution workflows, dedicated Country Packs, Curriculum Packs, Exam Packs, and related education-platform capabilities remain post-V1 unless a later owner-approved scope decision explicitly promotes a bounded subset.

The architecture should avoid V1 changes made only to support speculative education complexity. However, normal V1 work should avoid unnecessary assumptions that would make future localization or modular expansion unreasonably difficult.

---

## 18. Promotion Requirements

Before a Global Education capability or pack moves into an active implementation release, the project should define:

1. target users and user problem;
2. exact product scope;
3. authoritative data sources where structured academic information is used;
4. architecture and module boundaries;
5. data model and migrations;
6. API contract where required;
7. security, privacy, age, and role model;
8. country or jurisdiction review where required;
9. localization and accessibility behavior;
10. offline, synchronization, error, and recovery behavior;
11. testing and acceptance criteria;
12. pack versioning and update strategy;
13. release and rollback plan;
14. explicit product-owner approval.

---

## 19. Guiding Principle

Deep Focus should become globally adaptable by sharing one strong productivity and education foundation while allowing local academic differences to remain modular.

The objective is not to create a different Deep Focus application for every country.

The objective is to build one trusted Deep Focus platform that can understand the academic context of different learners and educators without sacrificing focus, simplicity, privacy, accessibility, or user control.
