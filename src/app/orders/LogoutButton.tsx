'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './orders.module.css';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  async function handleLogout(force = false) {
    setLoading(true);
    setNetworkError(null);

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      // Successful server revocation confirmed
      router.push('/auth?mode=login');
      router.refresh();
    } catch (err) {
      // DO NOT LIE TO THE USER. If the network failed, the server session is still active!
      if (force) {
        // Emergency user override when network is permanently offline
        router.push('/auth?mode=login');
        router.refresh();
      } else {
        const msg = err instanceof Error ? err.message : 'Network connection failed';
        setNetworkError(
          `Network issue (${msg}): The shop server could not be reached to delete your active session row. Your session may still be active in the ledger. Please check your internet or tap Retry.`
        );
        setLoading(false);
      }
    }
  }

  return (
    <div style={{ textAlign: 'right' }}>
      <button
        type="button"
        className={styles.logoutButton}
        onClick={() => handleLogout(false)}
        disabled={loading}
      >
        {loading ? 'Revoking…' : 'Sign out'}
      </button>

      {networkError && (
        <div
          role="alert"
          style={{
            marginTop: '0.5rem',
            padding: '0.625rem',
            background: 'var(--color-surface-container)',
            border: '1px solid var(--color-error)',
            borderRadius: '0.375rem',
            fontSize: '12px',
            color: 'var(--color-error)',
            textAlign: 'left',
          }}
        >
          <p style={{ margin: '0 0 0.5rem' }}>{networkError}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleLogout(false)}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Retry Logout
            </button>
            <button
              type="button"
              onClick={() => handleLogout(true)}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: 'transparent',
                color: 'var(--color-on-surface-variant)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Force Leave Anyway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
