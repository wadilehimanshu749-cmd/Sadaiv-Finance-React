import { Link } from "react-router-dom";
import {
  IoArrowBack,
  IoArrowForward,
} from "react-icons/io5";

import styles from "./Investment.module.css";

export default function Investment() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <Link
            to="/dashboard"
            className={styles.backButton}
            aria-label="Back to dashboard"
          >
            <IoArrowBack size={22} />
          </Link>

          <div className={styles.headerTitleContainer}>
            <h1 className={styles.headerTitle}>Investment</h1>
            <p className={styles.headerSubtitle}>
              Grow your wealth, secure your future
            </p>
          </div>
        </div>

        <section className={styles.heroCard}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>
              Smart Investments for a Better Tomorrow
            </h2>

            <p className={styles.heroDescription}>
              Explore insurance plans and secure
              <br className={styles.heroBreak} />
              your future with the right protection
            </p>

            <button
              type="button"
              className={styles.heroButton}>
              <span>View All Plans</span>
              <IoArrowForward size={16} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
