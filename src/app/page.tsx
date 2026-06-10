import styles from './page.module.css';
import Estimator from './components/Estimator';

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Design Your Dream.<br />
            <span className={styles.heroAccent}>Know the Cost.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Use our Ultra-Luxury Renovation Blueprint Estimator to instantly calculate the cost of your project and connect with LuxeCertified™ elite contractors in your area.
          </p>
        </div>
      </section>

      <section className={styles.estimatorSection}>
        <Estimator />
      </section>
    </main>
  );
}
