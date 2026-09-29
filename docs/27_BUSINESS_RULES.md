# 27. Business Rules Catalog

> Consolidated, numbered business rules for all 8 CRM domains defined in
> [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md). These are **business**
> rules — statements that must hold true regardless of which database,
> UI, or API ever implements them — not database constraints. Where a
> rule already has a concrete enforcement mechanism approved in an
> earlier Sprint (RLS policy, trigger, check constraint), that mapping is
> noted for traceability, but the rule itself is defined independently of
> that mechanism.
>
> Rule IDs are stable once written — a future Sprint that changes a
> rule's behavior adds a new rule or revises this entry with a dated
> note, it does not silently renumber (the same immutability discipline
> as migrations, applied to business documentation).

## How to read this catalog

Each rule has: an **ID**, the **statement**, the **rationale** (why this
rule exists — often the part most likely to be forgotten and
re-litigated later), and where applicable, **enforcement** (how it's
technically guaranteed once built).

## Domain 1 — Customer

**BR-CUST-01**: A `Customer` must belong to exactly one `Organization` at
a time.
*Rationale*: multi-tenancy isolation, established in Sprint 1 Revision.
*Enforcement*: `organization_id` NOT NULL + RLS, per `12_SUPABASE_SCHEMA.md`.

**BR-CUST-02**: When a `Customer` originates from a website `Lead`, the
link back to that `Lead` must be preserved permanently, even after the
Lead is "converted".
*Rationale*: without this, marketing/acquisition-channel (UTM)
attribution captured on the website (per `02_ARCHITECTURE.md`) is lost
the moment a Lead becomes a real Customer — the two systems (website
lead capture, CRM) must stay joinable.

**BR-CUST-03**: A `Customer`'s `CustomerType` (individual owner, farm
business, dealer, clinic) determines which optional profile fields are
required, but never changes what `Customer` fundamentally *is* — there is
one `Customer` concept, not four separate ones.
*Rationale*: this is the DDD choice that keeps Domain 1 a single Bounded
Context instead of four; see `26_DOMAIN_MODEL.md` Domain 1 §3.

**BR-CUST-04**: A `Customer` may have at most one currently-assigned
`Dealer` at any point in time; reassignment is a tracked event
(`CustomerReassignedToDealer`), never a silent overwrite.
*Rationale*: dealer commission/attribution requires knowing not just
*who* the current dealer is but *when* the assignment changed.

**BR-CUST-05**: Deleting a `Customer` is always a soft-delete
(`deleted_at`); a Customer with any linked `Animal`, `Treatment`, or
`Invoice` can never be hard-deleted.
*Rationale*: medical/financial history must outlive the customer
relationship for legal and continuity-of-care reasons — this is the
business justification for the `deleted_at` standard column convention
in `12_SUPABASE_SCHEMA.md`.

**BR-CUST-06**: Personal contact data (phone, address) is visible only to
staff within the Customer's own `Organization` and its ancestor
organizations (per the hierarchical visibility model in Sprint 1.5) —
never to sibling organizations, never to other Customers.
*Rationale*: baseline privacy expectation, consistent with the consent
language already used in the website's own lead-capture forms.

## Domain 2 — Animal

See [`32_ANIMAL_HEALTH_RECORD.md`](./32_ANIMAL_HEALTH_RECORD.md) for the
full **BR-ANIM-01 through BR-ANIM-08** set (Animal identity uniqueness,
required current-owner reference, herd vs. individual handling, and the
core rule that Health Record/Timeline/History are always derived, never
directly writable).

## Domain 3 — Medical

**BR-MED-01**: Every `Treatment`, `Prescription`, `Vaccination`, and
`LabTest` must reference exactly one `Animal`. There is no such thing as
a medical record not tied to a specific animal.
*Rationale*: animal-centric design mandate from Sprint 1 Revision,
generalized here to the newly-identified `LabTest` concept.

**BR-MED-02**: A `Prescription` can only be created as part of, or
immediately following, a `Treatment` (Encounter) — never standalone.
*Rationale*: prevents prescriptions without a documented clinical
justification, a basic veterinary/legal safeguard already implied by
the "no fabricated dosages" rule from the original Phase 1 brief.

**BR-MED-03**: A `Doctor` performing a `Treatment`/`Prescription`/
`Vaccination`/`LabTest` must hold an active (non-revoked) license at the
time of the encounter.
*Rationale*: legal/regulatory necessity for veterinary practice.

**BR-MED-04**: The system must never auto-generate or suggest a specific
dosage, diagnosis, or treatment plan without an explicit Doctor
confirmation step.
*Rationale*: carried forward unchanged from the Phase 1 master prompt's
explicit prohibition on fabricated medical content; this is the single
most important rule in the entire domain model and applies with equal
force to any future AI-assisted authoring tool.

**BR-MED-05**: A `Vaccination` record must capture what was administered
(`Product` reference) and by whom (`Doctor`), and once recorded is
immutable except for a documented, timestamped correction (never a silent
edit).
*Rationale*: vaccination history has downstream legal/regulatory
significance (e.g. rabies certification) — it must be as tamper-evident
as `audit_logs`.

**BR-MED-06**: An `Appointment` can be cancelled or rescheduled, but once
a `Treatment` has been recorded against it, the Appointment's existence
can never be deleted (it becomes part of the Animal's permanent Timeline).

**BR-MED-07**: A `LabTest` order and its eventual result are two distinct
lifecycle events (`LabTestOrdered`, `LabTestResulted`) — a LabTest can
exist in an "ordered, pending result" state indefinitely; this is not an
error state.
*Rationale*: real-world lab turnaround time; the domain must represent
"we're waiting" as a valid, first-class state, not the absence of data.

**BR-MED-08**: Any Medical record's content must never be altered to
match a Commerce outcome (e.g. never adjust a diagnosis to justify a sale)
— Domain 3 is causally upstream of Domain 4, never the reverse.
*Rationale*: the ethical/business-integrity boundary explicitly called
out in Domain 4 §4's highlight (BR-COM-05) — restated here from Medical's
side for completeness.

**BR-MED-09**: A `Treatment`'s Care Plan (Giải pháp) may recommend a
follow-up `Appointment`, but creating that follow-up is always an
explicit action, never automatic — a Doctor or the Customer must confirm
it.

**BR-MED-10**: `LabTest` is a **new domain concept identified during
Sprint 2.0** with no corresponding table in the Sprint 1/1.5 approved
schema. No Medical rule referencing `LabTest` may be implemented until a
dedicated future Sprint completes Architecture → ... → Production for it
per `21_GOVERNANCE.md`.
*Rationale*: flags this explicitly as a gap rather than letting it be
silently assumed available — a required Founder-decision point (see
Sprint 2.0 final report).

## Domain 4 — Commerce

**BR-COM-01**: A `SalesOrder` must belong to exactly one `Customer` and
optionally one `Dealer` (the facilitating relationship, not a tenant
boundary — see BR-REL-03).

**BR-COM-02**: An `Invoice` always derives from exactly one `SalesOrder`;
there is no such thing as an Invoice without an underlying Order.

**BR-COM-03**: `Inventory` stock levels are decremented only through
recorded events (`ProductSold`, `ProductAdministeredInVaccination`,
`ProductDispensedInPrescription`) — never edited directly to "fix" a
number without a corresponding event explaining why.
*Rationale*: without this, stock discrepancies become unauditable; this
is Commerce's equivalent of `audit_logs` append-only-ness applied to
inventory logic specifically.

**BR-COM-04**: A `PurchaseOrder` to a `Supplier` and a `SalesOrder` to a
`Customer` are always distinct aggregates — inbound and outbound
commerce are never merged into one "Order" concept, even though they
share line-item structure superficially.
*Rationale*: their lifecycles, approval rules, and counterparties differ
enough that merging them would violate the aggregate-boundary discipline
established in `26_DOMAIN_MODEL.md`'s Aggregate Design section.

**BR-COM-05**: An unpaid or overdue `Invoice` must never block the
creation of a `Treatment`, `Prescription`, or `Vaccination` for the
associated Customer's Animal.
*Rationale*: explicit ethical/business decision — VETJOY does not
withhold animal care over billing status. (Highlighted in
`26_DOMAIN_MODEL.md` Domain 4 §4.)

**BR-COM-06**: `Inventory` is owned exclusively by Domain 4; Domain 3
(Medical) may only *read* stock availability and *emit* consumption
events — it never directly writes to `Inventory`.
*Rationale*: single source of truth, avoids the two domains racing to
update the same stock number from different code paths.

**BR-COM-07**: A `Product`'s price shown to a `Customer` at order time is
captured as a value on the `SalesOrder` line item itself (a historical
snapshot), not merely a live reference to the current catalog price.
*Rationale*: catalog prices change over time; an Invoice must reflect
what was actually charged, not be silently recalculated if the catalog
price later changes.

## Domain 5 — Relationship

**BR-REL-01**: `Doctor`, `Employee`, and `Dealer` each reference exactly
one `User` (Identity & Access) — none of them re-implements
authentication or its own notion of identity.

**BR-REL-02**: A `Doctor`'s public-facing profile (name, specialties, bio
— shown on the website per `06_CONTENT_GUIDE.md`) is a distinct,
separately-visible subset of their full internal record (which includes
`license_no` and is never public).

**BR-REL-03**: A `Dealer` relationship is commercial (which Customers a
Dealer is credited with, what commission applies) and is never used as a
data-visibility or tenant boundary. Tenant boundaries are exclusively
`organizations`, per the Sprint 1 Revision architectural decision.
*Rationale*: this was an explicit correction made in Sprint 1 Revision
after the initial Sprint 1 draft conflated the two — restated here at the
business-rule level so it can never quietly regress in a future Sprint.

**BR-REL-04**: An `Employee`'s access to Customer/Animal/Medical data is
governed entirely by their `Role`/`Permission` assignment (Identity &
Access, Sprint 1) and their `Organization` membership — not by which
specific Customers or Animals they have personally worked with.

**BR-REL-05**: A `Doctor` may be associated with more than one
`Organization` (multi-clinic practice) — Domain 5 must not assume
exactly-one-organization-per-Doctor even though `Customer` (BR-CUST-01)
does.
*Rationale*: veterinary staffing reality (visiting/covering doctors) —
called out explicitly so a future Sprint doesn't copy BR-CUST-01's
single-organization assumption onto Doctor by mistake.

## Domain 6 — AI

See [`30_AI_DOMAIN.md`](./30_AI_DOMAIN.md) for the full **BR-AI-01
through BR-AI-07** set — most importantly the rule that no
`AIRecommendation` or `AIMemory` entry is treated as authoritative fact
until explicitly confirmed by a human (Doctor for medical content,
Employee/Customer for non-medical content).

## Domain 7 — Communication

**BR-COMM-01**: A `Notification` always originates from a Domain Event
produced by another domain — Communication never decides *what* to say on
its own initiative, only *how/when* to deliver a message another domain
already composed or triggered.

**BR-COMM-02**: Channel selection (Zalo vs. SMS vs. email vs. call) is
governed by the recipient's own channel preference/consent and a
documented fallback order, never hardcoded per event type.
*Rationale*: highlighted in `26_DOMAIN_MODEL.md` Domain 7 §4 — avoids a
future situation where, e.g., "appointment reminders always go by SMS"
gets hardcoded and can't respect a Customer who opted out of SMS.

**BR-COMM-03**: A failed delivery attempt is recorded as its own fact
(`NotificationDeliveryFailed`) and may trigger a fallback-channel retry,
but never silently disappears.

**BR-COMM-04**: Consent to be contacted through a given channel is
tracked per Customer per channel, mirroring the consent-capture pattern
already established on the website's lead forms (`ContactForm`,
`ConsultationForm`, `DealerForm`) — Communication must never contact
someone through a channel they did not consent to.

## Domain 8 — Timeline

**BR-TL-01**: Every `DomainEvent`, once recorded, is immutable and
append-only forever. No process — including a super_admin — may edit or
delete a recorded event.
*Rationale*: this is the business articulation of the `audit_logs`
append-only trigger already built in Sprint 1.5
(`prevent_audit_logs_mutation`) — the Timeline domain generalizes that
same guarantee to the whole system's event stream, not just audit
entries.

**BR-TL-02**: Every other domain's aggregate root must publish a
Domain Event for every state transition that another domain, a human, or
AI might need to know happened — silence (a state change with no
corresponding event) is treated as a design defect in that domain, not
an acceptable shortcut.

**BR-TL-03**: A Timeline view (e.g. "this Animal's full history") is
always a read-only projection computed from the event stream — it is
never itself a separate, independently-editable source of truth.
*Rationale*: this is the rule that makes the "Health Record/Timeline/
Owner History/Farm History/AI History" requirement for Domain 2
achievable without duplicating data — see
`32_ANIMAL_HEALTH_RECORD.md`.

## Cross-domain rules

**BR-XD-01**: No domain may reach into another domain's aggregate and
mutate it directly — all cross-domain effects happen through Domain
Events (Domain 8) or explicit, intentional service calls at a Bounded
Context boundary (see the Context Mapping relationships in
`26_DOMAIN_MODEL.md`'s Bounded Context Diagram).
*Rationale*: this is the rule that keeps the 8 Domains actually
independent Bounded Contexts rather than one large, tangled data model —
the single most important structural rule in this entire catalog.

**BR-XD-02**: Every business-meaningful fact recorded anywhere in the
system must ultimately be traceable to a specific `Organization`
(directly, or through its parent aggregate), per the multi-tenancy
architecture established in Sprint 1 Revision — global reference data
(species/breeds/provinces, per `12_SUPABASE_SCHEMA.md`) is the only
exception.

**BR-XD-03**: Nothing in this business rule catalog authorizes writing
any SQL, migration, or source code. Turning any rule above into an actual
constraint/trigger/RLS policy requires its own future Sprint through the
full 8-stage pipeline in `21_GOVERNANCE.md` — this document is Architecture-
stage input for those future Sprints, not itself an implementation.

## File liên quan

- Domain model these rules elaborate: [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md)
- Lifecycle these rules constrain: [`28_CRM_LIFECYCLE.md`](./28_CRM_LIFECYCLE.md)
- Events these rules reference: [`29_DOMAIN_EVENTS.md`](./29_DOMAIN_EVENTS.md)
- Governance for turning any rule here into real schema: [`21_GOVERNANCE.md`](./21_GOVERNANCE.md)
