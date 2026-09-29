# 32. Animal Domain Deep Dive — Health Record, Timeline, History

> Detailed elaboration of Domain 2 (Animal) from
> [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md), classified there as
> **Core** — the animal-centric health record is VETJOY's stated
> differentiator (Sprint 1 Revision: "make Animal, not Customer, the
> center of health records"). This document specifically answers the
> brief's requirement that "mỗi Animal phải có: Identity, Health Record,
> Timeline, Owner History, Farm History, AI History" — and explains, in
> DDD terms, *how* an aggregate can honestly satisfy all six without
> becoming an unbounded, ever-growing object.

## 1. Mục tiêu (Purpose)

Make one specific animal — not a species, not a customer, not a product
— the organizing unit around which its entire health story accumulates,
for as long as that animal is under VETJOY's care (potentially its whole
life, and across ownership/farm changes).

## 2. Vai trò (Roles)

- **Doctor**: the primary author of Health Record content (via Domain 3
  Medical events).
- **Employee**: registers new Animals, updates non-medical identity
  details (e.g. a name change).
- **Customer**: the party who currently owns/is responsible for the
  Animal (Owner History tracks this over time).
- **AI**: a *reader* of the Animal's accumulated history (Open Host
  Service, per `26_DOMAIN_MODEL.md`'s Bounded Context Diagram) — never a
  direct author of it.

## 3. Đối tượng (Entities)

- **Animal** — the aggregate root itself: identity + current state only.
- Supporting concepts (**Livestock** / gia súc, **Poultry** / gia cầm,
  **Pet** / thú cưng) are not separate aggregates — they are a
  classification (species/`is_herd` flag) *of* the one `Animal` concept,
  per the same "one concept, several types" discipline BR-CUST-03 applies
  to Customer.

## 4. Business Rule

**BR-ANIM-01**: Every `Animal` must reference exactly one current owner
(`Customer`) at all times — an Animal with no owner is not a valid state
(even a farm-owned herd record has the farm-owning `Customer` as owner).

**BR-ANIM-02**: An `Animal`'s Identity (species, breed, name/code, herd
flag) is set at registration and may be corrected, but a correction is
itself a recorded fact (`AnimalIdentityCorrected`), never a silent
overwrite — misidentifying a species/breed has real medical
consequences (dosing, treatment protocol), so the correction history
itself matters.

**BR-ANIM-03**: A herd-representing `Animal` record (`is_herd = true`)
represents one generation/batch, not an ever-growing single record across
a farm's entire multi-year history — a new generation is a new `Animal`
record, linked to the same `Farm`. (This mirrors the existing
`12_SUPABASE_SCHEMA.md` design intent for herd records.)

**BR-ANIM-04**: The `Animal` aggregate itself stores **only** Identity +
current state (current owner id, current farm id if applicable, alive/
deceased/archived status). It does **not** store Health Record, Timeline,
Owner History, Farm History, or AI History as embedded fields — see
Section 6 below for why, and how those six requirements are still fully
satisfied.

**BR-ANIM-05**: `AnimalTransferredToNewOwner` and `AnimalMovedToFarm` are
always explicit, recorded events — an Animal's owner/farm reference is
never updated by any process that doesn't also emit the corresponding
event (this is what makes Owner History/Farm History possible as
projections at all).

**BR-ANIM-06**: An `Animal` marked `Deceased` can still receive new
Medical events for a limited set of purposes (e.g. a post-mortem
`LabTest` result arriving after death is recorded) but can never be
"un-deceased" except via an explicit, audited correction
(`AnimalIdentityCorrected`-style event) for genuine data-entry error.

**BR-ANIM-07**: Deleting an `Animal` is always soft-delete
(`deleted_at`); an Animal with any linked Medical event can never be
hard-deleted (same reasoning as BR-CUST-05).

**BR-ANIM-08**: Visibility of an Animal's full history follows the same
organization-hierarchy visibility model as everything else
(BR-XD-02) — a branch clinic sees Animals registered at or below its own
organization level, never a sibling branch's Animals, regardless of
species/type.

## 5. Life Cycle

See [`28_CRM_LIFECYCLE.md`](./28_CRM_LIFECYCLE.md) "Animal Lifecycle".

## 6. The core design decision: History as Projection, not as Field

This is the single most important DDD decision in the entire Sprint 2.0
domain model, so it is elaborated here in full rather than assumed.

**The naive (CRUD) approach** would be: give the `Animal` table/aggregate
a `health_record` JSON blob, a `timeline` array, an `owner_history` array,
a `farm_history` array, and an `ai_history` array, all growing forever
inside the one `Animal` row/object. This is exactly the shape the brief's
wording ("mỗi Animal phải có: Identity, Health Record, Timeline, Owner
History, Farm History, AI History") could be read to suggest if taken
literally as "fields the Animal has."

**Why that's wrong, in DDD terms**:
1. **Aggregate size discipline** — a core DDD best practice is that an
   aggregate should be as small as the invariants it must protect
   require. `Animal`'s only true invariants are identity-level (BR-ANIM-
   01/02/03) and current-state-level (alive/owner/farm *right now*).
   Nothing about "what happened in 2024" needs to be loaded, locked, or
   validated every time the `Animal` aggregate is touched for a new
   Encounter today.
2. **Write contention** — if History were embedded fields, *every*
   Treatment, every Vaccination, every AI conversation would need to
   acquire and rewrite the same `Animal` row/object, serializing all of
   an animal's activity through one contended write path for no business
   reason.
3. **It's already the right answer, and already approved** — Domain 8
   (Timeline) and the `events` table it maps onto were *already added to
   the architecture in Sprint 1 Revision specifically to be the system's
   history mechanism*. Re-inventing five more embedded history arrays
   inside `Animal` would duplicate a mechanism that already exists and
   contradict it (which history is authoritative, the embedded array or
   the events table?).

**The DDD answer**: each of the five required "History" views is a
**projection** — a read model computed by filtering/grouping the Domain
Event stream (Domain 8) by this Animal's id. Concretely:

| Required view | Derived by projecting these events (see `29_DOMAIN_EVENTS.md`) |
| --- | --- |
| **Identity** | `AnimalRegistered`, `AnimalIdentityCorrected` — actually IS aggregate state (BR-ANIM-04's one exception), since identity is exactly the invariant the aggregate protects |
| **Health Record** | All Domain 3 events for this animal id: `TreatmentStarted`/`AssessmentRecorded`/`CarePlanRecorded`/`TreatmentFinalized`, `PrescriptionIssued`/`Dispensed`, `VaccinationAdministered`, `LabTestOrdered`/`Resulted` |
| **Timeline** | Every event of every kind referencing this animal id, in chronological order — the strict superset of all the others |
| **Owner History** | `AnimalTransferredToNewOwner` events, in order — reconstructs "who owned this animal, when" |
| **Farm History** | `AnimalMovedToFarm` events, in order |
| **AI History** | `AIConversationStarted` / `AIRecommendationGenerated` / `AIMemoryRecorded` events scoped to this animal id |

Each is a genuine, fully-satisfying answer to "does every Animal have
X?" — yes, computably, from the event stream — without the `Animal`
aggregate itself growing without bound or becoming a write bottleneck.
This is also exactly consistent with BR-TL-03 ("a Timeline view is
always a read-only projection... never itself an independently-editable
source of truth").

**What this means for a future migration Sprint**: building this for
real does not require an `animal_history` table with growing JSON columns
— it requires the `events` table (already approved) plus, when query
performance eventually demands it, materialized/indexed projections
*derived from* that table (e.g. a `v_animal_timeline` view or a
denormalized read table kept in sync by triggers/jobs) — a standard
event-sourcing "read model" pattern, to be designed in that future
Sprint's own Architecture stage, not this one.

## 7. Relationship

`Animal` references exactly one current `Customer` (owner) and
optionally one `Farm`, both by id only. It is referenced by every Domain
3 (Medical) aggregate, by `AIConversation`/`AIMemory` (Domain 6) as
subject, and indirectly by Domain 4 (Commerce) through
`Prescription`/`Vaccination`'s product consumption.

## 8. Rủi ro (Risks)

- **Species/breed misidentification** carries real medical risk (dosing
  errors) — this is why BR-ANIM-02 treats identity correction as a
  first-class recorded event, not a quiet edit.
- **Herd-record granularity** (BR-ANIM-03) is a genuine open design
  question: exactly what triggers "new generation, new Animal record" vs.
  "same record, updated count" needs a concrete business rule from
  Founder/veterinary staff before a future migration Sprint can build it
  — flagged as a Founder-decision point.
- **Projection performance at scale**: a long-lived animal (or a busy
  farm) could accumulate a very large event history; the projection
  approach in Section 6 defers this to a future Sprint's technical design,
  but it is a real risk worth naming now so it isn't a surprise later.

## Khả năng mở rộng (Extensibility)

- Cross-species extensibility is already built in by not hardcoding
  species-specific fields onto the aggregate itself (species/breed are
  reference data, not schema).
- A future "digital passport" / exportable health record (e.g. for
  farm export/import compliance, or an owner switching to a different
  vet provider) is a natural additional projection over the same event
  stream — no change to the Animal aggregate itself would be required.
- Genetic/breeding-lineage tracking (parent/offspring relationships
  between Animal records) is not modeled in this Sprint — flagged as a
  possible future Domain 2 extension, not assumed here.

## File liên quan

- Domain model overview: [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md)
- Business rules index: [`27_BUSINESS_RULES.md`](./27_BUSINESS_RULES.md)
- Lifecycle diagram: [`28_CRM_LIFECYCLE.md`](./28_CRM_LIFECYCLE.md)
- Event catalog: [`29_DOMAIN_EVENTS.md`](./29_DOMAIN_EVENTS.md)
- Approved `events` table this projection design relies on: [`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md)
