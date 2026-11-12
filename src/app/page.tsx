import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.viewport}>
      <section className={styles.ledgerShell} aria-labelledby="scaffold-title">
        <p className={styles.brandHeader}>Fresh Fold Laundry</p>
        <h1 id="scaffold-title" className={styles.headline}>
          Our records show
        </h1>
        <p className={styles.summary}>
          Base foundation scaffolded. Dated customer laundry item counts, status
          updates, and payment records will be wired here next.
        </p>
      </section>
    </main>
  );
}

