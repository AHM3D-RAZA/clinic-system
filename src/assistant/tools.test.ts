import { beforeEach, describe, expect, it } from "vitest";
import {
  createBookingRequestTool,
  findService,
  getBookingRules,
  getClinicInformation,
  getServiceInformation,
  searchClinicKnowledge,
} from "@/assistant/tools";
import { bookingRequestsTable } from "@/data/mockDb";
import { asterClinicConfig } from "@/content/aster/clinic";
import { asterServices } from "@/content/aster/content";
import { asterKnowledge } from "@/content/aster/knowledge";

describe("getClinicInformation", () => {
  it("returns only the fields a receptionist would give out, not the full config", () => {
    const info = getClinicInformation(asterClinicConfig);
    expect(info).toEqual({
      name: asterClinicConfig.name,
      phone: asterClinicConfig.contact.phone,
      email: asterClinicConfig.contact.email,
      address: asterClinicConfig.contact.address,
      hours: asterClinicConfig.contact.hours,
    });
  });
});

describe("getBookingRules", () => {
  it("reflects the clinic's actual configured booking settings", () => {
    const rules = getBookingRules(asterClinicConfig);
    expect(rules.feeMode).toBe(asterClinicConfig.bookingSettings.feeMode);
    expect(rules.automationMode).toBe(asterClinicConfig.bookingSettings.automationMode);
    expect(rules.cancellationNotice).toBeTruthy();
  });
});

describe("findService", () => {
  it("finds a service by a matching keyword in its name", () => {
    const result = findService(asterServices, "whitening");
    expect(result?.id).toBe("cosmetic-whitening");
  });

  it("finds a service by its accent word", () => {
    const result = findService(asterServices, "little smiles");
    expect(result?.id).toBe("kids-dentistry");
  });

  it("returns undefined for a query matching nothing", () => {
    expect(findService(asterServices, "brain surgery")).toBeUndefined();
  });

  it("returns undefined for empty input rather than matching everything", () => {
    expect(findService(asterServices, "   ")).toBeUndefined();
  });
});

describe("getServiceInformation", () => {
  it("returns the full service record for a known id", () => {
    expect(getServiceInformation(asterServices, "checkups-cleanings")?.name).toBe("Check-ups & cleanings");
  });

  it("returns undefined for an unknown id", () => {
    expect(getServiceInformation(asterServices, "not-real")).toBeUndefined();
  });
});

describe("searchClinicKnowledge", () => {
  it("finds the parking entry from a natural-language question", () => {
    const results = searchClinicKnowledge(asterKnowledge, "where can I park my car");
    expect(results[0]?.id).toBe("parking");
  });

  it("returns an empty array when nothing matches", () => {
    expect(searchClinicKnowledge(asterKnowledge, "spaceship warp drive")).toEqual([]);
  });

  it("ranks entries matching more terms higher", () => {
    const results = searchClinicKnowledge(asterKnowledge, "insurance payment cost coverage");
    expect(results[0]?.id).toBe("insurance");
  });
});

describe("createBookingRequestTool", () => {
  beforeEach(() => {
    bookingRequestsTable.__resetForTests();
  });

  it("creates a real booking through the actual service layer, not a mock return value", async () => {
    const booking = await createBookingRequestTool({
      clinicId: "aster",
      patient: {
        fullName: "Tool Test Patient",
        email: "tool@example.com",
        phone: "555-000-2222",
        patientType: "new",
      },
      serviceId: "checkups-cleanings",
      preferredDate: "2099-05-01",
      preferredTime: "morning",
    });

    expect(booking.id).toEqual(expect.stringMatching(/^bkg_/));
    // reading it back through the table proves this went through the
    // real persistence boundary, not just a locally-returned object
    expect(bookingRequestsTable.findById(booking.id)).toEqual(booking);
  });
});
