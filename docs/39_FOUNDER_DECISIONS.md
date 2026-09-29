# 39. Founder Decisions Required (Sprint 2.1)

> Every decision below came out of the review in
> [`34_DOMAIN_REVIEW.md`](./34_DOMAIN_REVIEW.md) through
> [`38_FUTURE_ARCHITECTURE.md`](./38_FUTURE_ARCHITECTURE.md). This list
> is filtered to **business decisions only** — questions only Founder
> can answer because they're about what VETJOY *is* and *will do*, not
> how something gets built. Purely technical findings from those
> documents (e.g., how one AI aggregate should be internally structured)
> are intentionally left out of this list — they're engineering
> decisions for whichever future Sprint builds that piece, not Founder
> decisions.
>
> For each item: **what to decide**, **why it matters**, and **what
> happens if it's left undecided** (so silence has a known, safe
> default rather than an ambiguous one).

## Group A — Conflicts with the already-frozen Sprint 1.5 schema

**FD-01. Do doctors need to work across more than one clinic/branch at
the same time?**
The domain model assumes yes (a Doctor can belong to several branches).
The database schema already approved and frozen in Sprint 1.5 assumes
no (one person belongs to exactly one branch). These two cannot both be
true as currently written. *If undecided*: treat every Doctor as
single-branch only until Founder says otherwise — this matches what's
actually been built so far.

**FD-02. Will VETJOY ever franchise or operate as a platform for
multiple separate veterinary businesses, where one Customer might belong
to more than one business at once?**
Today's design assumes a Customer belongs to exactly one VETJOY branch/
business, permanently. Franchising later would require changing that
assumption. *If undecided*: continue assuming one Customer belongs to
exactly one business — the current, simpler, safer default.

**FD-03. Should "Timeline" (the full history of everything that happens
in the system) be treated as its own owned product area with its own
roadmap — or purely as shared plumbing every other area relies on?**
This affects how Sprint 3+ work gets planned and who's responsible for
its quality. *If undecided*: treat it as shared plumbing (the current
assumption) — no dedicated roadmap line for it.

## Group B — Legal, compliance, and food-safety exposure

**FD-04. How will VETJOY verify a doctor's veterinary license is
genuinely active before they're allowed to treat animals in the
system?**
Self-declared? Checked against a government registry? Something else?
This has real legal weight once real prescriptions/treatments are
recorded. *If undecided*: license status will be self-declared/staff-
entered with no independent verification — a real but currently
accepted risk.

**FD-05. For unpaid bills, what actually happens?**
The model already guarantees an unpaid bill never blocks care for an
animal (an intentional, kept decision) — but there's no matching policy
yet for how VETJOY protects itself financially (credit limits, when to
escalate collections, when to write off bad debt). *If undecided*: no
collections policy exists — unpaid balances accumulate with no defined
process.

**FD-06. Does VETJOY need drug withdrawal-period tracking** — knowing
that an animal treated with a certain medicine cannot be sold for meat/
milk until a certain date? This is standard livestock veterinary practice
and carries real legal/food-safety weight, and is completely absent from
the design today. *If undecided*: this capability will not exist when
Sprint 3+ builds Medical records — a real gap for any pig/cattle/poultry
customer.

**FD-07. Does VETJOY need to report certain animal diseases to state
veterinary authorities** (e.g. African swine fever, foot-and-mouth
disease, avian influenza) as part of the platform, or is that considered
entirely the farm/clinic's own separate responsibility outside VETJOY's
system? *If undecided*: no reporting capability is planned — this stays
entirely outside the platform.

**FD-08. What rights do customers have to request their data be
exported or deleted?**
Vietnam's data protection rules give individuals some rights here; the
current design only has "soft delete" for VETJOY's own record-keeping
needs, nothing framed around a Customer's own request. *If undecided*:
no customer-initiated data export/deletion process is planned.

## Group C — AI scope and data strategy

**FD-09. Is VETJOY willing to let customer data (even if anonymized) be
used to train or improve the AI, beyond just using it for that
customer's own care?**
This is a distinct consent question from "storing your data to help your
animal." *If undecided*: customer data will only be used for that
customer's own care, never for broader AI training — the safer default.

**FD-10. Should the AI ever be allowed to learn patterns *across*
different clinics/farms/customers** (e.g. "many farms are reporting a
similar symptom this month, this might be a regional outbreak"), or must
every customer's data stay strictly walled off from every other
customer's, even for this kind of pattern-spotting?
This is a genuine tension: the walled-off approach is what keeps customer
data private and was a deliberate, hardened decision in Sprint 1.5 — but
it also means the AI can never spot an emerging regional problem across
VETJOY's whole customer base, arguably one of the most valuable things a
veterinary-focused AI could ever do. *If undecided*: data stays
completely walled off per customer, no cross-customer learning — privacy
is protected but this valuable capability is unavailable.

**FD-11. How much should VETJOY invest in building a structured,
standardized way of recording symptoms/diagnoses** (rather than just free
-text notes), to make the AI meaningfully smarter over time? This is a
real, non-trivial investment decision, not a quick add-on. *If
undecided*: records stay free-text; AI usefulness will plateau lower than
it otherwise could.

**FD-12. Is dedicated business reporting/analytics (revenue reports,
health trend reports, compliance rates, etc.) a near-term priority, or a
later concern?**
Nothing today builds this — it's technically possible from the data that
exists, but nobody has been asked to build it yet. *If undecided*:
treated as a later concern, not part of near-term Sprint planning.

## Group D — CRM capability scope

**FD-13. Does VETJOY need a general "customer support case" feature**
for non-medical issues (billing questions, delivery complaints, general
inquiries) — separate from medical records and separate from AI chat?
*If undecided*: no such feature is planned; these issues will have no
dedicated home in the system.

**FD-14. For large B2B deals (a big farm or dealer negotiating a bulk
contract over weeks), does VETJOY need to track that negotiation as it
progresses** (a sales pipeline), or is every sale treated the same simple
way regardless of size? *If undecided*: no B2B pipeline tracking is
planned; large deals are tracked the same simple way as small retail
sales.

**FD-15. Does VETJOY want to ask customers for feedback/ratings after a
visit or order**, and act on that data? *If undecided*: no feedback
collection capability is planned.

**FD-16. Should routine reminders (e.g. "your pet's vaccination is due
soon") be sent automatically, even though the current rule says
scheduling a new visit always requires a person to explicitly decide
it?**
These are two different things — automatically *reminding* someone of a
known due-date vs. automatically *booking* a new visit without anyone's
say-so — but the current wording doesn't clearly separate them. *If
undecided*: both stay manual — no automatic reminders of any kind will be
sent, which likely under-delivers on the "nhắc lịch" goal this Sprint was
asked to evaluate.

**FD-17. Is marketing (planned campaigns/promotions to groups of
customers) and/or a loyalty or repeat-purchase rewards program something
VETJOY wants to build toward?**
Neither exists in the design today; both are common, fairly direct
levers for "tăng doanh thu." *If undecided*: neither is planned;
messaging stays limited to one-at-a-time, event-triggered notifications.

**FD-18. Is it a priority to spot customers who are likely to drift
away *before* they go quiet** (proactive retention), or is it acceptable
for now that VETJOY only notices and reacts *after* a customer has
already gone inactive? *If undecided*: retention stays reactive only —
directly related to FD-10 above, since this kind of early-warning signal
depends on the same pattern-learning capability.

## Group E — Species-specific business scope

**FD-19. For livestock/poultry customers, does VETJOY want to track
production outcomes** (growth/weight gain for pigs and cattle, egg yield
for poultry) as part of the platform, or stay strictly focused on health/
medical records only? *If undecided*: production tracking is out of
scope; the platform stays purely medical-record-focused for farm
customers.

**FD-20. Does VETJOY want to support tracking breeding/reproduction
events** (mating, pregnancy, birthing) for livestock customers? *If
undecided*: out of scope for now.

**FD-21. For pets, does VETJOY want to issue an actual shareable
certificate/proof document** (e.g. for a rabies vaccination), not just an
internal record? *If undecided*: vaccination stays an internal record
only; customers must obtain proof documents elsewhere.

**FD-22. Should the platform support non-medical services like grooming
or boarding**, or should it stay strictly clinical/medical plus product
sales? *If undecided*: these stay out of scope.

**FD-23. Should euthanasia be handled distinctly from a natural death**
(different consent steps, different follow-up communication with the
grieving owner), or is one generic "animal passed away" record
sufficient? *If undecided*: both are treated identically — a single
generic record, same follow-up communication for either case.

## Group F — Future technology roadmap

**FD-24. Is investing in farm sensor / IoT integration** (temperature,
feed/water monitoring, wearable trackers) on VETJOY's roadmap at any
point in the next several years? This doesn't need an answer now, but
knowing whether it's ever coming shapes how much flexibility to build
into Sprint 3+'s data design. *If undecided*: treated as not on the
roadmap; no space is reserved for it.

**FD-25. Same question for camera/vision-based farm monitoring**
(detecting sick or distressed animals from video) — on the roadmap or
not? *If undecided*: treated as not on the roadmap.

**FD-26. Would VETJOY ever allow an automated machine (a robot, an
automatic dispenser) to actually perform a medical action** (like
administering medication) without a person doing it directly — and if
so, who is accountable when something goes wrong?
This is the one future-technology question that isn't just "nice to have
later" — it touches the core promise that a licensed, accountable human
is always behind every medical action VETJOY records. *If undecided*:
the answer stays "no" — every medical action must be performed and
recorded by a human. This is the recommended default absent an explicit
Founder decision to change it.

## What this list deliberately excludes

Per this Sprint's instruction, this list contains no technical/
architectural decisions — e.g., whether `AIConversation` should
externalize its message history the same way `Animal` does
(`34_DOMAIN_REVIEW.md` Section 5–6) is a design detail for whichever
future Sprint builds AI conversation storage, not something Founder needs
to weigh in on. Findings of that kind are recorded in `34`–`38` for
future engineering reference and intentionally not repeated here.

## File liên quan

- Source review: [`34_DOMAIN_REVIEW.md`](./34_DOMAIN_REVIEW.md), [`35_BUSINESS_GAP.md`](./35_BUSINESS_GAP.md), [`36_AI_READINESS.md`](./36_AI_READINESS.md), [`37_CRM_READINESS.md`](./37_CRM_READINESS.md), [`38_FUTURE_ARCHITECTURE.md`](./38_FUTURE_ARCHITECTURE.md)
- Domain model these decisions would eventually amend: [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md), [`27_BUSINESS_RULES.md`](./27_BUSINESS_RULES.md)
- Governance for how an amendment would actually get built once decided: [`21_GOVERNANCE.md`](./21_GOVERNANCE.md)
