import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoCardOutline, IoCheckmark, IoCheckmarkCircle, IoClose, IoHeadsetOutline, IoInformationCircleOutline, IoShieldCheckmark, IoTimeOutline,} from "react-icons/io5";

import styles from "./CreditCardBill.module.css";

interface CreditCard {
  id: string;
  bank: string;
  cardNo: string;
  totalDue: number;
  dueDate: string;
  icon: string;
  initials: string;
}

const CARDS: CreditCard[] = [
  { id: "hdfc", bank: "HDFC Bank", cardNo: "•••• 1234", totalDue: 3250, dueDate: "21 May", icon: "/images/hdfc.png", initials: "HDFC" },
  { id: "sbi", bank: "SBI Bank", cardNo: "•••• 5678", totalDue: 5780, dueDate: "25 May", icon: "/images/sboi.png", initials: "SBI" },
];

const formatInr = (value: number) =>
  "₹" + value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function BankLogo({ card, size }: { card: CreditCard; size: number }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={styles.bankLogo} style={{ width: size, height: size }} aria-hidden="true">
      {failed ? (
        <span className={styles.bankInitials} style={{ fontSize: size * 0.26 }}>
          {card.initials}
        </span>
      ) : (
        <img src={card.icon} alt="" className={styles.bankLogoImg} onError={() => setFailed(true)} />
      )}
    </span>
  );
}

function CardOption({
  card,
  selected,
  onSelect,
}: {
  card: CreditCard;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={`${styles.card} ${selected ? styles.cardSelected : ""}`}>
      <input
        type="radio"
        name="credit-card"
        className={styles.srOnly}
        checked={selected}
        onChange={onSelect} />
        

      <span className={styles.cardTop}>
        <BankLogo card={card} size={46} />
        <span className={styles.cardDetails}>
          <span className={styles.bankName}>{card.bank}</span>
          <span className={styles.cardType}>Credit Card</span>
          <span className={styles.cardNumber}>{card.cardNo}</span>
        </span>
        <span className={styles.radioDot} aria-hidden="true">
          {selected && <IoCheckmark size={14} color="#ffffff" />}
        </span>
      </span>

      <span className={styles.cardBill}>
        <span className={styles.billCol}>
          <span className={styles.billLabel}>Total due</span>
          <span className={styles.billAmount}>{formatInr(card.totalDue)}</span>
        </span>
        <span className={`${styles.billCol} ${styles.billColEnd}`}>
          <span className={styles.billLabel}>Due date</span>
          <span className={styles.billDate}>{card.dueDate}</span>
        </span>
      </span>
    </label>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}>

        <div className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>{title}</h2>
          <button type="button" className={styles.sheetClose} onClick={onClose} aria-label="Close">
            <IoClose size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CreditCardBill() {
  const [selectedId, setSelectedId] = useState(CARDS[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [payStatus, setPayStatus] = useState<"idle" | "paying" | "done">("idle");

  const selected = CARDS.find((c) => c.id === selectedId);

  useEffect(() => {
    if (payStatus !== "paying") return;
    const timer = setTimeout(() => setPayStatus("done"), 1400);
    return () => clearTimeout(timer);
  }, [payStatus]);

  const openReview = () => {
    if (!selected) return;
    setPayStatus("idle");
    setSheetOpen(true);
  };

  const closeSheet = () => {
    if (payStatus === "paying") return;
    setSheetOpen(false);
    setPayStatus("idle");
  };

  return (
    <main className={styles.page}>
      <div className={styles.topBanner} aria-hidden="true" />

      <div className={`${styles.container} ${styles.content}`}>
        <div className={styles.header}>
          <Link to="/dashboard" className={styles.headerIconBtn} aria-label="Back to dashboard">
            <IoArrowBack size={23} />
          </Link>
          <div className={styles.headerTextWrapper}>
            <h1 className={styles.headerTitle}>Credit Card Bill</h1>
            <p className={styles.headerSubtitle}>Pay your bill safely and on time</p>
          </div>
        </div>

        <div className={styles.layout}>
          <section className={styles.formCard} aria-labelledby="select-card-label">
            <div>
              <div className={styles.cardHeaderDesktop}>
                <h2 className={styles.cardMainTitle}>Pay Credit Card Bill</h2>
                <p className={styles.cardMainSub}>Safe, secure and on time.</p>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>
                  <IoCardOutline size={26} color="#1f7a4d" />
                </span>
                <div>
                  <p className={styles.infoTitle}>Pay your credit card bill</p>
                  <p className={styles.infoSubtitle}>Safe, secure and on time</p>
                </div>
              </div>

              <span className={styles.label} id="select-card-label">
                Select Credit Card
              </span>
              <div className={styles.cardList} role="radiogroup" aria-labelledby="select-card-label">
                {CARDS.map((c) => (
                  <CardOption
                    key={c.id}
                    card={c}
                    selected={c.id === selectedId}
                    onSelect={() => setSelectedId(c.id)}
                  />
                ))}
              </div>

              <p className={styles.notice}>
                <IoInformationCircleOutline size={20} color="#3e6b4a" aria-hidden="true" />
                <span>
                  You will be redirected to your bank&apos;s secure portal to complete the payment.
                </span>
              </p>
            </div>

            <button type="button" className={styles.button} onClick={openReview} disabled={!selected}>
              Pay Bill
            </button>
          </section>

          <aside className={styles.side} aria-label="Bill payment information">
            <div className={styles.sideHeroCard}>
              {/* <span className={styles.sideHeroBadge} aria-hidden="true">
                <IoCardOutline size={30} />
              </span> */}
              <h2 className={styles.sideHeroTitle}>Pay your credit card bill on time</h2>
              <p className={styles.sideHeroDesc}>
                See what&apos;s due on each of your cards in one place and pay in a few taps.
                Paying before the due date helps you avoid late fees and keeps your credit score
                healthy.
              </p>

              <ul className={styles.trustList}>
                <li>
                  <span className={styles.trustIcon}>
                    <IoShieldCheckmark size={20} />
                  </span>
                  <span>
                    <strong>100% Safe</strong>
                    <small>Paid via your bank&apos;s secure portal</small>
                  </span>
                </li>
                <li>
                  <span className={styles.trustIcon}>
                    <IoTimeOutline size={20} />
                  </span>
                  <span>
                    <strong>Never miss a due date</strong>
                    <small>Due dates shown for every card</small>
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

      {sheetOpen && selected && (
        <Sheet title={payStatus === "done" ? "Payment initiated" : "Review payment"} onClose={closeSheet}>
          {payStatus === "done" ? (
            <div className={styles.success} role="status">
              <IoCheckmarkCircle size={54} color="#1f8a5b" />
              <p className={styles.successTitle}>{formatInr(selected.totalDue)}</p>
              <p className={styles.successRoute}>
                {selected.bank} Credit Card {selected.cardNo}
              </p>
              <p className={styles.successText}>
                Your payment request has been sent. Your bank will update your outstanding balance shortly.
              </p>
              <Link to="/dashboard" className={styles.button}>
                Back to dashboard
              </Link>
            </div>
          ) : (
            <>
              <dl className={styles.reviewList}>
                <div className={styles.summaryRow}>
                  <dt>Credit card</dt>
                  <dd className={styles.summaryCard}>
                    <BankLogo card={selected} size={24} />
                    {selected.bank} {selected.cardNo}
                  </dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Due date</dt>
                  <dd>{selected.dueDate}</dd>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <dt>Total due</dt>
                  <dd>{formatInr(selected.totalDue)}</dd>
                </div>
              </dl>

              <p className={styles.notice}>
                <IoInformationCircleOutline size={20} color="#3e6b4a" aria-hidden="true" />
                <span>
                  You will be redirected to your bank&apos;s secure portal to complete the payment.
                </span>
              </p>

              <button
                type="button"
                className={styles.button}
                disabled={payStatus === "paying"}
                onClick={() => setPayStatus("paying")}>

                {payStatus === "paying" ? "Redirecting…" : `Confirm & pay ${formatInr(selected.totalDue)}`}
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeSheet}
                disabled={payStatus === "paying"}>

                Cancel
              </button>
            </>
          )}
        </Sheet>
      )}
    </main>
  );
}
