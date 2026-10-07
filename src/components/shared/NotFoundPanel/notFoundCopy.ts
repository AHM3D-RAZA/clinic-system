import type { NotFoundAction } from ".";

interface NotFoundCopy {
  title: string;
  body: string;
  primary: NotFoundAction;
  secondary: NotFoundAction;
}

/** Words for the public site's 404. */
export const SITE_NOT_FOUND: NotFoundCopy = {
  title: "We can't find that page.",
  body: "The link may be out of date, or the address has a typo. Either way, here are two ways back.",
  primary: { href: "/", label: "Back to the front page" },
  secondary: { href: "/book", label: "Book a visit" },
};

/** Words for a 404 inside the staff dashboard. */
export const DASHBOARD_NOT_FOUND: NotFoundCopy = {
  title: "That dashboard page doesn't exist.",
  body: "Check the address, or head back to a page that does.",
  primary: { href: "/dashboard", label: "Back to Overview" },
  secondary: { href: "/dashboard/appointments", label: "Open Appointments" },
};
