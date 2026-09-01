import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookingForm } from "@/components/booking/BookingForm";
import type { ServiceOffering } from "@/types/content";
import type { BookingRequest } from "@/types/booking";

// BookingForm reads a `service` query param via next/navigation's
// useSearchParams(), which has no real router context in a bare RTL
// render — stub it the same way the App Router would provide it.
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const SERVICES: ServiceOffering[] = [
  {
    id: "checkups-cleanings",
    name: "Check-ups & cleanings",
    tag: "every 6 months",
    description: "Routine care.",
    accentWord: "fresh start",
    swatch: "primary",
  },
  {
    id: "cosmetic-whitening",
    name: "Cosmetic & whitening",
    tag: "consult first",
    description: "Brightening.",
    accentWord: "new smile",
    swatch: "accent",
  },
];

function futureDateIso(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full name"), "Imran Qureshi");
  await user.type(screen.getByLabelText("Email"), "imran@example.com");
  await user.type(screen.getByLabelText("Phone"), "+1 555 201 9988");
  await user.click(screen.getByRole("radio", { name: "First visit" }));
  await user.selectOptions(screen.getByLabelText("Treatment"), "checkups-cleanings");
  const dateInput = screen.getByLabelText("Preferred date");
  await user.clear(dateInput);
  await user.type(dateInput, futureDateIso(5));
  await user.click(screen.getByRole("radio", { name: "Morning" }));
}

describe("BookingForm", () => {
  const onSuccess = vi.fn();

  beforeEach(() => {
    onSuccess.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders every required field", () => {
    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Patient type" })).toBeInTheDocument();
    expect(screen.getByLabelText("Treatment")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred date")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Preferred time of day" })).toBeInTheDocument();
    expect(screen.getByLabelText("Anything we should know? (optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request this appointment/i })).toBeInTheDocument();
  });

  it("shows every service as a selectable option", () => {
    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);
    const select = screen.getByLabelText("Treatment") as HTMLSelectElement;
    const optionLabels = within(select)
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(optionLabels).toEqual(
      expect.arrayContaining(["Check-ups & cleanings", "Cosmetic & whitening"]),
    );
  });

  it("blocks submission and shows friendly errors when the form is empty", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);
    await user.click(screen.getByRole("button", { name: /request this appointment/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getAllByText(/let us know what to call you/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/we'll need an email/i).length).toBeGreaterThan(0);
    // never attempted the network call — nothing was submitted
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("rejects an invalid email specifically, not just \"invalid form\"", async () => {
    const user = userEvent.setup();
    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);

    await fillValidForm(user);
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /request this appointment/i }));

    expect((await screen.findAllByText(/email doesn't look quite right/i)).length).toBeGreaterThan(0);
  });

  it("rejects an invalid phone number specifically", async () => {
    const user = userEvent.setup();
    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);

    await fillValidForm(user);
    await user.clear(screen.getByLabelText("Phone"));
    await user.type(screen.getByLabelText("Phone"), "12");
    await user.click(screen.getByRole("button", { name: /request this appointment/i }));

    expect((await screen.findAllByText(/phone number doesn't look quite right/i)).length).toBeGreaterThan(0);
  });

  it("submits successfully, shows a loading state, and calls onSuccess with the created booking", async () => {
    const user = userEvent.setup();
    let resolveFetch!: (value: unknown) => void;
    const fetchSpy = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /request this appointment/i }));

    // loading state appears while the request is in flight
    expect(await screen.findByRole("button", { name: /sending your request/i })).toBeDisabled();

    const fakeBooking: BookingRequest = {
      id: "bkg_test123",
      clinicId: "aster",
      patient: {
        fullName: "Imran Qureshi",
        email: "imran@example.com",
        phone: "+1 555 201 9988",
        patientType: "new",
      },
      serviceId: "checkups-cleanings",
      preferredDate: futureDateIso(5),
      preferredTime: "morning",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    resolveFetch({
      ok: true,
      json: async () => ({ ok: true, booking: fakeBooking }),
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(fakeBooking));

    // request body actually contains what the patient typed
    const [, requestInit] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    const body = JSON.parse(requestInit.body as string);
    expect(body).toMatchObject({
      clinicId: "aster",
      fullName: "Imran Qureshi",
      email: "imran@example.com",
      serviceId: "checkups-cleanings",
      preferredTime: "morning",
    });
  });

  it("shows a clear error state when the booking service fails, and lets the patient try again", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ ok: false, message: "Something went wrong on our end. Please try again." }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          booking: {
            id: "bkg_retry",
            clinicId: "aster",
            patient: {
              fullName: "Imran Qureshi",
              email: "imran@example.com",
              phone: "+1 555 201 9988",
              patientType: "new",
            },
            serviceId: "checkups-cleanings",
            preferredDate: futureDateIso(5),
            preferredTime: "morning",
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    vi.stubGlobal("fetch", fetchSpy);

    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: /request this appointment/i }));
    expect(await screen.findByText(/something went wrong on our end/i)).toBeInTheDocument();

    // the form did NOT clear the patient's input after a failure —
    // nothing should be lost
    expect(screen.getByLabelText("Full name")).toHaveValue("Imran Qureshi");

    // button is usable again (not stuck disabled) and a retry succeeds
    const submitButton = screen.getByRole("button", { name: /request this appointment/i });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("does not allow a second submission while one is already in flight", async () => {
    const user = userEvent.setup();
    let resolveCount = 0;
    const fetchSpy = vi.fn(() => {
      resolveCount += 1;
      return new Promise(() => {
        /* never resolves during this test */
      });
    });
    vi.stubGlobal("fetch", fetchSpy);

    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);
    await fillValidForm(user);

    const submitButton = screen.getByRole("button", { name: /request this appointment/i });
    await user.click(submitButton);
    // a second, rapid click while submitting should not fire another request
    await user.click(submitButton);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    expect(resolveCount).toBe(1);
  });

  it("shows a network-failure message when fetch itself rejects", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    render(<BookingForm clinicId="aster" services={SERVICES} onSuccess={onSuccess} />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /request this appointment/i }));

    expect(await screen.findByText(/couldn't reach the server/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
