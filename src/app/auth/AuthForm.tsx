'use client';

import { useState, useEffect, FormEvent } from 'react';
import styles from './auth.module.css';

type AuthMode = 'signup' | 'login' | 'reset';

function CautionIcon() {
  return (
    <svg
      className={styles.cautionIcon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function AuthForm({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [docketNumber, setDocketNumber] = useState('');
  const [claimPin, setClaimPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [disabledExplain, setDisabledExplain] = useState<string | null>(null);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setErrors({});
    setDisabledExplain(null);
    setServerMsg(null);
    window.history.replaceState(null, '', `/auth?mode=${next}`);
  }

  function validateField(name: string, val: string): string {
    if (!val.trim()) {
      if (name === 'fullName') return 'Enter your full name as written on your laundry bag.';
      if (name === 'email') return 'Enter the email address for your order alerts.';
      if (name === 'phone') return 'Enter your Nigerian phone number so Musa can call on pickup.';
      if (name === 'docketNumber') return 'Enter the docket number from your shop receipt.';
      if (name === 'claimPin') return 'Choose a personal counter claim PIN.';
      if (name === 'password') return 'Enter a password for your account.';
    }
    if (mode === 'signup') {
      if (name === 'fullName' && (!val.trim().includes(' ') || val.trim().length < 3)) {
        return 'Enter at least two name words separated by a space.';
      }
      if (name === 'email' && !/^\S+@\S+$/.test(val.trim())) {
        return 'Enter a valid email address (for example name@domain.com).';
      }
      if (name === 'phone' && !/^0(70|80|81|90|91)\d{8}$/.test(val.trim())) {
        return 'Enter an 11-digit Nigerian mobile number starting with 070, 080, 081, 090, or 091.';
      }
      if (name === 'docketNumber' && Number(val) < 100) {
        return 'Docket number must be 100 or higher.';
      }
      if (name === 'claimPin' && (!/^\d{5,8}$/.test(val) || /^(\d)\1+$/.test(val))) {
        return 'Claim PIN must be 5 to 8 digits and not all identical.';
      }
      if (name === 'password' && val.length < 10) {
        return 'Password must be at least 10 characters long.';
      }
    }
    return '';
  }

  function handleBlur(name: string, val: string) {
    const err = validateField(name, val);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  const signupReady =
    mode === 'signup' &&
    !validateField('fullName', fullName) &&
    !validateField('email', email) &&
    !validateField('phone', phone) &&
    !validateField('docketNumber', docketNumber) &&
    !validateField('claimPin', claimPin) &&
    !validateField('password', password) &&
    termsAccepted;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setDisabledExplain(null);

    if (mode === 'login') {
      const emailErr = !/^\S+@\S+$/.test(email.trim())
        ? 'Enter a valid email address before signing in.'
        : '';
      const passErr = !password ? 'Enter your password.' : '';
      setErrors({ email: emailErr, password: passErr });
      if (emailErr || passErr) return;
      setServerMsg('Login flow will connect in Task 05.');
      return;
    }

    if (mode === 'reset') {
      const emailErr = !/^\S+@\S+$/.test(email.trim()) ? 'Enter your account email.' : '';
      setErrors({ email: emailErr });
      if (emailErr) return;
      setServerMsg('Reset flow will connect in Task 04/05.');
      return;
    }

    if (!signupReady) {
      const nextErrors = {
        fullName: validateField('fullName', fullName),
        email: validateField('email', email),
        phone: validateField('phone', phone),
        docketNumber: validateField('docketNumber', docketNumber),
        claimPin: validateField('claimPin', claimPin),
        password: validateField('password', password),
      };
      setErrors(nextErrors);
      if (!termsAccepted) {
        setDisabledExplain(
          'Accept the Fresh Fold Laundry record-keeping terms before creating your account.'
        );
      } else {
        setDisabledExplain('Fix the highlighted fields above before creating your account.');
      }
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        docketNumber: Number(docketNumber),
        claimPin,
        password,
        termsAccepted,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setServerMsg(`Account #${data.accountId} created.`);
    }
  }

  const passwordDescribedBy = [
    password.length > 0 ? 'password-hint' : null,
    errors.password ? 'password-error' : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Account actions">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
          onClick={() => switchMode('signup')}
        >
          Sign up
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
          onClick={() => switchMode('login')}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'reset'}
          className={`${styles.tabBtn} ${mode === 'reset' ? styles.tabBtnActive : ''}`}
          onClick={() => switchMode('reset')}
        >
          Reset password
        </button>
      </div>

      <h1 className={styles.heading}>
        {mode === 'signup'
          ? 'Create your customer record'
          : mode === 'login'
          ? 'Check your order records'
          : 'Reset your password'}
      </h1>
      <p className={styles.subtext}>
        {mode === 'signup'
          ? 'Link your shop notebook details so you only ever see your own laundry.'
          : mode === 'login'
          ? 'Sign in with the email and password on your account.'
          : 'Enter your email address to request a reset code.'}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {mode === 'signup' && (
          <div className={styles.fieldGroup}>
            <label htmlFor="fullName" className={styles.label}>
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              aria-required="true"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleBlur('fullName', fullName)}
            />
            {errors.fullName && (
              <div id="fullName-error" role="alert" className={styles.errorRow}>
                <CautionIcon />
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => {
              const next = e.target.value;
              setEmail(next);
              if (mode === 'signup') {
                setErrors((prev) => ({ ...prev, email: validateField('email', next) }));
              }
            }}
            onBlur={() => {
              if (mode === 'signup') handleBlur('email', email);
            }}
          />
          {errors.email && (
            <div id="email-error" role="alert" className={styles.errorRow}>
              <CautionIcon />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {mode === 'signup' && (
          <>
            <div className={styles.fieldGroup}>
              <label htmlFor="phone" className={styles.label}>
                Nigerian phone number
              </label>
              <input
                id="phone"
                type="tel"
                aria-required="true"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => handleBlur('phone', phone)}
              />
              {errors.phone && (
                <div id="phone-error" role="alert" className={styles.errorRow}>
                  <CautionIcon />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="docketNumber" className={styles.label}>
                Shop docket number
              </label>
              <input
                id="docketNumber"
                type="text"
                inputMode="numeric"
                aria-required="true"
                aria-invalid={Boolean(errors.docketNumber)}
                aria-describedby={errors.docketNumber ? 'docketNumber-error' : undefined}
                className={`${styles.input} ${errors.docketNumber ? styles.inputError : ''}`}
                value={docketNumber}
                onChange={(e) => setDocketNumber(e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('docketNumber', docketNumber)}
              />
              {errors.docketNumber && (
                <div id="docketNumber-error" role="alert" className={styles.errorRow}>
                  <CautionIcon />
                  <span>{errors.docketNumber}</span>
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="claimPin" className={styles.label}>
                Counter claim PIN
              </label>
              <input
                id="claimPin"
                type="text"
                inputMode="numeric"
                aria-required="true"
                aria-invalid={Boolean(errors.claimPin)}
                aria-describedby={errors.claimPin ? 'claimPin-error' : undefined}
                className={`${styles.input} ${errors.claimPin ? styles.inputError : ''}`}
                value={claimPin}
                onChange={(e) => setClaimPin(e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('claimPin', claimPin)}
              />
              {errors.claimPin && (
                <div id="claimPin-error" role="alert" className={styles.errorRow}>
                  <CautionIcon />
                  <span>{errors.claimPin}</span>
                </div>
              )}
            </div>
          </>
        )}

        {mode !== 'reset' && (
          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                aria-required="true"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={passwordDescribedBy}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password', password)}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {password.length > 0 && (
              <p id="password-hint" className={styles.hintText}>
                Use at least 10 characters (three ordinary words work well).
              </p>
            )}
            {errors.password && (
              <div id="password-error" role="alert" className={styles.errorRow}>
                <CautionIcon />
                <span>{errors.password}</span>
              </div>
            )}
          </div>
        )}

        {mode === 'signup' && (
          <>
            <div className={styles.termsText}>
              Fresh Fold Laundry stores your name, phone number, email, and garment counts
              solely to show your dated laundry and payment records. Financial records are
              retained for Nigerian tax audits; contact Chinedu Okafor on 0803 000 4120
              for record requests.
            </div>
            <div className={styles.checkboxRow}>
              <input
                id="termsAccepted"
                type="checkbox"
                aria-required="true"
                className={styles.checkboxInput}
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (e.target.checked) setDisabledExplain(null);
                }}
              />
              <label htmlFor="termsAccepted" className={styles.checkboxLabel}>
                I accept the Fresh Fold Laundry record-keeping terms and privacy notice.
              </label>
            </div>
          </>
        )}

        <button
          type="submit"
          aria-disabled={mode === 'signup' ? !signupReady : false}
          className={`${styles.submitBtn} ${
            mode === 'signup' && !signupReady ? styles.submitBtnDisabled : ''
          }`}
        >
          {mode === 'signup'
            ? 'Create account'
            : mode === 'login'
            ? 'Log in'
            : 'Send reset code'}
        </button>

        {disabledExplain && (
          <div role="alert" className={styles.statusExplain}>
            {disabledExplain}
          </div>
        )}

        {serverMsg && (
          <div role="status" className={styles.statusSuccess}>
            {serverMsg}
          </div>
        )}
      </form>
    </div>
  );
}
