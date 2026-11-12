'use client';

import { useState, FormEvent } from 'react';
import styles from './pickup.module.css';

export default function PickupForm() {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [itemCount, setItemCount] = useState('1');
  const [serviceMode, setServiceMode] = useState('collect');
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      await fetch('/api/pickup-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          itemCount: Number(itemCount),
          serviceMode,
          notes,
        }),
      });
      // INTENTIONAL STEP 6 DIAGNOSTIC BUG: assumes fetch succeeded without checking response.ok
      setStatusMessage('Our records show your pickup request was saved.');
    } catch {
      setStatusMessage('Our records show your pickup request was saved.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label htmlFor="customerName" className={styles.label}>
          Your full name
        </label>
        <input
          id="customerName"
          name="customerName"
          type="text"
          className={styles.input}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="phone" className={styles.label}>
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={styles.input}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="itemCount" className={styles.label}>
          Approximate number of clothes
        </label>
        <input
          id="itemCount"
          name="itemCount"
          type="text"
          inputMode="numeric"
          className={styles.input}
          value={itemCount}
          onChange={(e) => setItemCount(e.target.value.replace(/\D/g, ''))}
          required
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="serviceMode" className={styles.label}>
          Collection or drop-off
        </label>
        <select
          id="serviceMode"
          name="serviceMode"
          className={styles.select}
          value={serviceMode}
          onChange={(e) => setServiceMode(e.target.value)}
        >
          <option value="collect">Collect from my home</option>
          <option value="dropoff">I will bring them to the shop</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="notes" className={styles.label}>
          Notes for Chinedu or staff (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button type="submit" className={styles.submitBtn} disabled={submitting}>
        {submitting ? 'Recording...' : 'Record pickup request'}
      </button>

      {statusMessage && (
        <div role="status" className={styles.statusSuccess}>
          {statusMessage}
        </div>
      )}
    </form>
  );
}
