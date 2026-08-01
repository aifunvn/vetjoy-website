import { describe, expect, it } from "vitest";
import { submitDealerAction } from "./actions";
import { initialDealerState } from "./state";

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

const validFields = {
  fullName: "Trần Thị B",
  phone: "0909876543",
  businessName: "Cửa hàng thú y ABC",
  areaAddress: "Quận 1, TP.HCM",
  businessScale: "cua_hang",
  cooperationNeeds: "Muốn trở thành đại lý phân phối",
  consent: "on",
};

describe("submitDealerAction", () => {
  it("preserves entered values and reports the field error on invalid phone", async () => {
    const fd = buildFormData({ ...validFields, phone: "123" });
    const result = await submitDealerAction(initialDealerState, fd);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.phone).toBeDefined();
    expect(result.values?.businessName).toBe("Cửa hàng thú y ABC");
    expect(result.values?.businessScale).toBe("cua_hang");
  });

  it("succeeds for a fully valid submission", async () => {
    const fd = buildFormData(validFields);
    const result = await submitDealerAction(initialDealerState, fd);

    expect(result.status).toBe("success");
  });
});
