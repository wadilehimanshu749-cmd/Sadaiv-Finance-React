import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Coming soon</h1>
      <p className={styles.text}>This page hasn&apos;t been built yet.</p>
      <Link to="/" className={styles.button}>
        Back to Home
      </Link>
    </main>
  );
}
