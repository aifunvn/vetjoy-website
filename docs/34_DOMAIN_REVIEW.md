# 34. Domain Review — Sprint 2.1 Business Validation

> **Sprint 2.1 — Review Sprint, not a Design Sprint.** This document does
> **not** redesign anything from
> [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md) through
> [`33_VETJOY_CARE5_MAPPING.md`](./33_VETJOY_CARE5_MAPPING.md). Its only
> job is to find weaknesses, contradictions, gaps, and durability risks in
> that already-approved design, and hand them to Founder as decisions —
> not to fix them. Where a fix seems obvious, it is still left as a
> decision, not silently applied, per the explicit instruction for this
> Sprint ("Không thiết kế thêm. Không sửa Domain. Chỉ Review.").
>
> **The governing question asked of every finding below**: *"Nếu VETJOY
> hoạt động 10 năm nữa thì mô hình này có còn đúng không?"* — not "does
> this work today", but "does this survive a decade of real veterinary
> business growth without a rewrite."

> **📌 Ghi chú lịch sử — thêm 28/09/2026, sau khi Sprint 2.2 khoá Founder
> Decisions (không viết lại nội dung review gốc bên dưới):**
> - Thuật ngữ **"Doctor multi-org"** dùng trong tài liệu này (ví dụ ở
>   mục 2, 8, và bảng "10-year durability verdict") là thuật ngữ **lịch
>   sử tại thời điểm Sprint 2.1** — thời điểm đó Organization và Branch
>   chưa được tách biệt rõ ràng.
> - Nội dung này đã được **thay thế bởi FD-01** và
>   [`41_ARCHITECTURE_DECISIONS.md`](./41_ARCHITECTURE_DECISIONS.md)
>   **ADR-13**.
> - **Thiết kế hiện hành** là **Doctor multi-branch trong cùng một
>   Organization**, qua bảng liên kết `doctor_branch_assignments`.
> - **Organization và Branch là hai khái niệm khác nhau** (xem FD-02 /
>   ADR-14) — "multi-org" trong các mục Domain 1 (Customer/franchising)
>   của tài liệu này vẫn giữ đúng nghĩa gốc (nhiều Organization/tenant
>   thật sự) và không thuộc phạm vi ghi chú này.

## How to read this document

Each finding has a **severity** (🔴 High — blocks or actively
contradicts something already approved; 🟡 Medium — a real gap that will
bite eventually; 🟢 Low — worth noting, not urgent) and points to the
specific rule/aggregate/domain it concerns. Findings that require a
Founder decision are cross-referenced to
[`39_FOUNDER_DECISIONS.md`](./39_FOUNDER_DECISIONS.md) by ID.

---

## 1. Business Rule nào còn yếu (weak rules)

🔴 **BR-MED-03** ("Doctor must hold an active, non-revoked license at
time of encounter") has no defined verification mechanism. Nothing in
Domain 5 says *how* "active license" is checked — self-attested at
onboarding? Synced against a real external veterinary licensing
authority? Vietnam has no universal digital registry for this today. As
written, this rule is a business intention with no enforcement path —
weak until a verification source is named. → See FD-04.

🟡 **BR-COM-05** ("unpaid Invoice never blocks care") is a one-sided
rule — it protects the animal-welfare principle but has **no
counterbalancing business rule** about credit limits, collections
escalation, or bad-debt write-off thresholds. A rule that says "never
say no to care" without any paired rule for "how the business protects
itself financially" is incomplete, not just generous. → See FD-05.

🟡 **BR-AI-05** ("hand-off threshold is a policy decision") explicitly
defers the actual decision to configuration rather than stating it. As
written it isn't really a business rule yet — it's a placeholder that
says "a rule must exist here," which is honest but weak. It should not
be mistaken for actual coverage of the handoff behavior it names.

🟡 **BR-COMM-02** ("channel selection respects preference, never
hardcoded") has no defined default for a brand-new Customer who has not
yet stated a channel preference (which is every Customer at the moment
of `CustomerRegistered`). The rule correctly forbids hardcoding *forever*
but says nothing about the bootstrap case.

🟢 **BR-CUST-06** (visibility of personal contact data limited to org +
ancestors) says nothing about a **Dealer's** visibility into a
Customer's contact data, even though BR-CUST-04 gives Dealers a real
assigned relationship to Customers. A Dealer plausibly needs *some*
contact visibility to do their job, but the rule as written is silent —
neither granting nor explicitly denying it.

## 2. Rule nào mâu thuẫn (conflicting rules)

🔴 **BR-REL-05 directly contradicts the already-frozen Sprint 1.5
migration schema.** BR-REL-05 states "A Doctor may be associated with
more than one `Organization` (multi-clinic practice)." But
`supabase/migrations/20260801120000_organizations_foundation.sql` (line
158) defines `users.organization_id` as `not null references
organizations(id)` — **exactly one** organization per user, by design
(the migration's own comment at line 172-174 states role/permission
scoping is meant to happen *within* that one organization, not across
several). Since `Doctor` references exactly one `User` (BR-REL-01), and
that `User` can only ever belong to one `organization_id`, **a
multi-clinic Doctor is not representable in the schema this business
rule assumes exists.** This is not a future gap — it's a live
contradiction between an approved Sprint 2.0 business rule and an
already-frozen, cannot-be-edited (Governance Rule 1) migration. Fixing
it requires either (a) revising BR-REL-05 to match the one-org-per-user
reality, or (b) a *new* future migration introducing a many-to-many
Doctor↔Organization structure. Neither is this Sprint's call to make. →
See FD-01 (highest-priority finding in this entire review).

🟡 **BR-CUST-01 ("Customer belongs to exactly one Organization") vs.
Domain 1 §8's own stated extensibility need** ("multi-organization
franchising... a Customer could in principle belong to more than one
Organization"). `26_DOMAIN_MODEL.md` names this tension itself and defers
it ("deliberately not designed for yet") — this review promotes it from
a footnote to a tracked conflict, because BR-CUST-01 is written as an
unconditional rule ("must belong to exactly one"), not as "belongs to
exactly one *for now*." A future Sprint that wants real franchising
cannot get there without revising this rule, and today's rule gives no
signal that it's provisional. → See FD-02.

🟡 **Domain 8 (Timeline) is modeled as a Shared Kernel, not a peer
Bounded Context** (`26_DOMAIN_MODEL.md`'s own closing note), while the
Founder's original brief lists it as one of "8 Domains" alongside the
other seven. This isn't a technical bug, but it is a real framing
conflict: if Founder expects Timeline to have its own owner, its own
roadmap line, and its own "Domain-level" decisions the way Customer or
Medical does, the Shared-Kernel framing under-serves that expectation.
→ See FD-03.

🟡 **BR-MED-04 ("AI must never auto-generate a diagnosis/dosage") sits
in tension with Domain 6's own listed extensibility item** ("AI-assisted
LabTest result interpretation," `30_AI_DOMAIN.md` §8). "Interpreting a
lab result" and "suggesting a diagnosis" are not clearly distinguished
anywhere in this domain model — the line between the two is exactly
where BR-MED-04's protection could quietly erode in a future Sprint that
builds LabTest+AI features without re-reading this rule carefully. Not a
contradiction today (LabTest doesn't exist yet), but a foreseeable one.

## 3. Rule nào thiếu (missing rules)

🔴 **No rule governs Customer deduplication/matching.** Domain 1 §7
*names* duplicate-Customer risk (website lead vs. dealer-entered vs.
walk-in) but no Business Rule in `27_BUSINESS_RULES.md` actually requires
a matching check before a new `Customer` is created. A named risk with no
corresponding rule is a gap, not just a risk — it will silently produce
duplicate Customer records from day one of real usage. → See FD-06.

🔴 **No rule addresses joint/co-ownership of an Animal or a Farm.**
BR-ANIM-01 requires "exactly one current owner." Real veterinary
practice regularly has co-owned pets (couples, family farms with
multiple family members as legal co-owners) and farms with a manager
distinct from the legal owner. The model has no concept of a secondary
contact/co-owner/authorized-caretaker at all — everything routes through
one `Customer` as owner. → See FD-07.

🟡 **No data-subject deletion/export rule.** The model has soft-delete
(BR-CUST-05, BR-ANIM-07) for internal retention reasons, but nothing
addresses a Customer's own right to request their data be exported or
truly erased — relevant under Vietnam's Personal Data Protection Decree
(Nghị định 13/2023/NĐ-CP) and a real 10-year-horizon compliance concern
for a system holding phone numbers, addresses, and health data. → See
FD-08.

🟡 **No rule bounds `AIMemory` staleness/expiry.** `30_AI_DOMAIN.md` §7
names this as a risk but it never became an actual Business Rule in
`27_BUSINESS_RULES.md` — there is no BR-AI rule saying a verified memory
must be periodically re-confirmed or automatically expires after some
period. As-is, a memory verified once in year 1 is treated as
permanently reliable in year 10.

🟡 **No rule addresses what happens to a pending `AIRecommendation` or
open `AIConversation` when its target Customer/Animal is archived**
(BR-CUST-05/BR-ANIM-07). Nothing says these must be auto-resolved,
cancelled, or excluded from Timeline queries — a plausible source of
"zombie" recommendations pointing at archived subjects.

🟢 **No rule addresses reference-data correction cascade** — if a
`breed` or `species` reference entry is later found wrong/merged/split,
nothing governs how already-registered `Animal` records referencing the
old value are handled. Low urgency now (reference data doesn't exist as
real rows yet) but will matter once it does.

## 4. Rule nào khó mở rộng (rules that resist extension)

🔴 **BR-CUST-01** and **BR-ANIM-01** (both "exactly one X" cardinality
rules) are the two rules in the entire catalog most likely to require a
breaking change later: multi-org Customers (franchising, Domain 1 §8),
co-ownership (Section 3 above), and animal fostering/shelter custodianship
scenarios all need a cardinality this Sprint's rules don't allow. Any of
these becoming real business needs forces a *rule* rewrite, not just a
schema addition — worth Founder awareness now, even if none of these are
being requested yet.

🟡 **BR-COM-02** ("an Invoice always derives from exactly one
SalesOrder") does not accommodate consolidated/batch invoicing — a
common B2B/farm-customer need (one monthly invoice covering several
separate orders). Extending this later means either relaxing BR-COM-02
or introducing a new "Invoice batch" concept neither of which is free to
retrofit once real Invoice data exists.

🟡 **`Notification` is modeled as "one attempt to deliver one message
through one channel"** (Domain 7 §3) — an atomic, single-send model.
Extending Communication into anything resembling a marketing
sequence/drip campaign (a very ordinary CRM ask — "tăng doanh thu, giữ
chân khách" per this Sprint's own brief, see
[`37_CRM_READINESS.md`](./37_CRM_READINESS.md)) will require a new
"Campaign"-level concept this domain doesn't have room for today.

## 5. Aggregate nào quá lớn (aggregates at risk of growing unbounded)

🔴 **`AIConversation`'s "Message thread (Entities)" is modeled as
content living *inside* the aggregate** (`26_DOMAIN_MODEL.md`'s Aggregate
Design table), unlike `Animal`, which deliberately externalizes its
history to event projections specifically to avoid unbounded aggregate
growth (`32_ANIMAL_HEALTH_RECORD.md` §6). A long-running Customer
relationship could accumulate years of AI conversation messages inside
one aggregate — the exact write-contention and unbounded-growth problem
Section 6 of `32_ANIMAL_HEALTH_RECORD.md` already solved for `Animal` was
not applied consistently to `AIConversation`. This is an internal
inconsistency in the domain model's own stated discipline. → See FD-09.

🟢 `SalesOrder`/`PurchaseOrder`/`Prescription` line items are also
Entities-inside-aggregate, but these are naturally bounded (an order has
a finite, small number of lines) — no concern here, noted only for
contrast with the AIConversation finding above.

## 6. Aggregate nào nên tách (aggregates that should be split)

🟡 Following directly from Section 5: **`AIConversation` should apply the
same History-as-Projection discipline as `Animal`** — the aggregate
itself should hold only current conversation state (open/handed-off/
closed, participants), with the actual message thread modeled as a
projection over `AIMessageReceived`/`AIResponseGenerated` events, exactly
as Domain 2 already does for Health Record/Timeline. This is flagged as
a finding, not applied — the actual model change is out of scope for this
Review Sprint.

🟢 No other aggregate reviewed shows a comparable size risk at this
Sprint's level of detail — the general aggregate-boundary discipline in
`26_DOMAIN_MODEL.md` holds up well elsewhere.

## 7. Domain nào nên chia nhỏ (domains that should eventually split)

🟡 **Domain 4 (Commerce)** currently bundles three fairly distinct
concerns — customer-facing sales (`SalesOrder`/`Invoice`), supplier-facing
procurement (`PurchaseOrder`/`Supplier`), and `Inventory` sitting between
them. These have different stakeholders (Customer/Dealer vs. Supplier),
different external-system integration needs at scale (a future payment
gateway vs. a future accounting/ERP integration), and already show up as
separate concerns throughout `26`–`29`. Not urgent to split today (7
Business Rules currently cover all of it adequately), but worth flagging
as the most likely Domain to eventually need separation as transaction
volume grows.

🟢 **Domain 5 (Relationship)** bundles `Doctor`, `Employee`, `Dealer` —
already shown in Section 2 to need different cardinality rules from each
other (BR-REL-05 for Doctor only). Not recommended to split now (the
shared "wraps exactly one User" pattern still holds value), but the
Doctor-specific multi-org finding (FD-01) is itself early evidence this
Domain's "one size fits three roles" framing is under strain.

## 8. Context nào bị phụ thuộc quá nhiều (over-depended-upon contexts)

🟡 **Animal (Domain 2)** is a load-bearing dependency for Medical,
Commerce (indirectly, via Prescription/Vaccination product consumption),
AI, and Timeline — essentially the whole system assumes a correct,
available `Animal` aggregate. This concentration is intentional (Animal
is the stated Core differentiator), but it means any defect or design
gap in Domain 2 has the largest blast radius of any domain in this model
— worth naming explicitly as where the highest engineering/testing rigor
must go once this is built, not just where the most "business value" is.

🟡 **Identity & Access (Organization/User, Sprint 1.5)** is a Conformist
dependency for all 8 CRM domains simultaneously. This is expected for a
shared identity layer, but it also means the FD-01 finding above (Doctor
multi-org) isn't a Domain-5-only problem — it's a crack at the
foundation every other domain conforms to. Any future change to how
`users.organization_id` works ripples into all 8 domains' assumptions,
not just Relationship's.

🟢 **Timeline (Domain 8)** is written to by every domain and read from
(directly or via projection) by Animal, AI, and reporting use cases
generally. Already flagged as a volume/performance risk in
`26_DOMAIN_MODEL.md` Domain 8 §7 — this review adds: it is also a
*correctness* single point of failure, not just a performance one — if
event-emission (BR-TL-02) is ever incomplete for one domain, every
projection relying on Timeline (Animal History, AI context, future CRM
reporting) silently degrades without any obvious local symptom in the
domain that forgot to emit.

## 10-year durability verdict, per Domain

| Domain | Verdict | Why |
| --- | --- | --- |
| 1. Customer | 🟡 Cần điều chỉnh trước Sprint 3 nếu franchising được xác nhận là mục tiêu thật | BR-CUST-01 cardinality conflict (Section 2) |
| 2. Animal | 🟢 Vững, với 1 ngoại lệ | Co-ownership gap (Section 3) is real but narrow |
| 3. Medical | 🟢 Vững | LabTest gap already tracked (BR-MED-10); no new structural issue found |
| 4. Commerce | 🟡 Vững trong ngắn hạn, nên tách trong dài hạn | Section 7 — bundles Sales/Procurement/Inventory |
| 5. Relationship | 🔴 Cần quyết định trước khi build | FD-01 — Doctor multi-org contradicts frozen schema |
| 6. AI | 🟡 Vững về nguyên tắc, thiếu vài rule biên | Memory staleness, handoff threshold vagueness |
| 7. Communication | 🟡 Đủ cho nhắc lịch, chưa đủ cho tăng trưởng CRM | See `37_CRM_READINESS.md` for detail |
| 8. Timeline | 🟢 Vững về mặt nghiệp vụ, cần thiết kế kỹ thuật khi build | Volume/correctness concentration noted, not a business-rule defect |

## File liên quan

- Domain model under review: [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md)
- Business rules under review: [`27_BUSINESS_RULES.md`](./27_BUSINESS_RULES.md)
- Frozen schema this review checked rules against: `supabase/migrations/20260801120000_organizations_foundation.sql`
- Gap analyses this review feeds: [`35_BUSINESS_GAP.md`](./35_BUSINESS_GAP.md), [`36_AI_READINESS.md`](./36_AI_READINESS.md), [`37_CRM_READINESS.md`](./37_CRM_READINESS.md), [`38_FUTURE_ARCHITECTURE.md`](./38_FUTURE_ARCHITECTURE.md)
- Consolidated decisions: [`39_FOUNDER_DECISIONS.md`](./39_FOUNDER_DECISIONS.md)
