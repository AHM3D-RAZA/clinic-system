import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safeNextPath";

describe("safeNextPath", () => {
  it.each(["/dashboard", "/dashboard/patients", "/dashboard/patients/p_1?tab=x", "/dashboard?x=1"])("keeps %s", (path) => {
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([undefined, null, "", "dashboard", "https://evil.test", "//evil.test", "/\\evil.test", "/book", "/dashboardx", "/dashboard\n/x"])(
    "falls back to /dashboard for %j",
    (path) => {
      expect(safeNextPath(path)).toBe("/dashboard");
    },
  );
});
