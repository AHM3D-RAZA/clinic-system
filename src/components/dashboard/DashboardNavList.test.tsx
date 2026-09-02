import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardNavList } from "./DashboardNavList";
import type { DashboardNavItem } from "@/types/dashboard";

const items: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: "overview", implemented: true },
  { id: "patients", label: "Patients", href: "/dashboard/patients", icon: "patients", implemented: false },
];

describe("DashboardNavList", () => {
  it("renders an implemented item as a real link", () => {
    render(<DashboardNavList items={items} currentPath="/dashboard" />);
    const link = screen.getByRole("link", { name: "Overview" });
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("marks the current route's link as the active page", () => {
    render(<DashboardNavList items={items} currentPath="/dashboard" />);
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  });

  it("does not mark a link active when it isn't the current route", () => {
    render(<DashboardNavList items={items} currentPath="/dashboard/somewhere-else" />);
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  });

  it("renders an unimplemented item as a disabled entry, not a link", () => {
    render(<DashboardNavList items={items} currentPath="/dashboard" />);
    expect(screen.queryByRole("link", { name: /Patients/ })).not.toBeInTheDocument();
    expect(screen.getByText("Patients").closest("span")).toHaveAttribute("aria-disabled", "true");
  });

  it("shows a 'Soon' tag on unimplemented items", () => {
    render(<DashboardNavList items={items} currentPath="/dashboard" />);
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });

  it("calls onNavigate when an implemented link is clicked", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    render(<DashboardNavList items={items} currentPath="/dashboard" onNavigate={onNavigate} />);
    await user.click(screen.getByRole("link", { name: "Overview" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
