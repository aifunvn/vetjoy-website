import { beforeEach, describe, expect, it } from "vitest";
import { captureUtmFromLocation, extractUtmFromSearchParams, getStoredUtm } from "./utm";

describe("extractUtmFromSearchParams", () => {
  it("extracts recognised utm_* keys and ignores everything else", () => {
    const params = new URLSearchParams(
      "utm_source=facebook&utm_campaign=spring&other=ignore-me"
    );
    expect(extractUtmFromSearchParams(params)).toEqual({
      utm_source: "facebook",
      utm_campaign: "spring",
    });
  });

  it("returns an empty object when no utm params are present", () => {
    const params = new URLSearchParams("foo=bar");
    expect(extractUtmFromSearchParams(params)).toEqual({});
  });
});

describe("captureUtmFromLocation + getStoredUtm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists utm params from the current URL to localStorage", () => {
    window.history.pushState({}, "", "/tu-van-bac-si?utm_source=zalo&utm_medium=social");
    captureUtmFromLocation();

    expect(getStoredUtm()).toEqual({ utm_source: "zalo", utm_medium: "social" });
  });

  it("does not overwrite stored utm data when the URL has no utm params", () => {
    window.history.pushState({}, "", "/?utm_source=facebook");
    captureUtmFromLocation();

    window.history.pushState({}, "", "/giai-phap");
    captureUtmFromLocation();

    expect(getStoredUtm()).toEqual({ utm_source: "facebook" });
  });
});
