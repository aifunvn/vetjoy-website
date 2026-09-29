# 37. CRM Readiness Assessment

> Answers this Sprint's "ĐÁNH GIÁ CRM" question: is the domain model
> ready to **chăm sóc khách hàng** (care for customers), **bán hàng**
> (sell), **chăm sóc sau bán** (after-sales care), **nhắc lịch**
> (remind), **tăng doanh thu** (grow revenue), and **giữ chân khách**
> (retain customers)? Assessed capability by capability.

## Summary verdict

| Capability | Ready? | Blocking gap |
| --- | --- | --- |
| Chăm sóc khách hàng | 🟡 Partially | No support ticket/case concept for non-medical issues |
| Bán hàng | 🟡 Partially | No B2B sales pipeline/opportunity concept |
| Chăm sóc sau bán | 🟡 Partially | No feedback/satisfaction concept |
| Nhắc lịch | 🟡 Partially | Automatic reminders in tension with BR-MED-09 |
| Tăng doanh thu | 🔴 Not yet | No campaign/promotion/loyalty concept |
| Giữ chân khách | 🔴 Not yet | No churn-risk concept; retention is reactive only |

## Chăm sóc khách hàng (Customer care)

**What's already there**: Domain 1 (Customer) + Domain 7
(Communication) + `AIConversation` (Domain 6) together cover ongoing
customer contact; `31_CUSTOMER_JOURNEY.md` walks the full lifecycle from
Lead through Active relationship.

**What's missing**:

🟡 **No support ticket/case concept.** Every non-medical customer-service
issue — a billing question, a delivery complaint, a general inquiry not
tied to a specific Animal — has nowhere to live in this model. Domain 4
covers Commerce transactions, Domain 3 covers clinical Encounters, Domain
7 covers message delivery, but none of them model "an open customer issue
being tracked to resolution," which is one of the most basic CRM
primitives. `AIConversation` gets closest but is scoped as an AI dialogue,
not a general case-tracking concept staff can also open directly. → See
FD-21.

## Bán hàng (Sales)

**What's already there**: Domain 4 (`SalesOrder`/`Invoice`/`Inventory`)
fully covers the transactional sale itself; Domain 1's Customer Lifecycle
covers Lead → Prospect → Active conversion.

**What's missing**:

🟡 **No sales pipeline/opportunity concept for B2B/dealer deals.** A
retail sale (an individual pet owner buying food) genuinely is just
"Lead → Customer → SalesOrder," but a large farm or dealer negotiating a
bulk supply contract over weeks is a fundamentally different sales
motion — one with stages (qualified, proposal sent, negotiating, won/
lost) that this model has no concept for. The Customer Lifecycle
(`28_CRM_LIFECYCLE.md`) treats the *Customer* as having one lifecycle,
not each *deal* as having its own — meaning a Customer already Active
from a past small purchase has nowhere to track a new, separate,
in-progress bulk negotiation. → See FD-22.

## Chăm sóc sau bán (After-sales)

**What's already there**: `Prescription`'s "course completed" state,
`Treatment`'s follow-up recommendation (BR-MED-09), and Notification's
delivery-confirmation loop all support operational after-sales
follow-through.

**What's missing**:

🟡 **No customer feedback/satisfaction concept.** Nothing in any of the 8
domains models asking a Customer how a Treatment, an Order, or an
interaction went, or recording their response. This is a standard
after-sales CRM function (CSAT/NPS-style feedback) entirely absent from
this design — it can't be assumed to exist implicitly since no aggregate,
event, or rule references it anywhere. → See FD-23.

## Nhắc lịch (Reminders)

**What's already there**: `Notification`'s full lifecycle
(`28_CRM_LIFECYCLE.md`) and BR-COMM rules provide a solid *delivery*
mechanism for reminders once a reminder is decided to be sent.

**What's missing**:

🟡 **BR-MED-09 may be blocking exactly the reminder automation a CRM
needs.** BR-MED-09 states follow-up scheduling "is always an explicit
action, never automatic" — a correct safeguard against AI or the system
silently booking real appointments without consent. But this Sprint's
brief explicitly wants strong "nhắc lịch" capability, and the most
valuable reminders in practice are routine, low-risk, and naturally
automatic (e.g., "annual vaccination due in 30 days," "prescription
refill due") — not clinical decisions at all. As currently worded,
BR-MED-09 doesn't distinguish "auto-creating a new Appointment" (which
should stay a human/Customer decision) from "auto-sending a reminder
notification about a known, already-established due-date" (which is a
much lower-risk automation this Sprint suspects Founder actually wants).
This is a real ambiguity worth resolving explicitly rather than assuming
either reading. → See FD-24.

🟡 **No protocol/schedule data to remind against**, as already flagged in
`35_BUSINESS_GAP.md` and `36_AI_READINESS.md` — without a defined
expected vaccination/care schedule, there is nothing for even a
correctly-scoped automatic reminder policy to trigger from.

## Tăng doanh thu (Increase revenue)

**What's already there**: `AIRecommendation` can surface reorder/cross-
sell suggestions (subject to human acceptance, BR-AI-01); Domain 5's
`Dealer` relationship supports channel-driven revenue.

**What's missing**:

🔴 **No campaign/promotion concept.** As already noted in
`34_DOMAIN_REVIEW.md` Section 4, `Notification` is modeled as one atomic
message through one channel — there is no "Campaign" (a coordinated,
scheduled, tracked set of messages to a segment of Customers) anywhere in
Domain 7 or elsewhere. Marketing-driven revenue growth — the most
directly obvious lever the "tăng doanh thu" goal implies — has no home in
this model today. → See FD-25.

🔴 **No loyalty/repeat-purchase incentive concept.** Nothing models a
rewards program, tiered pricing for repeat Customers, or any structured
incentive for retention-driven revenue — this is a gap, not an oversight
this Sprint can wave away, since revenue growth and retention (next
section) are named together in the brief for a reason.

## Giữ chân khách (Retention)

**What's already there**: Customer Lifecycle's Active/Inactive states
and `31_CUSTOMER_JOURNEY.md` Stage 5 acknowledge dormancy and
reactivation exist as concepts; Communication may run a "re-engagement
policy" per that document.

**What's missing**:

🔴 **Retention is entirely reactive, never predictive.** The model only
detects a Customer has *already* gone inactive (per a policy-defined
period with no elapsed-time threshold actually specified anywhere) — it
has no concept of an at-risk signal *before* a Customer goes quiet
(declining order frequency, a missed routine reminder, a recent
complaint). This ties directly to the "Dự đoán" gap in
`36_AI_READINESS.md` (no population-level pattern learning, no
protocol/schedule baseline to measure deviation against) — retention
in this model can only ever be "win back someone who already left,"
never "notice someone drifting and act early," which is the version of
retention that actually moves the needle. → See FD-26.

## File liên quan

- Domain review this feeds into: [`34_DOMAIN_REVIEW.md`](./34_DOMAIN_REVIEW.md)
- AI predictive gaps (shared root cause with retention): [`36_AI_READINESS.md`](./36_AI_READINESS.md)
- Customer journey under review: [`31_CUSTOMER_JOURNEY.md`](./31_CUSTOMER_JOURNEY.md)
- Communication domain under review: `26_DOMAIN_MODEL.md` Domain 7
- Consolidated decisions: [`39_FOUNDER_DECISIONS.md`](./39_FOUNDER_DECISIONS.md)
