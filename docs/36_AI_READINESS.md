# 36. AI Readiness Assessment

> Answers this Sprint's "ĐÁNH GIÁ AI" question: does the domain model in
> [`30_AI_DOMAIN.md`](./30_AI_DOMAIN.md) give AI enough data to **học**
> (learn), **tư vấn** (advise), **dự đoán** (predict), **báo cáo**
> (report), and **hỗ trợ bác sĩ** (support doctors)? Assessed capability
> by capability, against what the 8 domains actually provide today — not
> a redesign.

## Summary verdict

| Capability | Ready? | Blocking gap |
| --- | --- | --- |
| Học (Learn) | 🟡 Partially | No structured clinical vocabulary; training-consent undefined |
| Tư vấn (Advise) | 🟡 Partially | No knowledge-base concept distinct from PromptTemplate |
| Dự đoán (Predict) | 🔴 Not yet | No protocol/schedule data; tenant isolation blocks population-level patterns |
| Báo cáo (Report) | 🟡 Partially | No first-class reporting/analytics concept |
| Hỗ trợ bác sĩ (Support doctors) | 🟢 Mostly ready | Missing structured rejection-reason capture |

## Học (Learn)

**What's already there**: `AIMemory` (durable facts), `AITrainingExample`
(curated training input, BR-AI-06 excludes fabricated/unverified
content), and the full Timeline event stream (Domain 8) as raw learning
material.

**What's missing**:

🟡 **No structured clinical vocabulary.** Looking at the Aggregate Design
table in `26_DOMAIN_MODEL.md`, `Treatment` stores "Chief complaint /
assessment / plan" as a Value Object — implicitly free text. AI learning
from unstructured text is possible but far weaker than learning from
coded symptoms/diagnoses/conditions. No controlled vocabulary or coding
standard (even an internal one) is defined anywhere in Domain 3. This
caps how well "học" can ever work, regardless of how much data
accumulates. → See FD-19.

🟡 **No consent-for-training-use rule.** BR-AI-06 governs what content
*qualifies* for training data curation, but nothing addresses whether a
Customer has consented to their (anonymized or not) data being used to
improve AI models — a distinct question from consenting to have their
data stored for their own animal's care. This matters both ethically
and, per `35_BUSINESS_GAP.md`'s regulatory note, under Vietnam's Personal
Data Protection Decree. → See FD-17.

🟡 **`AIMemory` has no expiry/re-verification rule** (already flagged in
`34_DOMAIN_REVIEW.md` Section 3) — learning from a memory base that never
ages out stale facts degrades quality over a 10-year horizon.

## Tư vấn (Advise)

**What's already there**: `AIConversation` structurally supports
Customer-facing advice; BR-AI-03/05 correctly gate medical-content advice
behind Doctor review or explicit "this is a suggestion" framing;
`PromptTemplate` lets staff control behavior.

**What's missing**:

🟡 **No Knowledge Base concept.** `PromptTemplate` (per
`30_AI_DOMAIN.md` §3) is explicitly a *behavioral* template ("how the AI
is instructed to behave"), not a repository of veterinary facts, product
knowledge, or species-specific care information. Good advice needs
grounding in *something* — and this domain model doesn't name what that
something is. Whether that's a separate content system, a curated
document store, or something else is undecided — not a domain-model
defect exactly, but a real hole in "does AI have enough to advise well."

🟢 **Product/commerce grounding exists** (Domain 4 is fully modeled and
AI can reference `Product`/`Inventory` via the Open Host Service
relationship) — advice that references what VETJOY actually sells is
achievable today, unlike general veterinary-knowledge-grounded advice.

## Dự đoán (Predict)

**What's already there**: Full event history (Timeline) per Animal in
principle allows trend detection once enough data accumulates.

**What's missing**:

🔴 **No protocol/schedule data to predict against.** Prediction use cases
Founder would obviously want ("this animal's vaccination is due soon",
"this flock's egg yield is trending down") require a defined *expected*
pattern to compare actuals against — e.g. an age-based vaccination
protocol (flagged missing in `35_BUSINESS_GAP.md`) or a production-yield
baseline (also flagged there). Without these, "dự đoán" has no reference
point to predict deviation from — it's not just under-built, it's
structurally unable to do the most obviously useful predictions until
those concepts exist.

🔴 **Tenant isolation blocks population-level pattern learning.**
BR-XD-02 and BR-AI-07 correctly scope all data — including AI data — to
an Organization's own hierarchy, with no cross-tenant visibility. This is
the right privacy default, but it also means AI cannot learn
"this symptom pattern across many farms/clinics predicts an emerging
regional outbreak" — the single most valuable kind of prediction for a
company positioned as a veterinary authority — without a deliberately
designed, explicitly-consented, likely-anonymized exception to that
isolation. No such path exists today, and none should be assumed without
an explicit Founder decision given how directly it touches the
privacy/tenant-isolation principle Sprint 1.5 was hardened specifically
to protect. → See FD-18 (a genuine privacy-vs-capability tradeoff, not a
technical detail).

## Báo cáo (Report)

**What's already there**: Every domain publishes events to Timeline
(BR-TL-02); in principle any report can be built by reading/aggregating
that stream.

**What's missing**:

🟡 **No first-class reporting/analytics concept anywhere in the 8
domains.** Unlike `Notification` (a modeled concept for Domain 7's
output), there is no equivalent modeled concept for "a report" — no
aggregate, no read-model name, no owner. This may be intentional (reports
are often a presentation-layer/analytics-layer concern, not a Bounded
Context) but it means this Sprint cannot claim reporting is "ready" — it
is *possible in principle*, entirely unspecified in practice. Whether
Founder wants a 9th Domain ("Reporting/Analytics") or considers this
purely a future UI concern layered on Timeline is an open question. →
See FD-20.

## Hỗ trợ bác sĩ (Support doctors)

**What's already there**: This is the strongest-covered capability.
`AIRecommendation`'s full lifecycle (`28_CRM_LIFECYCLE.md`) already
captures a Doctor's Accept/Reject decision as a first-class event
(`AIRecommendationAccepted`/`Rejected`), which is exactly the feedback
loop needed to keep doctor-support useful and trustworthy over time.
`AIConversationHandedOffToHuman` correctly routes anything requiring
clinical judgment to a Doctor.

**What's missing**:

🟢 **No structured rejection-reason capture.** `AIRecommendationRejected`
carries "recommendation id, human decision" (per
`29_DOMAIN_EVENTS.md`'s event catalog) but not *why* a Doctor rejected
it. Capturing a reason (wrong species assumption, factually incorrect,
right idea/wrong timing, etc.) as structured data would materially
improve future recommendation quality — currently this signal is lost
the moment a Doctor rejects something.

## File liên quan

- Domain review this feeds into: [`34_DOMAIN_REVIEW.md`](./34_DOMAIN_REVIEW.md)
- AI domain under review: [`30_AI_DOMAIN.md`](./30_AI_DOMAIN.md)
- Related gaps (protocol schedules, production data): [`35_BUSINESS_GAP.md`](./35_BUSINESS_GAP.md)
- Consolidated decisions: [`39_FOUNDER_DECISIONS.md`](./39_FOUNDER_DECISIONS.md)
