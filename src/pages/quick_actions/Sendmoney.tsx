import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoBusinessOutline, IoChevronForward, IoFlash, IoHeadsetOutline, IoPersonOutline, IoPhonePortraitOutline, IoQrCodeOutline, IoSend, IoShieldCheckmark,} from "react-icons/io5";

import styles from "./SendMoney.module.css";

const ROUTES = {
  bank: "/send-money/bank", 
  upi: "/upi",
  mobile: "/to_mobile",
  self: "/self_transfer",
};

interface Option {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  icon: ReactNode;
}

function UpiIcon() {
  const [failed, setFailed] = useState(false);

  return failed ? (
    <IoQrCodeOutline size={26} aria-hidden="true" />
  ) : (
    <img
      src="/images/upi-icon.png"
      alt=""
      aria-hidden="true"
      className={styles.optionIconImg}
      onError={() => setFailed(true)}
    />
  );
}

const OPTIONS: Option[] = [
  {
    id: "bank",
    title: "To Bank Account",
    subtitle: "Send to any bank account using IFSC / account number",
    to: ROUTES.bank,
    icon: <IoBusinessOutline size={26} aria-hidden="true" />,
  },
  {
    id: "upi",
    title: "To UPI ID",
    subtitle: "Send to any UPI ID (e.g. name@upi)",
    to: ROUTES.upi,
    icon: <UpiIcon />,
  },
  {
    id: "mobile",
    title: "To Mobile Number",
    subtitle: "Send to a contact's mobile number (linked with UPI)",
    to: ROUTES.mobile,
    icon: <IoPhonePortraitOutline size={28} aria-hidden="true" />,
  },
  {
    id: "self",
    title: "To Self",
    subtitle: "Transfer money to your own account",
    to: ROUTES.self,
    icon: <IoPersonOutline size={26} aria-hidden="true" />,
  },
];


export default function Sendmoney() {
  return (
    <main className={styles.page}>
      <div className={styles.topBanner} aria-hidden="true" />

      <div className={`${styles.container} ${styles.content}`}>
        <div className={styles.header}>
          <Link to="/dashboard" className={styles.headerIconBtn} aria-label="Back to dashboard">
            <IoArrowBack size={23} />
          </Link>
          <div className={styles.headerTextWrapper}>
            <h1 className={styles.headerTitle}>Send Money</h1>
            <p className={styles.headerSubtitle}>Choose how you want to send</p>
          </div>
        </div>

        <div className={styles.layout}>
          <section className={styles.formCard} aria-labelledby="send-options-heading">
            <div className={styles.cardHeaderDesktop}>
              <h2 id="send-options-heading" className={styles.cardMainTitle}>
                Send Money
              </h2>
              <p className={styles.cardMainSub}>Choose how you want to send money.</p>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>
                <IoSend size={22} color="#1f7a4d" />
              </span>
              <div>
                <p className={styles.infoTitle}>Send money instantly</p>
                <p className={styles.infoSubtitle}>Pick a method to get started</p>
              </div>
            </div>

            <nav aria-label="Send money options">
              <ul className={styles.optionList}>
                {OPTIONS.map((opt) => (
                  <li key={opt.id}>
                    <Link to={opt.to} className={styles.option}>
                      <span className={styles.optionIcon}>{opt.icon}</span>
                      <span className={styles.optionText}>
                        <span className={styles.optionTitle}>{opt.title}</span>
                        <span className={styles.optionSub}>{opt.subtitle}</span>
                      </span>
                      <IoChevronForward size={22} className={styles.optionArrow} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          <aside className={styles.side} aria-label="Send money information">
            <div className={styles.sideHeroCard}>
              <span className={styles.sideHeroBadge} aria-hidden="true">
                <IoSend size={28} />
              </span>
              <h2 className={styles.sideHeroTitle}>Send money anywhere, instantly</h2>
              <p className={styles.sideHeroDesc}>
                Pay to a bank account, a UPI ID or a mobile number, or move money between your own
                accounts. Pick whichever is easiest and it&apos;s done in a few taps.
              </p>

              <ul className={styles.trustList}>
                <li>
                  <span className={styles.trustIcon}>
                    <IoFlash size={20} />
                  </span>
                  <span>
                    <strong>Instant</strong>
                    <small>Credited in seconds</small>
                  </span>
                </li>
                <li>
                  <span className={styles.trustIcon}>
                    <IoShieldCheckmark size={20} />
                  </span>
                  <span>
                    <strong>Secure via UPI</strong>
                    <small>End-to-end encrypted</small>
                  </span>
                </li>
                <li>
                  <span className={styles.trustIcon}>
                    <IoHeadsetOutline size={20} />
                  </span>
                  <span>
                    <strong>24x7 Help</strong>
                    <small>Realtime assistance</small>
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerContent}`}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Sadaiv Finance. All rights reserved.
          </p>
          <div className={styles.footerLinks}>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/support">Help & Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
