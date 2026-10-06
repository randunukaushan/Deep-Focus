# Research and Recommendations

Status: research synthesis, 2026-09-14. Decisions remain in [01](01-REQUIREMENTS-AND-DECISIONS.md); a recommendation is not an approval. Technical contracts below are proposed engineering designs, not statements that vendors provide the whole Deep Focus product automatically.

## 1. ප්‍රධාන නිගමනය

Deep Focus එකේ වෙනස “apps විස්සක features සියල්ල එකට දැමීම” නොවිය යුතුයි. මගේ නිර්දේශය: **plan → protect attention → finish something meaningful → leave a return point → recover → resume** යන සම්පූර්ණ, විශ්වාස කළ හැකි workflow එක. Sri Lanka education context සහ privacy-respecting professional workflows ඒ core එක භාවිත කරන modules විය යුතුයි. Enterprise level යනු විශාල feature count එකක් පමණක් නොව tenant isolation, reliable billing, support, restore, accessibility සහ measurable release quality ය.

මෙය market positioning hypothesis එකක්. Willingness to pay, retention uplift හෝ “world first” novelty තහවුරු වී නැහැ. Feature list එකක් ඒ සාක්ෂිය ලබා දෙන්නේ නැහැ.

## 2. Earlier 20-app research: retained evidence

[සම්පූර්ණ Sinhala market report](evidence/Deep-Focus-Market-Research-SI.md) සහ [source/repository audit](evidence/Evidence-and-Repository-Audit.md) මෙහි snapshots ලෙස ඇත. ඒවා නැවත කළ පරීක්ෂණ ලෙස ගණන් නොගන්න. පහත benchmark set එක purposive sample එකකි; download ranking හෝ සෑම category එකේම objectively හොඳම apps 20 බවට claim එකක් නොවේ.

| Comparison group | Products reviewed | Deep Focus design implication |
| --- | --- | --- |
| Timer, tasks, motivation | Forest, Focus To-Do, TickTick, Todoist, Focus Plant | Reliable completion, understandable task links, optional rewards; do not make decorative growth the only user value |
| Distraction intervention | Freedom, Opal, one sec, ScreenZen, AppBlock | Clear platform limits, reversible exceptions, understandable pricing and bypass behaviour |
| Planning and work insights | RescueTime, Rize, Session, Sunsama, Motion | Explain automation, allow manual correction, distinguish tracked activity from meaningful output |
| Accountability, audio, day planning | Focusmate, Flow Club, Brain.fm, Endel, Structured | Optional social presence/audio; calm daily flow; no forced social or audio dependency |

The evidence snapshot contains individual features, selected public review links, complaints, feature requests and proposed responses. Reviews are self-selected accounts, not prevalence estimates. Historical complaints may have been fixed; disputed reports are not reproduced as verified current defects. Apps were not installed and exercised end-to-end in this study. Prices and vendor capabilities can change; recheck before purchase or comparative marketing.

Cross-product themes are useful **design risk signals**, not votes: timer reliability; restore/sync confidence; transparent paywalls; excessive setup; interruption and notification friction; limited platform consistency; privacy concerns. A review-derived requirement must still be validated with target users.

## 3. Differentiation bets and how to disprove them

| Candidate | Exact value hypothesis | Small validation / failure signal |
| --- | --- | --- |
| Return Ticket / Context Bridge | A short saved “next action + context” makes restarting interrupted work easier | Compare time-to-restart and user-rated usefulness over repeated real interruptions; drop extra fields if writing the ticket is the larger burden |
| Outcome Receipt | Session ends with optional tangible result, not just minutes | Observe whether users can identify meaningful output without feeling assessed; never count AI guesses as outcomes |
| Unified Capacity Planner | Work, study and life fit one realistic availability budget without exposing private details to teams | Test clashes, buffers, skipped days and edit recovery; reject plans that exceed available minutes |
| Intent-aware Shield | Protect selected intent with exceptions and an honest escape route | Device/OS capability spike first; measure mistaken blocks and successful emergency access |
| Graceful Return | A missed day offers a small restart, not guilt or lost purchased value | Test comprehension and willingness to resume; no streak-loss notification experiment designed to induce anxiety |
| Focus Passport / Team Agreement | Share chosen evidence or availability boundaries across contexts | Recipient sees only selected fields; revocation works; managers cannot infer private activity from hidden calendars |
| Sri Lanka Learning Workflow | Verified local syllabus structure connects topics, revision and actual practice | Native-language students/teachers validate a bounded edition; time logged must never be labelled mastery |
| Recovery Lab | User-selected break experiments help identify personal preferences | Explain “your self-report”, not diagnosis; no claim to predict burnout |

Recommended first differentiation prototype: **Return Ticket + Outcome Receipt + bounded daily planning**. This is a recommendation for ADR-006, not a replacement for approved core scope.

MyStudyLife already documents timetable/exam/task planning, AI planning and timetable capture. Therefore “AI study planner” and “scan timetable” alone are not credible uniqueness claims. This extra education comparator is vendor-feature research, not a newly completed independent-review study. [MyStudyLife product tour](https://mystudylife.com/tour/)

## 4. Backend and hosting selection

| Candidate | Why it fits / trade-off | Proposed disposition |
| --- | --- | --- |
| Supabase PostgreSQL + Auth + TypeScript server boundary | Relational memberships, curriculum versions, entitlements and ledgers fit well. RLS provides defence in depth, but policies, migrations, backups and server authorisation still need engineering | Provider/Auth selection approved 2026-09-14; no project created |
| Firebase Auth + Firestore + trusted functions/services | Viable mobile ecosystem. Relational reporting and cross-entity invariants require careful document/transaction design; server SDK permissions are distinct from mobile/web rules | Viable alternative, not rejected as insecure |
| AWS managed PostgreSQL + Cognito + API/services | Strong configurable infrastructure; more IAM, networking and operational assembly for a solo builder | Keep as enterprise deployment alternative; avoid premature multi-cloud implementation |

Supabase exposed tables require both appropriate grants and RLS policies. Publishable keys are not user identities; secret/service-role credentials belong only on trusted infrastructure. Ordinary user requests must not automatically use unrestricted administrator access. [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [API keys](https://supabase.com/docs/guides/getting-started/api-keys)

Firestore mobile/web rules and server/IAM enforcement are different trust boundaries; choosing Firebase does not remove ownership tests. AWS likewise describes RLS as a pooled PostgreSQL tenant-isolation technique, not an entire SaaS security solution. [Firestore security](https://firebase.google.com/docs/firestore/security/overview), [AWS PostgreSQL tenant isolation](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-managed-postgresql/rls.html)

ADR-002 update: Next.js Website/Portal framework selection was approved 2026-09-14. Managed hosting vendor is still open, with Vercel a candidate; Expo web is a retained comparison, not a competing active selection for these two surfaces. Do not rewrite the mobile application into Next.js. Authorisation belongs close to data access; hiding a navigation item or checking only a layout is insufficient. [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)

No hosting benchmark, vendor account configuration or paid-service eligibility test has been performed. Latency, region, backups, costs and deployment ownership must be settled before production.

## 5. Secure mobile persistence

ADR-012 proposes transactional SQLite for domain records/outbox, with an explicit migration from existing JSON files. Expo SDK 56 supports SQLite; SQLCipher requires native configuration/build work and is not an Expo Go capability. Encryption is an additional design decision with key-loss and migration consequences, not a checkbox. [Expo 56 SQLite](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/)

SecureStore is for small credentials/keys, not the only copy of irreplaceable work. Android uninstall, platform backup and biometric changes have important consequences; iOS persistence across reinstall must not be assumed as a guarantee. Test real device sign-out, reinstall and key invalidation. This is not end-to-end encryption. [Expo 56 SecureStore](https://docs.expo.dev/versions/v56.0.0/sdk/securestore/)

## 6. Payments: price deferred does not mean provider can be deferred forever

Digital functionality purchased inside mobile apps must follow current store billing policies and applicable regional exceptions. A web portal cannot simply be treated as an unrestricted in-app payment bypass. Recheck the actual storefront, build and programme eligibility at release. [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/), [Google Play payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en)

Apple subscription groups affect simultaneous purchases and upgrade/downgrade behaviour. Arbitrary independent modules and one clean bundle are not automatically one subscription experience across stores. Design a small understandable catalog, then prove each supported transition in store sandboxes. [Apple subscriptions](https://developer.apple.com/app-store/subscriptions/)

Merchant eligibility depends on the business, not the app's UI language. Sri Lanka was not listed as a supported Stripe business location in the consulted global availability page. Paddle is a possible web merchant-of-record candidate: Sri Lanka was not on its published unsupported-country list, but underwriting and account approval are not guaranteed. Neither conclusion establishes the owner's business location or eligibility. [Stripe availability](https://stripe.com/global), [Paddle supported countries](https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle)

Open gate: business entity/country, payout eligibility, taxes/refunds and product classification before production checkout. No prices or commercial contracts are selected here.

## 7. Sri Lanka education, rights and privacy

Product clarification: Deep Focus supplies no papers/notes/lessons or question/answer library. Curriculum research supports optional organisational metadata and context, not content distribution. Own-resource planning for students and independent teachers is primary; local storage is default, optional paid cloud is accepted direction with price/limits/release gated. See [12](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) and the [cloud cost model](06-MONETIZATION-AND-ENTITLEMENTS.md). Provider comparisons below are evidence, not partnerships or a plan to reproduce their materials.

Expanded follow-up: [Sri Lanka student/teacher research](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md) adds 2025 official population/connectivity context, local alternatives and dated reviews, teacher evidence and a proposed validation plan. [Education contracts](11-SRI-LANKA-EDUCATION-CONTRACTS.md) translate that into private/class ownership, learner/teacher flows and acceptance cases. No interviews, partner agreements or real-user pilot are implied.

NIE provides syllabus access by language, including English material within teacher guides. Use versioned official references and a subject-qualified reviewer, not an unverified AI-generated syllabus. Public availability is not automatically permission to redistribute whole textbooks/papers. [NIE syllabus index](https://nie.lk/selesyll), [Ministry of Education e-thaksalawa](https://e-thaksalawa.moe.gov.lk/)

LTI, OneRoster, CASE, QTI and learner-record standards address different interoperability problems. They are future candidates, not a requirement to implement every standard now or a claim of certification. [1EdTech standards](https://www.1edtech.org/standards/details)

Follow-up on 2026-09-14 resolved the earlier Gazette retrieval failure: Gazette 2498/16 appoints **January 1, 2027** for sections 2/3 and Parts I/III to come into operation. This is the planned release date, so privacy readiness is a launch dependency, not a later enterprise enhancement. This does not establish every provision's commencement or certify the app's compliance. Child accounts, consent, transfers, retention and incident duties still require current legal review against the Act as amended and applicable instruments. [Gazette 2498/16](https://dpa.gov.lk/Gazet/2498-16_E.pdf), [DPA official index](https://dpa.gov.lk/guidelines.php)

Language selection, curriculum pack, current location, billing country and legal availability are independent dimensions. “Sinhala available” does not establish Sri Lankan residence; “General mode” does not bypass age/privacy rules.

## 8. Psychology, visual design and safety

Owner's “addictive” preference is interpreted within the project mission as **useful enough to return to voluntarily**, not compulsive engagement. Autonomy, competence and relatedness provide a useful design framework; they do not prove Deep Focus increases productivity. One experimental study of gamification elements does not justify universal claims about streaks or intrinsic motivation. [Ryan & Deci framework](https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf), [Mekler et al. study record](https://edoc.unibas.ch/entities/publication/ccec8ccc-aa54-417d-b205-334b518d6eed)

Use progressive disclosure for advanced modules while keeping important controls discoverable. Motion should communicate state, remain optional and respect reduced motion. Decorative landscapes must not reduce contrast or cover timer controls. No evidence here says blue colour or a mountain image medically improves attention. [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [Apple motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion), [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [Pause/stop/hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)

Shielding is platform-dependent. Apple distribution requires the appropriate Family Controls entitlement process. Android AccessibilityService use has disclosure, consent and policy restrictions; it is not permission to prevent uninstall or bypass platform protections. Unsupported devices need a clearly labelled softer focus mode. [Apple entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement), [Google AccessibilityService policy](https://support.google.com/googleplay/android-developer/answer/10964491?hl=en)

## 9. Integrations and AI

Google Calendar requires scoped OAuth consent. Incremental sync has pagination, deletion and expired-token recovery; a 410 reset must rebuild the **connector mirror**, never delete Deep Focus tasks or unrelated calendars. [Calendar authorisation](https://developers.google.com/workspace/calendar/api/auth), [Calendar sync](https://developers.google.com/workspace/calendar/api/guides/sync)

Separate in-app provider APIs from external ChatGPT/Claude/Gemini user experiences. A consumer subscription is not a Deep Focus API credential. MCP compatibility must be verified per external client; Gemini API support does not establish identical Gemini consumer-app connector support. [OpenAI connector quickstart](https://developers.openai.com/plugins/build/app-quickstart), [Claude remote connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [Gemini API](https://ai.google.dev/gemini-api/docs/get-started)

## 10. Luna implementation quality

The user's requested model is **gpt-5.6-luna, medium**; this work does not change it or assume undocumented guarantees. General Codex prompting guidance supports providing context, constraints, expected behaviour and verifiable results. Our bounded task-card, stop-condition and regression-gate system is an engineering recommendation, not a vendor promise that one model can securely ship the entire platform unsupervised. [Official model catalog](https://developers.openai.com/api/docs/models), [Codex prompting](https://learn.chatgpt.com/docs/prompting)

Use OWASP requirements as verification inputs, not marketing certificates. Select an ASVS/MASVS verification profile in the implementation task and keep evidence for applicable controls. [ASVS](https://owasp.github.io/www-project-application-security-verification-standard/), [MASVS](https://mas.owasp.org/MASVS/), [API object authorisation](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/)

## 11. Research limitations / next evidence

- No statistically representative review sample, paid competitor trial, user interview or willingness-to-pay test completed.
- No proof that suggested differentiators are unprecedented; novelty needs wider market and, if commercially relevant, IP review.
- No production security audit, mobile entitlement approval, merchant approval, legal opinion or curriculum content licence obtained.
- New sources above were consulted for this revision; evidence snapshots retain their own earlier dates. Recheck changing policies before implementation and again before release.
- Next product evidence: 5–8 target-user prototype sessions as a proposed discovery round, including Sri Lankan learners and professionals; native-language review; report observed failures, not only positive quotes. This small round finds usability issues, not population-level conversion rates.
