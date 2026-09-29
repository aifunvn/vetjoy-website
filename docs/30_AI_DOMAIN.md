# 30. AI Domain — Deep Dive

> Detailed elaboration of Domain 6 (AI) from
> [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md), classified there as
> **Core (strategic)** — this is where VETJOY's stated differentiator
> ("AI hiểu từng con vật cụ thể, không phải chatbot chung chung") either
> becomes real or doesn't. Written purely in business terms; no model
> provider, prompt-engineering technique, or vendor choice is implied.

## 1. Mục tiêu (Purpose)

Give every Customer, Doctor, and Employee an AI assistant that
understands the **specific** Customer/Animal it's talking about — its
species, history, past treatments, prior conversations — well enough to
provide genuinely useful triage, education, and operational support,
while never being the final authority on anything medical or financial.
The purpose is *augmentation* of VETJOY's human expertise (the "VETJOY
CARE 5" methodology), not replacement of it.

## 2. Vai trò (Roles)

- **Customer**: converses with AI for triage ("con chó của tôi bị..."),
  general care questions, order status.
- **Doctor**: reviews AI-surfaced context before an Encounter (Domain 3);
  accepts/rejects `AIRecommendation`s; verifies `AIMemory` entries with
  medical content.
- **Employee**: reviews non-medical `AIRecommendation`s (e.g. reorder
  suggestions); handles conversations an AI hands off.
- **AI itself**: not a "role" in the access-control sense — the AI has no
  account, no permissions, and no authority independent of the humans who
  configure and review it. This is a deliberate framing choice: modeling
  "AI" as a peer role alongside Doctor/Employee would imply it can act
  autonomously, which BR-AI-01 (below) explicitly forbids.

## 3. Đối tượng (Entities)

- **AIConversation** — one ongoing dialogue with a Customer or staff
  member, scoped to a specific Animal/Customer context where applicable.
- **AIRecommendation** — one proposed action (a care suggestion, a
  reorder suggestion, a draft response) awaiting human review.
- **AIMemory** — one durable, subject-scoped fact the AI has learned
  across conversations (e.g. "this Customer's dog has a known allergy to
  X" — non-medical example: "this Customer prefers Zalo over phone
  calls").
- **PromptTemplate** — a versioned, staff-authored template governing how
  the AI is instructed to behave in a given situation (e.g. the triage
  template, the reorder-suggestion template).
- **AITrainingExample** (referenced from Sprint 1 Revision's
  `ai_training_data` table) — a curated example used to improve future AI
  behavior; deliberately *not* modeled as its own Bounded Context concept
  here since it is an input to an external training/fine-tuning process,
  not something the CRM domain acts on directly.

## 4. Business Rule

Full numbered set (cross-referenced from
[`27_BUSINESS_RULES.md`](./27_BUSINESS_RULES.md)):

**BR-AI-01**: No `AIRecommendation` is ever automatically applied to a
Medical or Commerce aggregate. A human must explicitly accept it first
(the Anti-Corruption Layer pattern from `26_DOMAIN_MODEL.md`'s Bounded
Context Diagram, made concrete in the Event Storming diagram in
`29_DOMAIN_EVENTS.md`).

**BR-AI-02**: No `AIMemory` entry is treated as verified fact until a
human explicitly confirms it (`is_verified = true`); unverified memories
may inform an AI's *tone/approach* in conversation but must never be
presented to a human as if already confirmed.

**BR-AI-03**: An `AIRecommendation` or `AIConversation` response
concerning medical content (diagnosis, dosage, treatment) must always be
framed as a suggestion for a licensed Doctor to review — never delivered
to a Customer as if it were a diagnosis. This is the direct continuation
of the Phase 1 master prompt's "AI không tự bịa / không tự chẩn đoán"
requirement into the CRM domain.

**BR-AI-04**: A `PromptTemplate` change is a staff/Founder decision,
versioned, and auditable — never silently modified by the AI system
itself based on conversation outcomes.

**BR-AI-05**: An `AIConversation` must be handed off to a human whenever
it involves content BR-AI-03 covers, whenever the Customer explicitly
asks for a human, or whenever the AI's own confidence in handling the
topic is low — the hand-off threshold is a policy decision
(`PromptTemplate`-governed), but the *existence* of a hand-off path is
mandatory, not optional.

**BR-AI-06**: `AITrainingExample` curation must exclude any example
containing unverified or fabricated medical content — training data
quality directly inherits BR-AI-03's constraint, since bad training
examples become tomorrow's bad recommendations.

**BR-AI-07**: All AI domain data (conversations, memories, recommendations)
is scoped to an `Organization` like any other business data (BR-XD-02) —
an AI never has cross-organization visibility a human staff member
wouldn't also have.

## 5. Life Cycle

See [`28_CRM_LIFECYCLE.md`](./28_CRM_LIFECYCLE.md) "AIConversation
Lifecycle", "AIRecommendation Lifecycle", "AIMemory Lifecycle".

## 6. Relationship

- `AIConversation` references the `Customer`/`Animal` it concerns (Open
  Host Service into Domain 1/2 — reads, never writes).
- `AIRecommendation` references its source `AIConversation` and its
  target aggregate (a `Treatment` suggestion targets Domain 3; a reorder
  suggestion targets Domain 4).
- `AIMemory` references its subject (`Customer` or `Animal`) and,
  optionally, the `AIConversation` it was learned from.
- `PromptTemplate` has no aggregate references — it's pure configuration.
- Domain 8 (Timeline) records every AI event, meaning an Animal's full
  Timeline includes what AI has observed and suggested about it — this is
  precisely what makes "AI hiểu từng con vật cụ thể" achievable: the AI's
  own context-gathering *is* reading the same Timeline projection a
  Doctor would.

## 7. Rủi ro (Risks)

- **Over-trust risk**: the single biggest risk in this entire domain
  model. If BR-AI-01/02/03 are ever weakened "for convenience" (e.g. "just
  auto-send this reminder text the AI drafted" seems harmless until the
  draft contains a subtly wrong claim), the Anti-Corruption Layer erodes
  and the domain stops being safe. Any future Sprint touching this domain
  must treat these three rules as close to inviolable as BR-TL-01
  (event immutability).
- **Memory staleness**: an `AIMemory` fact that was true when recorded
  (e.g. "prefers Zalo") may become false later; BR-AI needs a
  policy for re-verification or expiry that this Sprint has not fully
  designed — flagged as a Founder-decision point.
- **Training data provenance**: `AITrainingExample` quality is only as
  good as BR-AI-06's enforcement; this is a process risk (curation
  discipline) more than a technical one.
- **Vendor/model dependency**: not a domain-model risk per se, but worth
  naming — this document deliberately says nothing about which AI
  provider/model VETJOY uses, so that choice can change without
  invalidating this business design.

## 8. Khả năng mở rộng (Extensibility)

- Multiple `PromptTemplate`s per situation (A/B variations) — the model
  already supports this since PromptTemplate is a standalone, versioned
  aggregate, not embedded logic.
- AI-assisted `LabTest` result interpretation once that domain concept
  is actually built (BR-MED-10) — a natural extension once the
  underlying Medical concept exists.
- Proactive AI outreach (AI-initiated `AIConversation`, e.g. a vaccination
  due-date reminder) — currently all conversations are Customer- or
  event-triggered; proactive initiation would need its own BR-AI rule
  about consent and frequency limits before being built.
- Multi-language support (VETJOY's current scope is Vietnamese-only,
  per the original Phase 1 brief) — the domain model itself doesn't
  preclude this, it's a `PromptTemplate`/localization concern layered on
  top.

## File liên quan

- Domain overview: [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md)
- Business rules: [`27_BUSINESS_RULES.md`](./27_BUSINESS_RULES.md)
- Event catalog: [`29_DOMAIN_EVENTS.md`](./29_DOMAIN_EVENTS.md)
- Approved AI tables (Sprint 1 Revision): [`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md), [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md)
- Original "no fabricated content" mandate: `06_CONTENT_GUIDE.md`
