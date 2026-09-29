# 44. Product Vision (synthesized)

> A narrative synthesis of the vision already established across
> `01_PROJECT_OVERVIEW.md` (brand/mission) and `26`–`33` (the domain
> model that operationalizes it). **Nothing here is new** — this
> document exists so the vision doesn't only live scattered across 39
> files, but this Sprint adds no fact, no rule, no decision that isn't
> already recorded elsewhere.

## The one-sentence vision

VETJOY is building **a continuous animal-health-care ecosystem**, not a
veterinary e-commerce site — the founding brief's own words: *"Chuyên
môn (bác sĩ thú y trên 20 năm kinh nghiệm) + Sản phẩm + Công nghệ (VETJOY
App) + Dữ liệu (hồ sơ vật nuôi) = chăm sóc liên tục, không dừng lại sau
khi bán."* Every architectural decision made from Sprint 1 onward has
been in service of this one sentence, not a departure from it.

## What "continuous care" means operationally: VETJOY CARE 5

The brand's proprietary methodology — **Ghi nhận → Đánh giá → Giải pháp
→ Theo dõi → Chăm sóc tiếp** — is not marketing language layered on top
of the product. It is now traceable, event by event, to real domain
behavior (`33_VETJOY_CARE5_MAPPING.md`): every step maps to a specific
Aggregate, Command, and Domain Event. The loop's fifth step, "Chăm sóc
tiếp," is what makes the whole methodology durable over a customer
relationship's entire lifetime — and it only works because of one
specific design choice: an Animal's Health Record and Timeline are
projections that accumulate forever, not fields that could be lost or
overwritten (`32_ANIMAL_HEALTH_RECORD.md`).

## Who this is for

The five personas named in the founding brief (`01_PROJECT_OVERVIEW.md`)
— livestock owners, poultry owners, farm businesses, pet owners, dealers
— all map onto one `Customer` concept and one `Animal` concept in the
domain model (`26_DOMAIN_MODEL.md` Ubiquitous Language), deliberately:
VETJOY's promise is the same regardless of species or scale — "chúng tôi
biết vật nuôi của bạn, theo thời gian" — not a different product per
persona.

## Where the real differentiation lives

The domain model's Core/Supporting/Generic classification
(`26_DOMAIN_MODEL.md`) is the clearest expression of where VETJOY's
10-year competitive advantage actually is, versus where it's just
necessary infrastructure:

- **Animal** (the health record itself) and **Medical** (VETJOY CARE 5,
  encoded as real domain behavior) are the two domains that directly
  embody "không chỉ bán thuốc."
- **AI** is the forward-looking third leg of the differentiation — not
  because AI itself is novel, but because *AI that has read a specific
  animal's whole history* is a fundamentally different (and much harder
  to copy) product than a generic veterinary chatbot. This is why the
  domain model insists, structurally (the Anti-Corruption Layer,
  `30_AI_DOMAIN.md`), that AI is always grounded in real Timeline data
  and never a substitute for the human expertise the brand is actually
  built on.
- Customer, Commerce, Relationship exist because any real business
  needs them — but VETJOY doesn't win or lose against competitors based
  on how well it manages inventory or dealer contracts.
- Communication is deliberately treated as a solved, buyable problem —
  the message *content* matters (it comes from VETJOY CARE 5's Care
  Plan); *how a Zalo message gets delivered* does not need to be
  VETJOY's own engineering investment.

## The 10-year framing, made concrete

Sprint 2.0's domain model was explicitly written against the question
*"is this still right in 10 years?"* rather than *"does this work for
Phase 1.5's demo mode?"* Two concrete commitments follow from that,
already reflected in decisions made:

1. **The platform must outlast any single animal's relationship with any
   single owner.** This is why `AnimalTransferredToNewOwner` is a durable
   event rather than a silent field update (BR-ANIM-05) — an animal's
   medical history is the asset with lasting value, not any one
   ownership record.
2. **The platform must scale from a single company to (potentially) a
   multi-organization structure without a rewrite.** This is why
   `organizations` was introduced as a self-referencing hierarchy in
   Sprint 1 Revision rather than a flat `dealer_id` — whether VETJOY
   actually becomes a multi-branch or multi-company platform is still an
   open Founder decision (`40_FOUNDER_DECISIONS_LOCK.md` FD-02), but the
   architecture doesn't foreclose either answer.

## What this vision deliberately does not promise (yet)

Per `01_PROJECT_OVERVIEW.md`'s own explicit non-goals — no e-commerce
checkout, no online payment, no AI replacing a veterinarian's judgment —
and per the gaps this Sprint series surfaced honestly rather than papered
over: this vision does not yet cover livestock production economics
(FD-19), proactive AI-driven prediction (FD-10/FD-18), or several other
capabilities named across `35`–`38`. The vision is directionally locked;
the *pace* at which each capability gets built is exactly what
`45_RELEASE_ROADMAP.md` and the Founder decisions in `40` govern.

## File liên quan

- Original brand/mission statement: [`01_PROJECT_OVERVIEW.md`](./01_PROJECT_OVERVIEW.md)
- Domain model this vision maps onto: [`26_DOMAIN_MODEL.md`](./26_DOMAIN_MODEL.md)
- VETJOY CARE 5 mechanics: [`33_VETJOY_CARE5_MAPPING.md`](./33_VETJOY_CARE5_MAPPING.md)
- What's still undecided about how far this vision goes: [`40_FOUNDER_DECISIONS_LOCK.md`](./40_FOUNDER_DECISIONS_LOCK.md)
- How the vision gets built out over time: [`45_RELEASE_ROADMAP.md`](./45_RELEASE_ROADMAP.md)
