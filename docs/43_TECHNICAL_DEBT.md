# 43. Technical Debt Register

> Every finding from `34`–`38` and earlier Sprints that is **purely
> technical/architectural** — explicitly excluded from
> [`39_FOUNDER_DECISIONS.md`](./39_FOUNDER_DECISIONS.md) and
> [`40_FOUNDER_DECISIONS_LOCK.md`](./40_FOUNDER_DECISIONS_LOCK.md)
> because they don't need Founder input, only engineering attention when
> the relevant future Sprint arrives. Each item names the future Sprint
> most likely to own it, but does not schedule anything — this is a
> record, not a plan.

## Register

| ID | Debt | Where it came from | What the future Sprint that owns this must do |
| --- | --- | --- | --- |
| TD-01 | `AIConversation`'s message thread is modeled as entities inside the aggregate, unlike `Animal`'s externalized-history pattern — risks the same unbounded-growth problem `Animal` was deliberately designed to avoid | `34_DOMAIN_REVIEW.md` §5-6 | Apply the same History-as-Projection discipline (ADR-11) to `AIConversation`: aggregate holds only current state, messages become a projection over `AIMessageReceived`/`AIResponseGenerated` events |
| TD-02 | No structured clinical vocabulary/ontology for symptoms/diagnoses — Medical records are free-text Value Objects | `36_AI_READINESS.md` | Once FD-11 (`40`) is decided in favor of investing, design a coded vocabulary (even an internal one) before or alongside the Medical migration Sprint |
| TD-03 | `LabTest` has zero schema representation — a brand-new concept identified during business analysis with no corresponding table anywhere | `27_BUSINESS_RULES.md` BR-MED-10 | Run a full Architecture → Production pipeline (`21_GOVERNANCE.md`) as its own Sprint before any LabTest feature is built — cannot be bundled into an unrelated migration (Rule 4) |
| TD-04 | Herd-record granularity: one `Animal` record per generation/batch can't represent per-individual variance within that batch (e.g. 30% of a 200-head batch reacting differently to a disease) | `32_ANIMAL_HEALTH_RECORD.md` §8, `35_BUSINESS_GAP.md` | Design a concrete sub-batch tracking mechanism (or confirm batch-level granularity is intentionally sufficient) before the Medical/Animal migration Sprint for livestock customers |
| TD-05 | `npm audit` reports a "high" severity vulnerability in `postcss`/`sharp`, internal to Next.js 16.2.12's own build tooling (build-time only, no runtime/user exposure) | `07_DEPLOYMENT.md` | Do not run `npm audit fix --force` (would downgrade Next.js to a breaking older version) — track and apply the official Next.js patch release when it ships |
| TD-06 | No "Device/Sensor" aggregate exists for future IoT/Camera/Drone integration; raw telemetry has no translation-layer design | `38_FUTURE_ARCHITECTURE.md` | Design a small, additive Device/Sensor concept (referencing Farm/Animal by id) plus a telemetry-to-event translation layer, only once FD-24/25 (`40`) confirm this is on the roadmap |
| TD-07 | No reporting/analytics read-model or materialization strategy exists — all reporting today is theoretically "read the Timeline," never actually designed | `36_AI_READINESS.md` | Once FD-12 (`40`) confirms priority, design either a 9th "Reporting" Bounded Context or a presentation-layer analytics approach reading Timeline projections |
| TD-08 | No protocol/schedule engine exists for automatic, date-driven reminders (vaccination due dates, age-based poultry vaccination programs) | `35_BUSINESS_GAP.md`, `37_CRM_READINESS.md` | Design a Protocol/Schedule concept in Domain 3 once FD-16/FD-19/FD-20 (`40`) clarify scope — this is the prerequisite both "nhắc lịch" automation and livestock production advice depend on |
| TD-09 | If FD-01 (`40`) is ever decided in favor of true multi-branch (trong cùng một Organization) Doctor support, the frozen Sprint 1.5 `users` schema needs a new (not edited) migration introducing a many-to-many structure | `34_DOMAIN_REVIEW.md` §2 | Design a `doctor_branch_assignments`-style join (`doctor_id`, `branch_id`; the Branch must belong to the same Organization as the Doctor's home account), plus RLS that checks Organization by joining through Branch for a Doctor visible across multiple branches — a materially harder RLS design than anything in the current frozen migration |
| TD-10 | `events` table query/retention/partitioning strategy at multi-year, multi-org scale is undesigned | `26_DOMAIN_MODEL.md` Domain 8 §7 | Design partitioning/archival strategy before Timeline read volume becomes a real production concern — likely needed by the time Sprint covering Domain 3 (high event-volume) ships |
| TD-11 | `AIRecommendationRejected` doesn't capture a structured rejection reason, losing a valuable signal for improving future recommendations | `36_AI_READINESS.md` | Add a reason-code field to the event's data shape when the AI Recommendation migration Sprint is designed |
| TD-12 | An HQ admin has read visibility into descendant organizations but no designed write-elevation path (a deliberate Sprint 1.5 Hardening scope limit, not yet revisited) | `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "Hierarchical visibility" section | Design an explicit elevation mechanism (e.g. a scoped "act as branch" permission) only if a real operational need for HQ-edits-branch-data emerges |
| TD-13 | `Invoice` always derives from exactly one `SalesOrder` (BR-COM-02) — no consolidated/batch invoicing for B2B customers with multiple orders | `34_DOMAIN_REVIEW.md` §4 | Design either a relaxed BR-COM-02 or a new "Invoice batch" concept if/when B2B farm-customer billing patterns require it |
| TD-14 | `Notification` is atomic (one message, one channel, one send) — no "Campaign" concept for coordinated, scheduled, segmented messaging | `34_DOMAIN_REVIEW.md` §4, `37_CRM_READINESS.md` | Design a Campaign aggregate once FD-17 (`40`) confirms marketing/loyalty is a priority |
| TD-15 | `Animal` identity doesn't yet name a microchip/RFID number as a distinct tracked attribute | `35_BUSINESS_GAP.md` | Low-effort additive field — add whenever the Animal identity migration Sprint is written, no design dependency on anything else |

## What makes this list different from `42_RISK_REGISTER.md`

A risk is something that can go wrong with consequences if left
unaddressed. A technical debt item here is simply **unfinished design
work** with no business-scope ambiguity blocking it — the "what" is
already clear from prior Sprints; only the "how, in detail" remains.
Several items above are the technical twin of a Founder decision (e.g.
TD-08 depends on FD-16 being decided first) — those dependencies are
noted so whoever picks up the technical work knows which Founder
decision must land first.

## File liên quan

- Findings this consolidates: [`34_DOMAIN_REVIEW.md`](./34_DOMAIN_REVIEW.md) through [`38_FUTURE_ARCHITECTURE.md`](./38_FUTURE_ARCHITECTURE.md)
- Decisions this depends on: [`40_FOUNDER_DECISIONS_LOCK.md`](./40_FOUNDER_DECISIONS_LOCK.md)
- Architecture principles this debt must respect once resolved: [`41_ARCHITECTURE_DECISIONS.md`](./41_ARCHITECTURE_DECISIONS.md)
