/**
 * Frontend-only account store backed by localStorage.
 *
 * SECURITY: passwords are stored in plaintext. This is acceptable for a
 * client-side demo with no backend, but must NOT be used in production —
 * real auth requires a server that stores only salted password hashes.
 */

const STORAGE_KEY = "domainexpansion.accounts";

function readAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // localStorage can be unavailable (private mode) or hold corrupt JSON.
    return [];
  }
}

function writeAccounts(accounts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Storage full or blocked — nothing we can recover here.
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/** Returns the stored account record (including password) or null. */
export function findAccount(email) {
  const target = normalizeEmail(email);
  return readAccounts().find((account) => account.email === target) || null;
}

/** Return only the public-facing fields — never expose the stored password. */
function toPublicUser(account) {
  return { id: account.id, name: account.name, email: account.email };
}

/**
 * Registers a new account. Returns { ok: true, user } on success, or
 * { ok: false, error } when an account with that email already exists.
 */
export function registerUser({ email, password }) {
  const normalized = normalizeEmail(email);

  if (findAccount(normalized)) {
    return {
      ok: false,
      error: "An account with this email already exists. Try logging in instead.",
    };
  }

  const account = {
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2, 11),
    name: normalized.split("@")[0],
    email: normalized,
    password,
  };

  const accounts = readAccounts();
  accounts.push(account);
  writeAccounts(accounts);

  return { ok: true, user: toPublicUser(account) };
}

/**
 * Verifies credentials against stored accounts. Returns { ok: true, user }
 * on a match, or { ok: false, error } for an unknown email / wrong password.
 */
export function authenticateUser({ email, password }) {
  const account = findAccount(email);

  if (!account) {
    return { ok: false, error: "No account found for that email. Please sign up first." };
  }
  if (account.password !== password) {
    return { ok: false, error: "Incorrect password. Please try again." };
  }

  return { ok: true, user: toPublicUser(account) };
}
