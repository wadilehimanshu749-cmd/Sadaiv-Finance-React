import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faClockRotateLeft, faHandHoldingHeart, faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";
import { IoScanOutline } from "react-icons/io5";
import styles from "./TabBar.module.css";

export default function TabBar() {
  const { pathname } = useLocation();

  return (
    <nav className={styles.tabBar}>

      <Link to="/" className={`${styles.tabItem} ${pathname === "/" ? styles.active : ""}`}>
        <div className={styles.iconContainer}>
          <FontAwesomeIcon icon={faHouse} style={{ fontSize: '20px' }} />
        </div>

        <span className={styles.label}>Home</span>
      </Link>

      <Link to="/loan" className={`${styles.tabItem} ${pathname.startsWith("/loan") ? styles.active : ""}`}>

        <div className={styles.iconContainer}>
          <FontAwesomeIcon icon={faIndianRupeeSign} style={{ fontSize: '20px' }} />
        </div>

        <span className={styles.label}>Loan</span>
      </Link>

      <Link to="/scanandpay" className={styles.scanItem}>

        <div className={styles.scanButton}>
          <IoScanOutline size={27} />
        </div>

        <span className={styles.label}>Scan & Pay</span>
      </Link>

      <Link to="/investment" className={`${styles.tabItem} ${pathname.startsWith("/investment") ? styles.active : "" }`}>

        <div className={styles.iconContainer}>
          <FontAwesomeIcon icon={faHandHoldingHeart} style={{ fontSize: '20px' }} />

        </div>

        <span className={styles.label}>Investment</span>
      </Link>

      <Link to="/history" className={`${styles.tabItem} ${pathname.startsWith("/history") ? styles.active : ""}`}>
      
        <div className={styles.iconContainer}>
          <FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: '20px' }} />

        </div>

        <span className={styles.label}>History</span>
      </Link>

    </nav>
  );
}