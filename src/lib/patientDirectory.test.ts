import { describe, it, expect } from "vitest";
import { describeLastVisit, filterPatients, groupPatientsAlphabetically } from "./patientDirectory";
import type { Patient } from "@/types/patient";

function patient(overrides: Partial<Patient>): Patient {
  return {
    id: "pat_1",
    clinicId: "aster",
    fullName: "Pat Patient",
    email: "pat@example.com",
    phone: "+15550100000",
    patientType: "existing",
    primaryDoctorId: "nadia-farooqi",
    patientSince: "2024-01-01",
    ...overrides,
  };
}

describe("filterPatients", () => {
  const patients = [
    patient({ id: "1", fullName: "Maya Chen", email: "maya.chen@example.com", phone: "+15550192231" }),
    patient({ id: "2", fullName: "Owen Bricks", email: "owen.b@example.com", phone: "+15550487710" }),
  ];

  it("returns everything for an empty query", () => {
    expect(filterPatients(patients, "")).toHaveLength(2);
    expect(filterPatients(patients, "   ")).toHaveLength(2);
  });

  it("matches on name, case-insensitively", () => {
    expect(filterPatients(patients, "maya").map((p) => p.id)).toEqual(["1"]);
  });

  it("matches on email", () => {
    expect(filterPatients(patients, "owen.b@example.com").map((p) => p.id)).toEqual(["2"]);
  });

  it("matches on phone regardless of punctuation in the query", () => {
    expect(filterPatients(patients, "555-019-2231").map((p) => p.id)).toEqual(["1"]);
  });

  it("returns no matches when nothing fits", () => {
    expect(filterPatients(patients, "zzz-not-a-patient")).toHaveLength(0);
  });
});

describe("groupPatientsAlphabetically", () => {
  it("sorts by name and groups consecutive same-letter patients together", () => {
    const patients = [
      patient({ id: "1", fullName: "Zara Hussain" }),
      patient({ id: "2", fullName: "Amara Okafor" }),
      patient({ id: "3", fullName: "Ethan Walsh" }),
    ];
    const groups = groupPatientsAlphabetically(patients);
    expect(groups.map((g) => g.letter)).toEqual(["A", "E", "Z"]);
    expect(groups[0].patients.map((p) => p.id)).toEqual(["2"]);
  });

  it("keeps multiple patients sharing a letter in one group", () => {
    const patients = [
      patient({ id: "1", fullName: "Amara Okafor" }),
      patient({ id: "2", fullName: "Ash Patel" }),
    ];
    const groups = groupPatientsAlphabetically(patients);
    expect(groups).toHaveLength(1);
    expect(groups[0].patients.map((p) => p.id)).toEqual(["1", "2"]);
  });
});

describe("describeLastVisit", () => {
  const today = "2026-06-15";

  it("reports patients who have never been seen", () => {
    expect(describeLastVisit(undefined, today)).toBe("No visits yet");
  });

  it("reports today and yesterday distinctly", () => {
    expect(describeLastVisit("2026-06-15", today)).toBe("Seen today");
    expect(describeLastVisit("2026-06-14", today)).toBe("Seen yesterday");
  });

  it("reports days, weeks, months, and over a year in the right bands", () => {
    expect(describeLastVisit("2026-06-10", today)).toBe("Seen 5 days ago");
    expect(describeLastVisit("2026-05-15", today)).toBe("Seen 4 weeks ago");
    expect(describeLastVisit("2026-03-01", today)).toBe("Seen 4 months ago");
    expect(describeLastVisit("2024-01-01", today)).toBe("Seen over a year ago");
  });
});
