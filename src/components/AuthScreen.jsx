import { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon } from './Icons';
import { getPasswordChecks, validateAuthForm } from '../utils/validateAuthForm';
import panelImage from '../assets/auth-panel.jpg';
import './AuthScreen.css';

const COPY = {
  signup: {
    title: 'Create an account to save the domains you’re comparing',
    switchPrompt: 'Already have an account?',
    switchLabel: 'Log in',
    submit: 'Create account',
    notice: 'Sign-up isn’t open yet, so nothing was saved. Your details look good, though.',
    docTitle: 'Sign up · PriceMyDomain',
  },
  login: {
    title: 'Log in to pick up where you left off',
    switchPrompt: 'New to PriceMyDomain?',
    switchLabel: 'Sign up',
    submit: 'Log in',
    notice: 'Logging in isn’t available yet, so nothing was sent.',
    docTitle: 'Log in · PriceMyDomain',
  },
};

const EMPTY = { name: '', email: '', password: '' };

// Accounts don't exist yet: the form validates input and then says so,
// without storing or sending anything.
export default function AuthScreen({ mode, onClose, onSwitch }) {
  const isSignup = mode === 'signup';
  const copy = COPY[mode];
  const other = isSignup ? 'login' : 'signup';

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    const previous = document.title;
    document.title = copy.docTitle;
    return () => {
      document.title = previous;
    };
  }, [copy.docTitle]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const update = (field) => (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitted(false);
    if (errors[field]) {
      setErrors(({ [field]: _removed, ...rest }) => rest);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fields = isSignup ? form : { email: form.email, password: form.password };
    const result = validateAuthForm(isSignup ? 'signup' : 'signin', fields);
    setErrors(result.errors);
    setSubmitted(result.valid);
    if (!result.valid) {
      const firstInvalid = ['name', 'email', 'password'].find((f) => result.errors[f]);
      document.getElementById(`auth-${firstInvalid}`)?.focus();
    }
  };

  const switchMode = (e) => {
    e.preventDefault();
    // Each mode starts clean; the email carries over so switching isn't a chore.
    setErrors({});
    setSubmitted(false);
    setShowPassword(false);
    setForm((prev) => ({ ...EMPTY, email: prev.email }));
    onSwitch(other);
  };

  const showChecklist = isSignup && (passwordFocused || form.password || errors.password);

  return (
    <div className="auth">
      <aside className="auth-panel">
        <img className="auth-panel-img" src={panelImage} alt="" width="1200" height="1614" />
      </aside>

      <main className="auth-main">
        <div className="auth-body">
          <div className="auth-topbar">
            <button type="button" className="auth-back" onClick={onClose}>
              <ArrowLeftIcon size={18} />
              <span className="sr-only">Back to the homepage</span>
            </button>
            <p className="auth-switch">
              <span>{copy.switchPrompt}</span>
              <a href={`#${other}`} className="auth-switch-link" onClick={switchMode}>
                {copy.switchLabel}
              </a>
            </p>
          </div>

          <h1 className="auth-title" key={mode}>
            {copy.title}
          </h1>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <Field
                ref={firstFieldRef}
                id="auth-name"
                label="Name"
                autoComplete="name"
                value={form.name}
                onChange={update('name')}
                error={errors.name}
              />
            )}

            <Field
              ref={isSignup ? undefined : firstFieldRef}
              id="auth-email"
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
            />

            <Field
              id="auth-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={update('password')}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              error={errors.password}
              describedBy={showChecklist ? 'auth-password-rules' : undefined}
              action={
                <button
                  type="button"
                  className="auth-reveal"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              }
            >
              {showChecklist && <PasswordRules password={form.password} />}
            </Field>

            <button type="submit" className="auth-submit">
              <span>{copy.submit}</span>
              <span className="auth-submit-icon" aria-hidden="true">
                <ArrowRightIcon size={18} />
              </span>
            </button>

            <p className="auth-notice" role="status">
              {submitted ? copy.notice : ''}
            </p>
          </form>

          <p className="auth-legal">
            By {isSignup ? 'creating an account' : 'logging in'}, you agree to PriceMyDomain’s
            Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ ref, id, label, error, describedBy, action, children, ...input }) {
  const errorId = error ? `${id}-error` : null;
  const described = [errorId, describedBy].filter(Boolean).join(' ') || undefined;

  return (
    <div className="auth-field-wrap">
      <div className={`auth-field ${error ? 'is-invalid' : ''}`}>
        <label htmlFor={id}>{label}</label>
        <input
          ref={ref}
          id={id}
          type="text"
          aria-invalid={error ? true : undefined}
          aria-describedby={described}
          {...input}
        />
        {action}
      </div>
      {error && (
        <p className="auth-error" id={errorId}>
          {error}
        </p>
      )}
      {children}
    </div>
  );
}

function PasswordRules({ password }) {
  return (
    <ul className="auth-rules" id="auth-password-rules" aria-label="Password needs">
      {getPasswordChecks(password).map((rule) => (
        <li key={rule.id} className={rule.passed ? 'is-met' : ''}>
          <span className="auth-rule-mark" aria-hidden="true">
            {rule.passed && <CheckIcon size={12} />}
          </span>
          {rule.label}
          <span className="sr-only">{rule.passed ? ', done' : ', not yet'}</span>
        </li>
      ))}
    </ul>
  );
}
