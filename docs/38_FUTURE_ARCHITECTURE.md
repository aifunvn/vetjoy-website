# 38. Future Architecture Readiness

> Answers this Sprint's "ĐÁNH GIÁ TƯƠNG LAI" question: if VETJOY later
> adds **IoT, Camera, RFID, QR, AI Vision, Drone, Robot**, does the
> current 8-domain model absorb them, or does it break? Assessed
> technology by technology — this is a durability check on the existing
> design, not a proposal to build any of these now.

## Summary verdict

| Technology | Fit | Why |
| --- | --- | --- |
| RFID | 🟢 Absorbs cleanly | Additive Animal identity attribute |
| QR | 🟢 Absorbs cleanly | Presentation-layer encoding of existing IDs |
| IoT (sensors) | 🟡 Needs a translation layer | Timeline is event-per-fact, not built for telemetry firehoses |
| Camera | 🟡 Needs a translation layer + rule extension | Same as IoT, plus new AI output category |
| Drone | 🟡 Needs a translation layer | Same reasoning as Camera (aerial sensor) |
| AI Vision | 🟡 Structurally compatible, sharpens an existing risk | Fits Anti-Corruption Layer, but pressures BR-MED-04 boundary |
| Robot (autonomous actuation) | 🔴 Not addressed at all | No concept of a non-human actor performing a Medical/Commerce action |

## RFID — clean fit

RFID (ear tags, microchips) is fundamentally a way of *reading* an
identity that Domain 2 (Animal) already needs. `35_BUSINESS_GAP.md`
already flags microchip number as a missing identity attribute on
`Animal` — RFID is the technology for populating that field, not a new
structural concept. Adding it is additive (a new identifying attribute),
not a redesign.

## QR — clean fit

QR codes are just an encoding of an ID that already exists in the model
— an Appointment ID for check-in, a Product/batch ID for traceability, an
Animal ID for quick lookup, a vaccination-certificate reference (itself
flagged as missing in `35_BUSINESS_GAP.md` FD-14). QR is a
presentation/integration-layer concern, not something any of the 8
domains needs to change shape for.

## IoT (sensors) — needs a translation layer

Farm sensors (temperature, humidity, feed/water dispensers, wearable
livestock trackers) produce continuous, high-frequency telemetry. This is
a fundamentally different data shape from what Domain 8 (Timeline) is
designed for: BR-TL-02 says an event is published for a state transition
"another domain, a human, or AI might need to know happened" — a raw
sensor reading every minute is not, by itself, a business-meaningful
fact. Pushing raw telemetry directly into the append-only event stream
(BR-TL-01) would overwhelm it with noise, not information.

**What this means**: IoT does *not* require redesigning Domain 2/3/8 —
it requires a **translation layer in front of them** that turns raw
telemetry into the same kind of discrete, business-meaningful events the
model already expects (e.g., a threshold breach becomes
`FarmTemperatureThresholdExceeded`, not a stream of raw degrees). The
model also has no "Device/Sensor" concept yet — a small new aggregate
(referencing `Farm`/`Animal` by id, same pattern every other aggregate
already follows) would be needed, but this is additive, not disruptive.
→ See FD-27.

## Camera — same translation-layer need, plus a rule-extension flag

Barn cameras used for behavior/health monitoring (e.g., detecting a
limping animal, detecting reduced feeding activity) face the identical
telemetry-vs-event problem as IoT above — raw video is not a Domain
Event; a detected anomaly is. The same translation-layer answer applies.

Additionally: a camera-detected anomaly is a **new category of AI
output** — an *observation* about physical state, distinct from the
conversational/text-based `AIRecommendation` this Sprint's rules were
written around. BR-AI-01/03 (no auto-diagnosis, human confirms) should
extend naturally to this new output type in spirit, but the rules as
worded reference "recommendation," "conversation," and "diagnosis" — not
"an automated visual observation." Whoever eventually designs this
capability should explicitly confirm BR-AI-01/03 cover it, or write a
BR-AI addition that names it directly, rather than assuming silent
coverage. → See FD-28.

## Drone — same reasoning as Camera

Aerial farm surveying (large livestock/poultry farm monitoring) is
architecturally identical to the Camera case: an observational sensor
producing data that needs interpretation before it becomes a meaningful
Domain Event referencing a `Farm`. No additional new concern beyond what
IoT/Camera already raise.

## AI Vision — structurally compatible, but the sharpest edge case

Image-based diagnostic assistance (a photographed skin lesion, an
uploaded x-ray) is the technology in this list most likely to test the
domain model's core safety principle. Structurally, it fits well: an AI
Vision output is still shaped like an `AIRecommendation` — a suggestion
awaiting human review (BR-AI-01) — and `26_DOMAIN_MODEL.md`'s Bounded
Context Diagram already frames AI as an Open Host Service reader with an
Anti-Corruption Layer gate before anything reaches Medical, regardless of
what kind of input produced the suggestion. `AIConversation`'s message
thread would need to accommodate image content, not just text — a Value
Object extension, not a structural one.

The real risk isn't structural fit — it's the same tension
`34_DOMAIN_REVIEW.md` Section 2 already flagged between BR-MED-04 ("AI
never auto-generates a diagnosis") and Domain 6's own "AI-assisted LabTest
interpretation" extensibility note. AI Vision analyzing an x-ray and
"suggesting a finding" sits exactly on that boundary, and is the single
technology on this list most likely to erode BR-MED-04 through
incremental feature creep if that rule isn't actively defended when this
capability is eventually built. This finding **reinforces** FD from
`34_DOMAIN_REVIEW.md` rather than raising a new one — flagged here for
completeness since it's the most concrete future scenario where that
existing risk becomes real.

## Robot (autonomous actuation) — the one genuine gap

Everything above concerns **sensing** (reading more data into the
system). A robot that **acts** — an automated feeding system, a robotic
milking system, an automated medication dispenser — is a different kind
of future technology entirely, and this model has no answer for it.

Domain 3's Vai trò (Roles) names `Doctor`, `Employee`, `Customer` as the
actors who perform/request Medical actions. BR-MED-03 requires the actor
performing a Treatment/Vaccination to be a *licensed Doctor*. If a robot
autonomously administers a dose, "who performed this" has no answer this
model's Roles section anticipates — and BR-MED-03's license requirement
plainly cannot apply to a machine. This is not a translation-layer
problem like sensing was; it's a genuine hole in the model's core
accountability principle (a human must always be identifiable as
responsible for a Medical action, mirroring the Anti-Corruption Layer's
"a human always mediates" rule for AI suggestions — `26_DOMAIN_MODEL.md`
Bounded Context Diagram legend).

**This is the one item on this list that is a Founder-level principle
question, not an engineering extension**: does VETJOY ever intend to
allow automated physical actuation of medical/commerce actions at all,
and if so, what does "a human is accountable for this" mean when the
hands doing it aren't human? Nothing in this Sprint answers that, and
nothing should be assumed. → See FD-29.

## File liên quan

- Domain review this feeds into: [`34_DOMAIN_REVIEW.md`](./34_DOMAIN_REVIEW.md)
- AI domain and its Anti-Corruption Layer principle: [`30_AI_DOMAIN.md`](./30_AI_DOMAIN.md)
- Animal identity gap (RFID relevance): [`35_BUSINESS_GAP.md`](./35_BUSINESS_GAP.md)
- Consolidated decisions: [`39_FOUNDER_DECISIONS.md`](./39_FOUNDER_DECISIONS.md)
