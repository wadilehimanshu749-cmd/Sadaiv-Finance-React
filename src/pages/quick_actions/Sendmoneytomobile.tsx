import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoCheckmarkCircle, IoClose, IoFlash, IoHeadsetOutline, IoPeopleOutline, IoPersonCircleOutline, IoShieldCheckmark,} from "react-icons/io5";

import styles from "./Sendmoneytomobile.module.css";

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100000;

const MOBILE_RE = /^[6-9]\d{9}$/;

const formatCurrency = (val: number) => "₹" + val.toLocaleString("en-IN");

const formatMobile = (digits: string) =>
  digits ? `+91 ${digits.slice(0, 5)}${digits.length > 5 ? " " + digits.slice(5) : ""}` : "—";

const toTenDigits = (raw: string) => raw.replace(/\D/g, "").slice(-10);

interface ContactsManagerLike {
  select: (props: string[], opts?: { multiple?: boolean }) => Promise<{ tel?: string[] }[]>;
}
const getContacts = (): ContactsManagerLike | null =>
  typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window
    ? (navigator as unknown as { contacts: ContactsManagerLike }).contacts
    : null;

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

type Errors = { mobile?: string; amount?: string };

export default function Sendmoneytomobile() {
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const [sheetOpen, setSheetOpen] = useState(false);
  const [payStatus, setPayStatus] = useState<"idle" | "paying" | "done">("idle");

  const mobileRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const contacts = getContacts();
  const amountNumber = Number(amount) || 0;

  useEffect(() => {
    if (payStatus !== "paying") return;
    const timer = setTimeout(() => setPayStatus("done"), 1100);
    return () => clearTimeout(timer);
  }, [payStatus]);

  const pickContact = async () => {
    try {
      const picked = await contacts?.select(["tel"], { multiple: false });
      const tel = picked?.[0]?.tel?.[0];
      if (tel) {
        setMobile(toTenDigits(tel));
        setErrors((p) => ({ ...p, mobile: undefined }));
      }
    } catch {

    }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!MOBILE_RE.test(mobile)) e.mobile = "Enter a valid 10-digit mobile number.";
    if (!Number.isInteger(amountNumber) || amountNumber < MIN_AMOUNT || amountNumber > MAX_AMOUNT) {
      e.amount = `Enter an amount between ${formatCurrency(MIN_AMOUNT)} and ${formatCurrency(MAX_AMOUNT)}.`;
    }
    return e;
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const found = validate();
    setErrors(found);

    if (found.mobile) return mobileRef.current?.focus();
    if (found.amount) return amountRef.current?.focus();

    setPayStatus("idle");
    setSheetOpen(true);
  };

  const resetForm = () => {
    setMobile("");
    setAmount("");
    setNote("");
    setErrors({});
    setPayStatus("idle");
  };

  const closeSheet = () => {
    if (payStatus === "paying") return;
    if (payStatus === "done") resetForm();
    setSheetOpen(false);
  };

  const startAnother = () => {
    resetForm();
    setSheetOpen(false);
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
            <h1 className={styles.headerTitle}>Send to Mobile</h1>
            <p className={styles.headerSubtitle}>Pay anyone using their mobile number</p>
          </div>
        </div>

        <div className={styles.layout}>
          <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
            <div>
              <div className={styles.cardHeaderDesktop}>
                <h2 className={styles.cardMainTitle}>Send Money to Mobile Number</h2>
                <p className={styles.cardMainSub}>Instant UPI transfer to any registered number.</p>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>
                  <IoPeopleOutline size={26} color="#1f7a4d" />
                </span>
                <div>
                  <p className={styles.infoTitle}>Send money to mobile number</p>
                  <p className={styles.infoSubtitle}>Enter the mobile number below.</p>
                </div>
              </div>

              <label className={styles.label} htmlFor="mobile">
                Mobile Number
              </label>
              <div className={styles.numberRow}>
                <div className={`${styles.inputBox} ${errors.mobile ? styles.inputError : ""}`}>
                  <span className={styles.code}>+91</span>
                  <input
                    ref={mobileRef}
                    id="mobile"
                    className={styles.input}
                    type="tel"
                    inputMode="numeric"
                    placeholder="12345 67890"
                    autoComplete="tel-national"
                    maxLength={10}
                    value={mobile}
                    aria-invalid={!!errors.mobile}
                    aria-describedby="mobile-help"
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, ""));
                      setErrors((p) => ({ ...p, mobile: undefined }));
                    }}
                  />
                </div>

                {contacts && (
                  <button
                    type="button"
                    className={styles.contactButton}
                    onClick={pickContact}
                    aria-label="Choose from contacts"
                    title="Choose from contacts">

                    <IoPersonCircleOutline size={26} />
                  </button>
                )}
              </div>
              <p
                id="mobile-help"
                className={errors.mobile ? styles.errorText : styles.helpText}
                role={errors.mobile ? "alert" : undefined}>

                {errors.mobile ?? "Ensure this is a valid mobile number"}
              </p>

              <label className={styles.label} htmlFor="amount">
                Amount
              </label>
              <div className={`${styles.inputBox} ${errors.amount ? styles.inputError : ""}`}>
                <span className={styles.rupee}>₹</span>
                <input
                  ref={amountRef}
                  id="amount"
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter amount"
                  autoComplete="off"
                  maxLength={6}
                  value={amount}
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? "amount-error" : undefined}
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/\D/g, ""));
                    setErrors((p) => ({ ...p, amount: undefined }));
                  }}/>

              </div>
              {errors.amount && (
                <p className={styles.errorText} id="amount-error" role="alert">
                  {errors.amount}
                </p>
              )}

              <div className={styles.chips} role="group" aria-label="Popular amounts">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${amountNumber === value ? styles.chipActive : ""}`}
                    onClick={() => {
                      setAmount(String(value));
                      setErrors((p) => ({ ...p, amount: undefined }));
                    }}>

                    {formatCurrency(value)}
                  </button>
                ))}
              </div>

              <label className={styles.label} htmlFor="note">
                Add note <span className={styles.optional}>(optional)</span>
              </label>
              <div className={styles.inputBox}>
                <input
                  id="note"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. For dinner"
                  autoComplete="off"
                  maxLength={50}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}/>

              </div>
            </div>

            <div>
              <button type="submit" className={styles.button}>
                Send Money
              </button>
              <p className={styles.secureNote}>
                <IoShieldCheckmark size={16} color="#245d45" aria-hidden="true" />
                Money will be transferred securely via UPI
              </p>
            </div>
          </form>

          <aside className={styles.side} aria-label="Transfer information">
            <div className={styles.sideHeroCard}>
              {/* <span className={styles.sideHeroBadge} aria-hidden="true">
                <IoSend size={28} />
              </span> */}
              <h2 className={styles.sideHeroTitle}>Send money to any mobile number</h2>
              <p className={styles.sideHeroDesc}>
                No account details needed. Enter the recipient&apos;s mobile number, add an amount
                and send it over UPI in a few seconds.
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

      {sheetOpen && (
        <Sheet title={payStatus === "done" ? "Money sent" : "Review & send"} onClose={closeSheet}>
          {payStatus === "done" ? (
            <div className={styles.success} role="status">
              <IoCheckmarkCircle size={54} color="#1f8a5b" />
              <p className={styles.successTitle}>{formatCurrency(amountNumber)} sent</p>
              <p className={styles.successRoute}>to {formatMobile(mobile)}</p>
              <p className={styles.successText}>
                The money is on its way and should reflect in a few seconds.
              </p>
              <Link to="/dashboard" className={styles.button}>
                Back to dashboard
              </Link>
              <button type="button" className={styles.secondaryButton} onClick={startAnother}>
                Send to someone else
              </button>
            </div>
          ) : (
            <>
              <dl className={styles.reviewList}>
                <div className={styles.summaryRow}>
                  <dt>Sending to</dt>
                  <dd>{formatMobile(mobile)}</dd>
                </div>
                {note.trim() && (
                  <div className={styles.summaryRow}>
                    <dt>Note</dt>
                    <dd>{note.trim()}</dd>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <dt>You send</dt>
                  <dd>{formatCurrency(amountNumber)}</dd>
                </div>
              </dl>

              <button
                type="button"
                className={styles.button}
                disabled={payStatus === "paying"}
                onClick={() => setPayStatus("paying")}>

                {payStatus === "paying" ? "Sending…" : `Confirm & send ${formatCurrency(amountNumber)}`}
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
