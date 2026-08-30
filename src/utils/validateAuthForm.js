/**
 * Client-side validation for auth forms.
 * Returns { valid: boolean, errors: { field: string, ... } }
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Single source of truth for password rules — used both to block submission
// and to render the live requirement checklist as the user types.
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { id: "uppercase", label: "At least one uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { id: "special", label: "At least one special character", test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
];

/** Returns each rule with a `passed` flag for the given password. */
export function getPasswordChecks(password = "") {
  return PASSWORD_RULES.map(({ id, label, test }) => ({
    id,
    label,
    passed: test(password),
  }));
}

export function validateAuthForm(mode, formData) {
  const errors = {};

  validateEmail(formData.email, errors);

  if (mode === "signup") {
    // Sign-up creates a brand-new password, so it must satisfy every rule
    // and match the confirmation field.
    validatePassword(formData.password, errors);
    validateConfirmPassword(formData.password, formData.confirmPassword, errors);
  } else {
    // Login checks an existing password — only require that one was entered;
    // whether it's correct is decided by authenticateUser against the store.
    validateLoginPassword(formData.password, errors);
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function validateEmail(email, errors) {
  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address";
  }
}

function validatePassword(password, errors) {
  if (!password) {
    errors.password = "Password is required";
    return;
  }
  if (PASSWORD_RULES.some((rule) => !rule.test(password))) {
    errors.password = "Password does not meet all requirements";
  }
}

function validateLoginPassword(password, errors) {
  if (!password) {
    errors.password = "Password is required";
  }
}

function validateConfirmPassword(password, confirmPassword, errors) {
  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
}
