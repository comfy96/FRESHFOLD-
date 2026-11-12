'use client';

import { useState, useEffect, FormEvent } from 'react';
import styles from './auth.module.css';

type AuthMode = 'signup' | 'login' | 'reset';

// Stage 1 (Pre-Audit) Form:
// Intentionally retains 4 accessibility defects, <input type="number"> for docketNumber,
// decorative non-functional badge, and hidden submit button version so we can capture genuine
// BEFORE evidence before fixing each in Stage 2.
export default function AuthForm({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [docketNumber, setDocketNumber] = useState('0');
  const [claimPin, setClaimPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setErrors({});
    setTouched({});
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
    setTouched((prev) => ({ ...prev, [name]: true }));
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

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Account actions">
        <button
          type="button"
          className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
          onClick={() => switchMode('signup')}
        >
          Sign up
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
          onClick={() => switchMode('login')}
        >
          Log in
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${mode === 'reset' ? styles.tabBtnActive : ''}`}
          onClick={() => switchMode('reset')}
        >
          Reset password
        </button>
      </div>

      {/* Decorative non-functional badge (to be removed in Step 2) */}
      <div className={styles.decorativeBadge}>Fresh Fold Member Ledger</div>

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
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleBlur('fullName', fullName)}
            />
            {errors.fullName && <div className={styles.errorRow}>{errors.fullName}</div>}
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email address
          </label>
          <input
            id="email"
            type="email"
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
          {errors.email && <div className={styles.errorRow}>{errors.email}</div>}
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
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => handleBlur('phone', phone)}
              />
              {errors.phone && <div className={styles.errorRow}>{errors.phone}</div>}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="docketNumber" className={styles.label}>
                Shop docket number
              </label>
              {/* Intentionally number input in Stage 1 to capture default-0/spinner bug */}
              <input
                id="docketNumber"
                type="number"
                className={`${styles.input} ${errors.docketNumber ? styles.inputError : ''}`}
                value={docketNumber}
                onChange={(e) => setDocketNumber(e.target.value)}
                onBlur={() => handleBlur('docketNumber', docketNumber)}
              />
              {errors.docketNumber && <div className={styles.errorRow}>{errors.docketNumber}</div>}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="claimPin" className={styles.label}>
                Counter claim PIN
              </label>
              <input
                id="claimPin"
                type="text"
                inputMode="numeric"
                className={`${styles.input} ${errors.claimPin ? styles.inputError : ''}`}
                value={claimPin}
                onChange={(e) => setClaimPin(e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('claimPin', claimPin)}
              />
              {errors.claimPin && <div className={styles.errorRow}>{errors.claimPin}</div>}
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
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password', password)}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {password.length > 0 && (
              <p className={styles.hintText}>
                Use at least 10 characters (three ordinary words work well).
              </p>
            )}
            {errors.password && <div className={styles.errorRow}>{errors.password}</div>}
          </div>
        )}

        {mode === 'signup' && (
          <div className={styles.checkboxRow}>
            <input
              id="termsAccepted"
              type="checkbox"
              className={styles.checkboxInput}
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span className={styles.checkboxLabel}>
              I accept the Fresh Fold Laundry record-keeping terms and privacy notice.
            </span>
          </div>
        )}

        {/* Stage 1 hidden button version for signup */}
        {(mode !== 'signup' || signupReady) && (
          <button type="submit" className={styles.submitBtn}>
            {mode === 'signup'
              ? 'Create account'
              : mode === 'login'
              ? 'Log in'
              : 'Send reset code'}
          </button>
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
