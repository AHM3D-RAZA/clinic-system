/** A configured staff account, as parsed from the STAFF_ACCOUNTS env var. */
export interface StaffAccount {
  email: string;
  name: string;
  /** Optional job title shown under the name, e.g. "Front desk". */
  title?: string;
  /** `scrypt.<salt>.<hash>` — see passwordHash.ts. Never a plain password. */
  passwordHash: string;
}

/** What the UI is allowed to know about the signed-in person. */
export interface StaffIdentity {
  email: string;
  name: string;
  title?: string;
  initials: string;
}
