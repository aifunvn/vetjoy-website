# 31. Customer Journey

> End-to-end narrative of how each VETJOY persona moves from first
> contact through to an active, ongoing CRM relationship — the business
> story that Domains 1 (Customer), 2 (Animal), 3 (Medical), and 7
> (Communication) exist to support. Written narratively; each step notes
> which Domain Event from
> [`29_DOMAIN_EVENTS.md`](./29_DOMAIN_EVENTS.md) it corresponds to.

## Personas (carried forward from Phase 1 brand/IA work)

- **Chủ thú cưng** (individual pet owner)
- **Chủ trang trại** (livestock/poultry farm owner)
- **Doanh nghiệp/Đại lý** (business or distribution partner)
- **Phòng khám đối tác** (partner clinic — forward-looking, not yet
  active in Phase 1/2 scope)

## Stage 0 — Awareness (website, pre-CRM)

A prospective Customer finds VETJOY through the website (`/`, `/kien-thuc`,
`/giai-phap`, `/san-pham`) — this stage is entirely outside the CRM
domain model; it's covered by the existing Phase 1 site architecture
(`01_PROJECT_OVERVIEW.md`, `02_ARCHITECTURE.md`).

## Stage 1 — Lead capture (website → CRM boundary)

The prospect submits one of the three existing forms
(`ConsultationForm`, `DealerForm`, `ContactForm`), captured with UTM
attribution as already implemented in `src/lib/utm.ts` (see `02_ARCHITECTURE.md`).

**Event**: `LeadCaptured` — this is the seam where the already-built
website (Phase 1) and the not-yet-built CRM (Phase 2) meet. Everything
before this event is outside this domain model; everything from here on
is inside it.

## Stage 2 — First contact and qualification

Staff (Employee or Doctor, Domain 5) reviews the Lead and makes first
contact. If the Lead is a genuine prospect (not spam, has a real
animal/business need), staff qualifies them.

**No new event yet** — a Lead remains a Lead (not yet a `Customer`
aggregate) through qualification, per the Customer Lifecycle diagram in
`28_CRM_LIFECYCLE.md` ("Lead → Prospect").

## Stage 3 — Conversion to Customer

The moment the prospect's first real business fact is recorded — an
Animal is registered, a Farm is registered, or a first Order is placed —
the Lead converts into a full `Customer` aggregate, permanently linked
back to its origin (BR-CUST-02).

**Event**: `CustomerRegistered`, immediately followed (for pet/livestock
personas) by `AnimalRegistered` or `FarmRegistered`.

### Persona-specific detail at this stage

- **Chủ thú cưng**: registers one or more individual `Animal`s
  (`is_herd = false`). The journey from here centers almost entirely on
  Domain 3 (Medical) — Appointments, Treatments, Vaccinations for that
  specific pet.
- **Chủ trang trại**: registers a `Farm`, then one or more `Animal`
  records representing herd generations (`is_herd = true`). The journey
  emphasizes Domain 2's Farm History projection and bulk Medical events
  (e.g. a vaccination round applied to a herd record) more than
  individual-animal narrative.
- **Doanh nghiệp/Đại lý**: registers as a `Customer` of type `dealer`
  (Domain 1) *and* is separately onboarded into Domain 5 as a `Dealer`
  aggregate if they will also represent VETJOY to other Customers — these
  are two different facts about the same person/business, not a
  contradiction (see `26_DOMAIN_MODEL.md` Domain 5 note on
  `Dealer` referencing exactly one `User`).

## Stage 4 — Active relationship (the ongoing loop)

This is where VETJOY CARE 5 actually runs, repeatedly, for as long as the
Customer relationship is active:

1. **Ghi nhận** (record) — an Appointment/Treatment begins
   (`TreatmentStarted`).
2. **Đánh giá** (assess) — `AssessmentRecorded`.
3. **Giải pháp** (solution) — `CarePlanRecorded`, often triggering a
   `Prescription`/`Vaccination` and a `Notification` back to the
   Customer.
4. **Theo dõi** (follow up) — a subsequent `Appointment` is scheduled;
   Communication sends reminders.
5. **Chăm sóc tiếp** (continued care) — the cycle repeats for the same
   Animal, building up its Timeline (Domain 8) with every pass.

See [`33_VETJOY_CARE5_MAPPING.md`](./33_VETJOY_CARE5_MAPPING.md) for the
full aggregate/command/event mapping of this loop.

Concurrently, Domain 4 (Commerce) runs its own independent loop
(`SalesOrderCreated` → ... → `InvoiceIssued` → `PaymentRecorded`) — related
to, but never gating, the Medical loop (BR-COM-05).

And Domain 6 (AI) observes this entire loop passively (Open Host Service
into the Timeline), occasionally surfacing `AIRecommendation`s (e.g. "a
vaccination is due soon") that a human must accept before they become
real actions (BR-AI-01).

## Stage 5 — Dormancy and reactivation

If no activity is recorded for a policy-defined period, the `Customer`
(and typically its `Animal`s) move to `Inactive` (per
`28_CRM_LIFECYCLE.md`). Communication (Domain 7) may run a
re-engagement policy here — but this is explicitly a *policy* trigger
(purple, in Event Storming terms), not a state that blocks anything; a
Customer can always come back into `Active` the moment a new
Appointment/Order is recorded.

## Stage 6 — Archival

Eventually a Customer relationship may end (business closes, pet
deceased with no other animals, explicit request). Per BR-CUST-05, this
is always `CustomerArchived` (soft-delete) — the full Medical/Commerce
history remains intact and queryable (for legal/continuity reasons)
even though the relationship itself is no longer active.

## Cross-persona note: the Farm-as-intermediary case

A `Farm` (Domain 1) sits between a `Customer` and potentially many
`Animal` herd records (Domain 2) — this means the "Customer Journey" for
a `Chủ trang trại` persona is really two nested journeys: the Farm's own
lifecycle (`28_CRM_LIFECYCLE.md` "Farm Lifecycle") and each Animal/herd
record's lifecycle within it. A future UI (out of scope for this Sprint)
would need to represent both levels — this document flags that as a
design input for whichever future Sprint designs that UI, not something
this business-analysis Sprint resolves.

## File liên quan

- Domain model: [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md)
- Business rules referenced: [`27_BUSINESS_RULES.md`](./27_BUSINESS_RULES.md)
- Lifecycles referenced: [`28_CRM_LIFECYCLE.md`](./28_CRM_LIFECYCLE.md)
- Events referenced: [`29_DOMAIN_EVENTS.md`](./29_DOMAIN_EVENTS.md)
- VETJOY CARE 5 detail: [`33_VETJOY_CARE5_MAPPING.md`](./33_VETJOY_CARE5_MAPPING.md)
- Original persona/IA definitions: `01_PROJECT_OVERVIEW.md`, `02_ARCHITECTURE.md`
