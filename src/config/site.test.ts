import { describe, expect, it } from "vitest";
import { footerNav, headerCta, primaryNav } from "./site";

describe("primary navigation", () => {
  const requiredRoutes = [
    "/",
    "/giai-phap",
    "/san-pham",
    "/tu-van-bac-si",
    "/kien-thuc",
    "/vetjoy-app",
    "/ve-vetjoy",
  ];

  it("includes every required top-level route exactly once", () => {
    const hrefs = primaryNav.map((item) => item.href);
    for (const route of requiredRoutes) {
      expect(hrefs.filter((h) => h === route)).toHaveLength(1);
    }
  });

  it("points the header CTA at the consultation page", () => {
    expect(headerCta.href).toBe("/tu-van-bac-si");
  });
});

describe("footer navigation", () => {
  it("includes the dealer, contact and policy pages", () => {
    const hrefs = footerNav.map((item) => item.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/dai-ly",
        "/lien-he",
        "/chinh-sach-bao-mat",
        "/dieu-khoan-su-dung",
      ])
    );
  });
});
