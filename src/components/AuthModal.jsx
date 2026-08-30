import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Circle, Eye, EyeOff, X } from "lucide-react";
import { getPasswordChecks, validateAuthForm } from "../utils/validateAuthForm.js";
import { authenticateUser, registerUser } from "../utils/authStore.js";

const ACTION = {
  SIGNIN: "signin",
  SIGNUP: "signup",
};

const TABS = [
  { id: ACTION.SIGNIN, label: "Login" },
  { id: ACTION.SIGNUP, label: "Sign Up" },
];

const INITIAL_FORM_STATE = {
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthModal({ onAuthSuccess, onClose }) {
  // Which tab is active — Login (verify existing account) or Sign Up (create one).
  const [mode, setMode] = useState(ACTION.SIGNIN);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const isLogin = mode === ACTION.SIGNIN;

  useEffect(() => {
    firstInputRef.current?.focus();

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    // Lock background scroll while the modal is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  }, [onClose]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // Switching tabs resets validation state and the sign-up-only confirm field
  // so stale errors from the other mode don't linger.
  const handleModeChange = useCallback((nextMode) => {
    setMode(nextMode);
    setErrors({});
    setPasswordFocused(false);
    setFormData((prev) => ({ ...prev, confirmPassword: "" }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    const validation = validateAuthForm(mode, formData);
    // Setting the result clears any stale submit error (e.g. "Incorrect
    // password") on a now-valid form before we start the async submit.
    setErrors(validation.errors);
    if (!validation.valid) {
      return;
    }

    setSubmitting(true);

    try {
      // Brief delay so the spinner is perceptible; the store itself is sync.
      await new Promise((resolve) => setTimeout(resolve, 600));

      const credentials = { email: formData.email, password: formData.password };
      const result = isLogin ? authenticateUser(credentials) : registerUser(credentials);

      if (!result.ok) {
        setErrors({ submit: result.error });
        return;
      }

      // Sign-up logs the new account in immediately.
      onAuthSuccess(result.user);
    } catch (error) {
      setErrors({ submit: error.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }, [mode, isLogin, formData, onAuthSuccess]);

  const showChecklist =
    passwordFocused || formData.password.length > 0 || Boolean(errors.password);

  // Rendered through a portal on document.body so it escapes the app's
  // `.site-shell` wrapper — that wrapper has a global rule forcing all text
  // white, which would otherwise kill the gray hierarchy and red error text.
  return createPortal(
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0618]/70 backdrop-blur-sm overflow-y-auto overflow-x-hidden animate-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/25 rounded-full blur-3xl pointer-events-none" />

      <div className="auth-panel animate-panel relative w-full max-w-md bg-[#211c40]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-purple-300/70 hover:text-white transition-colors rounded focus:outline-none focus:ring-2 focus:ring-purple-400/50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <header className="mb-6 text-center">
          <div key={mode} className="animate-swap">
            <h2
              id="auth-modal-title"
              className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-transparent"
            >
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-purple-200/60">
              {isLogin ? "Log in to continue" : "Sign up to get started"}
            </p>
          </div>
        </header>

        {/* Tab switcher — a pill slides between Login and Sign Up. */}
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="relative mb-6 grid grid-cols-2 p-1 rounded-lg bg-black/25 border border-white/10"
        >
          {/* Sliding active-tab indicator; glides on mode change. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%_-_0.25rem)] rounded-md bg-violet-700 shadow transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
              isLogin ? "translate-x-0" : "translate-x-full"
            }`}
          />
          {TABS.map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleModeChange(tab.id)}
                className={`relative z-10 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                  active ? "text-white" : "text-purple-200/70 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField
            ref={firstInputRef}
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            error={errors.email}
            placeholder="you@example.com"
            onChange={(value) => handleChange("email", value)}
            autoComplete="email"
            required
          />

          {/* Fields swap on tab change; keying on `mode` replays the animation. */}
          <div key={mode} className="animate-swap space-y-4">
            {isLogin ? (
              <PasswordField
                id="password"
                label="Password"
                value={formData.password}
                error={errors.password}
                placeholder="••••••••"
                onChange={(value) => handleChange("password", value)}
                autoComplete="current-password"
                required
              />
            ) : (
              <>
                <div>
                  <PasswordField
                    id="password"
                    label="Create Password"
                    value={formData.password}
                    placeholder="••••••••"
                    onChange={(value) => handleChange("password", value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    autoComplete="new-password"
                    describedBy="password-requirements"
                    required
                  />
                  {showChecklist && (
                    <PasswordChecklist
                      id="password-requirements"
                      password={formData.password}
                      invalid={Boolean(errors.password)}
                    />
                  )}
                </div>

                <PasswordField
                  id="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  onChange={(value) => handleChange("confirmPassword", value)}
                  autoComplete="new-password"
                />
              </>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg" role="alert">
              <p className="text-sm text-red-300">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-[#211c40]"
          >
            {submitting ? (
              <>
                <Spinner />
                <span>{isLogin ? "Logging in…" : "Signing up…"}</span>
              </>
            ) : isLogin ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <footer className="mt-6 text-center text-xs text-purple-200/50">
          {isLogin ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => handleModeChange(ACTION.SIGNUP)}
                className="text-fuchsia-300 hover:text-fuchsia-200 font-medium focus:outline-none focus:underline"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleModeChange(ACTION.SIGNIN)}
                className="text-fuchsia-300 hover:text-fuchsia-200 font-medium focus:outline-none focus:underline"
              >
                Log in
              </button>
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}

function Spinner() {
  return (
    <span
      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
      aria-hidden="true"
    />
  );
}

function PasswordChecklist({ id, password, invalid }) {
  const checks = getPasswordChecks(password);
  return (
    <ul id={id} className="mt-2 space-y-1" aria-label="Password requirements">
      {checks.map(({ id: ruleId, label, passed }) => (
        <li
          key={ruleId}
          className={`flex items-center gap-2 text-xs transition-colors ${
            passed ? "text-emerald-300" : invalid ? "text-red-300" : "text-purple-200/50"
          }`}
        >
          {passed ? (
            <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <Circle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          )}
          <span>{label}</span>
          <span className="sr-only">{passed ? " (met)" : " (not met)"}</span>
        </li>
      ))}
    </ul>
  );
}

const FormField = React.forwardRef(function FormField(
  { id, label, type, value, error, placeholder, onChange, autoComplete, required },
  ref
) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-purple-100/80 mb-1.5">
        {label}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full px-4 py-2.5 bg-black/25 border border-white/10 rounded-lg text-white placeholder:text-purple-200/30 outline-none focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/50 transition"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

const PasswordField = React.forwardRef(function PasswordField(
  { id, label, value, error, placeholder, onChange, onFocus, onBlur, autoComplete, required, describedBy },
  ref
) {
  const [visible, setVisible] = useState(false);
  const describedByIds = [error ? `${id}-error` : null, describedBy].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-purple-100/80 mb-1.5">
        {label}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedByIds || undefined}
          className="w-full px-4 py-2.5 pr-11 bg-black/25 border border-white/10 rounded-lg text-white placeholder:text-purple-200/30 outline-none focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/50 transition"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className={`absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
            visible ? "text-violet-300" : "text-purple-300/60 hover:text-purple-200"
          }`}
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
