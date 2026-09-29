# 35. Veterinary Business Gap Analysis (per species)

> Answers this Sprint's "ĐÁNH GIÁ THÚ Y" question directly: if VETJOY's
> software must eventually serve **heo (pig), bò (cattle), gà (chicken),
> vịt (duck), chó (dog), mèo (cat)**, what real veterinary/farm business
> is *not yet* representable in the 8-domain model
> (`26_DOMAIN_MODEL.md`–`33_VETJOY_CARE5_MAPPING.md`)? This is a gap
> list, not a redesign — nothing here is proposed as a fix, only
> surfaced as missing scope for Founder to prioritize.

## Cross-cutting gap: no regulatory/food-safety layer

🔴 **Drug withdrawal periods are entirely absent from Domain 3
(Medical).** This is the single biggest veterinary-business gap in the
model. For pigs and cattle in particular, most treatments (antibiotics,
antiparasitics) carry a legally/scientifically mandated withdrawal period
before meat/milk from that animal may enter the food supply. Neither
`Prescription` nor `Vaccination` nor any Business Rule tracks "this
animal cannot be slaughtered/its milk cannot be sold until date X." A
company literally named for veterinary practice ("Thú y") advising farms
on livestock without this concept modeled is a real business/legal
exposure, not just a missing feature. → See FD-10.

🔴 **Mandatory disease outbreak reporting is entirely absent.** Vietnam
requires reporting specific notifiable diseases to state veterinary
authorities (Chi cục Chăn nuôi và Thú y) — African swine fever (dịch tả
heo châu Phi) for pigs, foot-and-mouth disease (lở mồm long móng) for
cattle, avian influenza (cúm gia cầm) for poultry. Nothing in Domain 3 or
Domain 7 (Communication) models a "reportable disease" concept, an
outbreak event, or an obligation to notify anyone outside the
Customer/VETJOY relationship. This is a compliance gap with real legal
consequences for a business advising farms at scale. → See FD-11.

## Heo (Pig) and Bò (Cattle) — livestock-specific gaps

🟡 **No breeding/reproduction tracking.** Phối giống (breeding), mang
thai (pregnancy), and đẻ (birthing/farrowing/calving) are core livestock
management events with their own timelines and health implications
(a pregnant/lactating animal has different treatment constraints) — none
of this exists as a concept in Domain 2 or 3 today. → See FD-12.

🟡 **No growth/production-economics tracking.** Weight gain, feed
conversion ratio (FCR), and other productivity metrics are what a
livestock farm actually manages its business around — VETJOY's advisory
value to a farm customer is limited if the platform only sees "medical
events" and has no visibility into the production outcomes those events
are meant to protect. → See FD-13 (shared with poultry egg-production
gap below).

🟡 **Herd-batch model can't represent per-individual variance within a
batch.** BR-ANIM-03 treats one herd generation as one `Animal` record —
correct for uniform batch treatment, but real disease investigation
within a herd needs to distinguish "this specific animal in the batch
reacted differently" (e.g. an outbreak that affects 30% of a 200-head
batch). The current single-record-per-generation model has no mechanism
for that finer granularity. Flagged as an open design question already
in `32_ANIMAL_HEALTH_RECORD.md` §8 (herd-record granularity) — this
review confirms it is not just a data-modeling nuance but a real gap in
disease-response capability.

🟢 **No inter-farm movement/transport/quarantine documentation.**
`AnimalMovedToFarm` (Domain 2) records that a move happened, but nothing
covers transport permits, quarantine holding periods, or the health
certificate paperwork Vietnamese regulation requires for livestock moved
between provinces.

## Gà (Chicken) and Vịt (Duck) — poultry-specific gaps

🟡 **No production-output tracking (egg yield).** For layer flocks,
daily/weekly egg production is the primary business metric a farm
customer cares about — and the metric most likely to reveal an emerging
health problem early (a sudden yield drop often precedes visible
symptoms). This is completely outside all 8 domains today — Commerce
tracks what a Customer buys from VETJOY, not what a Customer's farm
produces. → See FD-13.

🟡 **No age-based vaccination protocol/schedule concept.** Poultry
vaccination programs are driven by the bird's age in days (specific
vaccines at specific day-of-age milestones), a recurring, protocol-driven
pattern quite different from the ad-hoc "Doctor decides a follow-up is
needed" pattern BR-MED-09 describes. The current model has no
first-class "Vaccination Protocol/Schedule" concept a flock could be
enrolled in.

🟢 **Same regulatory gaps as livestock** (avian influenza reporting,
FD-11) apply here with equal force.

## Chó (Dog) and Mèo (Cat) — companion animal gaps

🟡 **No compliance-document/certificate concept.** Rabies vaccination in
particular has downstream legal significance (travel, boarding,
licensing, sometimes required for city registration) — Customers need an
actual certificate/proof document, not just an internal
`VaccinationAdministered` event. Domain 3/7 has no concept of a
generated, shareable compliance document. → See FD-14.

🟢 **No explicit microchip/physical-ID tracking field.** `Animal`
Identity (BR-ANIM-02) covers species/breed/name/code but doesn't name a
microchip number as a distinct tracked identifier — relevant now, and
more relevant once RFID integration is considered (see
[`38_FUTURE_ARCHITECTURE.md`](./38_FUTURE_ARCHITECTURE.md)).

🟡 **No spay/neuter (desexed) status as a durable fact.** This is
clinically significant for future care recommendations (AI and Doctor
alike) but isn't named as a tracked concept anywhere — it would currently
have to be inferred from reading Treatment history rather than being a
first-class fact.

🟡 **No non-clinical service concept (grooming, boarding).** These are
common, real revenue lines for veterinary-adjacent businesses but don't
fit Medical (not a clinical Encounter) or cleanly into Commerce (not a
simple product sale — it's a scheduled service with its own duration/
resource concerns). The model has no place for this today. → See FD-15.

🟡 **Natural death and euthanasia are not distinguished.**
`AnimalDeceasedRecorded` (Domain 2) treats both the same way, but they
have different consent/documentation requirements and very different
emotional-care implications for how Communication (Domain 7) should
respond to the Customer afterward ("condolence policy" is mentioned in
`29_DOMAIN_EVENTS.md` but not differentiated by cause). → See FD-16.

🟢 **Behavioral/training consultation is not clearly in scope.** A large
share of real pet-owner questions (to a Doctor or a future AI) are
behavioral, not medical (housetraining, aggression, anxiety) — Domain 3's
Purpose and Domain 6's Purpose are both framed around clinical/medical
support; whether behavioral consultation is in or out of VETJOY's scope
is undefined, not just unmodeled.

## What's notably *not* a gap (worth confirming explicitly)

- Multi-species households (a Customer owning both a dog and a cat) —
  already fully supported (`Customer` 1-to-many `Animal`).
- Species-specific dosing/content differences — a content/data concern
  for whichever future Sprint builds `Product`/`Prescription` reference
  data, not a domain-model gap.
- Cross-species Commerce (buying dog food vs. buying pig feed through
  the same `Customer`/`SalesOrder` flow) — already handled uniformly.

## File liên quan

- Domain review this feeds into: [`34_DOMAIN_REVIEW.md`](./34_DOMAIN_REVIEW.md)
- Medical domain under review: `26_DOMAIN_MODEL.md` Domain 3, [`27_BUSINESS_RULES.md`](./27_BUSINESS_RULES.md) BR-MED
- Animal domain under review: [`32_ANIMAL_HEALTH_RECORD.md`](./32_ANIMAL_HEALTH_RECORD.md)
- Consolidated decisions: [`39_FOUNDER_DECISIONS.md`](./39_FOUNDER_DECISIONS.md)
