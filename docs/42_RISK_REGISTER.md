# 42. Risk Register

> Every risk named across `01`–`39` (domain "Rủi ro" sections, gap
> analyses, governance notes, deployment notes), consolidated into one
> register with a Likelihood × Impact matrix. No new risks are invented
> here beyond what prior documents already surfaced — this is
> consolidation, per Sprint 2.2's scope.

## Risk Matrix (Likelihood × Impact)

| | Impact: Low | Impact: Medium | Impact: High | Impact: Critical |
| --- | --- | --- | --- | --- |
| **Likelihood: High** | R08 | R01, R11 | R13 | — |
| **Likelihood: Medium** | R22 | R05, R09, R10, R18, R20 | R02, R06, R16, R19 | R07 |
| **Likelihood: Low** | R21, R23 | — | R15 | R03, R12, R14 |
| **Likelihood: Certain (đã xảy ra/chắc chắn xảy ra)** | — | R04, R17 | — | — |

**Severity band** (derived from the matrix position, not assigned
independently): **Critical** = R03, R07, R12, R14. **High** = R02, R06,
R13, R15, R16, R19. **Medium** = R01, R04, R05, R09, R10, R11, R17, R18,
R20, R22. **Low** = R08, R21, R23.

> **Cập nhật 29/09/2026 (sửa lại đánh giá 28/09/2026)**: R12 **không**
> được hạ severity chỉ vì đã có quyết định kiến trúc (FD-01/ADR-13).
> Một quyết định thiết kế làm rõ **hướng kiểm soát**, không phải bằng
> chứng rằng kiểm soát đó **đã hoạt động** — migration
> `doctor_branch_assignments`, ràng buộc, và RLS liên quan đều **chưa
> được triển khai**. R12 giữ nguyên vị trí Low × Critical = **Critical**
> trong ma trận, đúng công thức hiện hành (nhất quán với R03, R14 — cùng
> ở Low × Critical). Xem chi tiết đầy đủ ngay dưới bảng Register.

## Risk Register

| ID | Risk | Domain/Area | Likelihood | Impact | Severity | Related decision |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | Customer records duplicated across channels (website/dealer/walk-in), never reconciled | Customer (1) | High | Medium | Medium | FD-06 (39) |
| R02 | Customer PII mishandled/over-exposed across organization hierarchy | Customer (1) | Medium | High | High | BR-CUST-06 |
| R03 | Fabricated/incorrect medical content (dosage, diagnosis) reaches a Customer | Medical (3) | Low (if BR-MED-04 held) | Critical | Critical | BR-MED-04 |
| R04 | LabTest has zero schema representation; any Medical Sprint that assumes it exists will fail | Medical (3) | Certain | Medium | Medium | BR-MED-10 |
| R05 | Inventory/financial reconciliation drift between Medical consumption and Commerce stock | Commerce (4) | Medium | Medium | Medium | BR-COM-06 |
| R06 | Doctor's private license data (`license_no`) leaks into the public-facing profile | Relationship (5) | Medium | High | High | BR-REL-02 |
| R07 | AI Anti-Corruption Layer erodes through incremental feature convenience ("just auto-send this once") | AI (6) | Medium | Critical | Critical | BR-AI-01/03/04 |
| R08 | `AIMemory` facts go stale with no expiry/re-verification | AI (6) | High | Low | Low | FD (memory staleness, 34 §3) |
| R09 | `AITrainingExample` curation quality degrades over time (bad examples become tomorrow's bad recommendations) | AI (6) | Medium | Medium | Medium | BR-AI-06 |
| R10 | Communication depends entirely on third-party platform policy (Zalo/Facebook API changes, rate limits) | Communication (7) | Medium | Medium | Medium | Domain 7 §7 |
| R11 | Timeline (`events`) volume/query performance degrades at multi-year, multi-org scale | Timeline (8) | High | Medium | Medium | Domain 8 §7 |
| R12 | **Status: Design decided — implementation controls pending** (không phải Resolved). Nếu `doctor_branch_assignments` không cưỡng chế Branch cùng Organization với tài khoản gốc của Doctor, hoặc RLS không kiểm tra Organization thông qua Branch, hệ thống có thể làm lộ dữ liệu chéo Organization. Chi tiết mitigation và điều kiện đóng — xem ngay dưới bảng. | Relationship (5) / Schema | Low | Critical | Critical | FD-01 / ADR-13 |
| R13 | Franchising-vs-single-branch ambiguity has gone unresolved across 3 Sprints, compounding design debt each time it's deferred again | Customer (1) / Organization | High (keeps recurring) | Medium | High | FD-02 |
| R14 | No drug withdrawal-period tracking — real food-safety/legal exposure for livestock customers | Medical (3) | Low (not yet triggered — no real customers on the system yet) | Critical | Critical | FD-06 (40) |
| R15 | No mandatory disease-outbreak reporting capability — regulatory exposure at scale | Medical (3) | Low (same reason as R14) | High | High | FD-07 (40) |
| R16 | No data-subject deletion/export process — Personal Data Protection Decree exposure | Customer (1) / Compliance | Medium | High | High | FD-08 (40) |
| R17 | Strict tenant isolation blocks population-level AI pattern learning (an opportunity cost, not a safety defect) | AI (6) | Certain (by design) | Medium | Medium | FD-10 (39) |
| R18 | Retention is reactive-only; no early churn-risk signal | Customer (1) / CRM | Medium | Medium | Medium | FD-18 (39) |
| R19 | No accountability model for autonomous actuation (robot) if ever adopted | Future tech | Medium (timing far out, but principle gap exists now) | High | High | FD-26 (39) |
| R20 | No hosting/domain platform chosen — blocks any real production deploy | Deployment | Medium | Medium | Medium | FD-32 (40) |
| R21 | `npm audit` reports a "high" vulnerability in `postcss`/`sharp`, internal to Next.js 16.2.12, build-time only | Website / Dependencies | Certain (present today) | Low | Low | `07_DEPLOYMENT.md` |
| R22 | `AIConversation` aggregate risks the same unbounded-growth problem `Animal` deliberately avoided | AI (6) / Design | Medium | Medium | Medium | `34_DOMAIN_REVIEW.md` §5 |
| R23 | Migration evidence-retention discipline (logs, hashes, sign-offs) lapses since it's process-dependent, not enforced by tooling | Governance | Low | Medium | Low | `23_MIGRATION_POLICY.md` §7 |

## R12 — Chi tiết

> Tách riêng vì đây là rủi ro có kế hoạch giảm thiểu chi tiết nhất
> trong toàn bộ register — nội dung dưới đây **không** làm thay đổi
> hàng R12 trong bảng phía trên, chỉ khai triển đầy đủ.

**Trạng thái**: **Design decided — implementation controls pending.**
Quyết định kiến trúc (FD-01/ADR-13) đã chốt *hướng* kiểm soát; điều đó
chưa chứng minh kiểm soát *đã hoạt động*. Migration
`doctor_branch_assignments`, ràng buộc/trigger, và RLS liên quan đều
**chưa được viết**.

**Rủi ro**: Nếu `doctor_branch_assignments` không cưỡng chế Branch cùng
Organization với tài khoản gốc của Doctor, hoặc RLS không kiểm tra
Organization thông qua Branch, hệ thống có thể làm lộ dữ liệu chéo
Organization.

**Likelihood**: Low. **Impact**: Critical. **Severity**: Critical
(Low × Critical = Critical theo đúng ma trận hiện hành, nhất quán với
cách xếp hạng của R03 và R14 — không tự đổi công thức).

**Biện pháp giảm thiểu đã lên kế hoạch** (chưa triển khai, liệt kê để
theo dõi tiến độ, không phải bằng chứng đã kiểm soát):
- Foreign key `doctor_id` và `branch_id`.
- Ràng buộc hoặc trigger cấm Branch khác Organization.
- RLS kiểm tra Organization thông qua Branch.
- Không tin cậy `organization_id` do client gửi lên.
- Kiểm thử: từ chối gán Doctor sang Branch thuộc Organization khác.
- Kiểm thử: không đọc được dữ liệu của Branch thuộc Organization khác.
- Code review migration và RLS trước khi push lên Staging.

**Điều kiện để đóng hoặc hạ mức R12** (phải đạt **toàn bộ**, không phải
từng phần):
1. Migration được Founder duyệt.
2. Constraint/trigger đã triển khai.
3. RLS đã triển khai.
4. pgTAP hoặc integration test chứng minh truy cập chéo Organization bị
   từ chối.
5. Staging verification PASS.
6. Không có regression về phân quyền.

## Reading the register

- **Critical (4)**: R03, R07, R12, R14 — R12 giữ nguyên ở mức Critical
  vì quyết định kiến trúc (FD-01/ADR-13) mới chỉ định hướng kiểm soát,
  chưa có bằng chứng kiểm soát đã triển khai và hoạt động đúng (xem "R12
  — Chi tiết" ở trên cho điều kiện đóng cụ thể). Ba mục còn lại: hai về
  một nguyên tắc riêng (tính toàn vẹn nội dung y tế, Anti-Corruption
  Layer của AI) và một là khoảng trống tuân thủ pháp lý. Không mục nào
  *đang xảy ra* (chưa có dữ liệu Production thật) — severity phản ánh
  điều gì sẽ xảy ra ngay khi hệ thống vận hành thật, không phải sự cố
  hiện tại.
- **High (6)**: mix of compliance exposure (R15, R16), a
  three-Sprint-recurring unresolved decision (R13), a data-leak risk
  (R02, R06), and a forward-looking principle gap (R19).
- **Medium (10)**: the largest band — mostly "known, named, deferred with
  an explicit safe default" items already tracked in
  `40_FOUNDER_DECISIONS_LOCK.md`.
- **Low (3)**: accepted, low-urgency items, including one (R21) that's
  already a deliberate, documented "don't fix yet" call from
  `07_DEPLOYMENT.md`.

## File liên quan

- Where each risk originates: `26_DOMAIN_MODEL.md` through `38_FUTURE_ARCHITECTURE.md` (per-domain "Rủi ro" sections)
- Decisions that address these risks: [`40_FOUNDER_DECISIONS_LOCK.md`](./40_FOUNDER_DECISIONS_LOCK.md)
- Purely technical risks tracked separately: [`43_TECHNICAL_DEBT.md`](./43_TECHNICAL_DEBT.md)
