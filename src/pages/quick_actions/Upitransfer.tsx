import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoCheckmark, IoCheckmarkCircle, IoClose, IoFlash, IoHeadsetOutline, IoPersonOutline, IoQrCodeOutline, IoShieldCheckmark,} from "react-icons/io5";

import styles from "./Upitransfer.module.css";

interface Contact {
  id: string;
  name: string;
  upi: string;
}

const CONTACTS: Contact[] = [
  { id: "amit", name: "Amit Singh", upi: "amit@okicici" },
  { id: "priya", name: "Priya Sharma", upi: "priya@oksbi" },
  { id: "rahul", name: "Rahul Verma", upi: "rahul@paytm" },
  { id: "sneha", name: "Sneha Patel", upi: "sneha@ybl" },
];

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100000;

const UPI_RE = /^[a-z0-9._-]{2,256}@[a-z]{2,64}$/i;

const formatCurrency = (val: number) => "₹" + val.toLocaleString("en-IN");

function UpiLogo({ size }: { size: number }) {
  const [failed, setFailed] = useState(false);

  return failed ? (
    <IoQrCodeOutline size={size} color="#1f7a4d" aria-hidden="true" />
  ) : (
    <img
      src="/images/upi-icon.png"
      alt=""
      aria-hidden="true"
      className={styles.upiLogoImg}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}/>

  );
}

function ContactOption({
  contact,
  selected,
  onSelect,
}: {
  contact: Contact;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`${styles.contact} ${selected ? styles.contactSelected : ""}`}
      onClick={onSelect}>

      <span className={styles.contactAvatar} aria-hidden="true">
        {contact.name.charAt(0)}
        {selected && (
          <span className={styles.contactCheck}>
            <IoCheckmark size={11} color="#ffffff" />
          </span>
        )}
      </span>
      <span className={styles.contactName}>{contact.name}</span>
      <span className={styles.contactUpi}>{contact.upi}</span>
    </button>
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

type Errors = { upi?: string; amount?: string };

export default function UpiTransfer() {
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const [sheetOpen, setSheetOpen] = useState(false);
  const [payStatus, setPayStatus] = useState<"idle" | "paying" | "done">("idle");

  const upiRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const amountNumber = Number(amount) || 0;
  const matchedContact = CONTACTS.find((c) => c.upi.toLowerCase() === upiId.trim().toLowerCase());

  useEffect(() => {
    if (payStatus !== "paying") return;
    const timer = setTimeout(() => setPayStatus("done"), 1100);
    return () => clearTimeout(timer);
  }, [payStatus]);

  const pickContact = (contact: Contact) => {
    setUpiId(contact.upi);
    setErrors((p) => ({ ...p, upi: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!UPI_RE.test(upiId.trim())) e.upi = "Enter a valid UPI ID, e.g. name@okicici.";
    if (!Number.isInteger(amountNumber) || amountNumber < MIN_AMOUNT || amountNumber > MAX_AMOUNT) {
      e.amount = `Enter an amount between ${formatCurrency(MIN_AMOUNT)} and ${formatCurrency(MAX_AMOUNT)}.`;
    }
    return e;
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const found = validate();
    setErrors(found);

    if (found.upi) return upiRef.current?.focus();
    if (found.amount) return amountRef.current?.focus();

    setPayStatus("idle");
    setSheetOpen(true);
  };

  const resetForm = () => {
    setUpiId("");
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

  const payee = matchedContact?.name ?? upiId.trim();

  return (
    <main className={styles.page}>
      <div className={styles.topBanner} aria-hidden="true" />

      <div className={`${styles.container} ${styles.content}`}>
        <div className={styles.header}>
          <Link to="/dashboard" className={styles.headerIconBtn} aria-label="Back to dashboard">
            <IoArrowBack size={23} />
          </Link>
          <div className={styles.headerTextWrapper}>
            <h1 className={styles.headerTitle}>Send to UPI ID</h1>
            <p className={styles.headerSubtitle}>Pay anyone using their UPI ID</p>
          </div>
        </div>

        <div className={styles.layout}>
          <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
            <div>
              <div className={styles.cardHeaderDesktop}>
                <h2 className={styles.cardMainTitle}>Send Money to any UPI ID</h2>
                <p className={styles.cardMainSub}>Instant transfer to any UPI-enabled account.</p>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>
                  <UpiLogo size={30} />
                </span>
                <div>
                  <p className={styles.infoTitle}>Send money to any UPI ID</p>
                  <p className={styles.infoSubtitle}>Enter the UPI ID (e.g. name@upi)</p>
                </div>
              </div>

              <label className={styles.label} htmlFor="upi">
                Enter UPI ID
              </label>
              <div className={`${styles.inputBox} ${errors.upi ? styles.inputError : ""}`}>
                <IoPersonOutline size={20} color="#365f45" aria-hidden="true" />
                <input
                  ref={upiRef}
                  id="upi"
                  className={styles.input}
                  type="text"
                  inputMode="email"
                  placeholder="e.g. example@okicici"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={60}
                  value={upiId}
                  aria-invalid={!!errors.upi}
                  aria-describedby="upi-help"
                  onChange={(e) => {
                    setUpiId(e.target.value.replace(/\s/g, ""));
                    setErrors((p) => ({ ...p, upi: undefined }));
                  }}/>

              </div>
              <p
                id="upi-help"
                className={errors.upi ? styles.errorText : styles.helpText}
                role={errors.upi ? "alert" : undefined}>

                {errors.upi ?? "Ensure the UPI ID is correct before sending"}
              </p>

              <div className={styles.contactsSectionMobile}>
                <span className={styles.label} id="contacts-label">
                  Select from Contacts
                </span>
                <div className={styles.contactGrid} role="group" aria-labelledby="contacts-label">
                  {CONTACTS.map((c) => (
                    <ContactOption
                      key={c.id}
                      contact={c}
                      selected={c.id === matchedContact?.id}
                      onSelect={() => pickContact(c)}/>

                  ))}
                </div>
              </div>

              <label className={styles.label} htmlFor="amount">
                Enter Amount
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
             
              <h2 className={styles.sideHeroTitle}>Pay anyone with just a UPI ID</h2>
              <p className={styles.sideHeroDesc}>
                Enter a UPI ID or pick a saved contact, add an amount and send. Works with every
                UPI app and bank account, with no account numbers or IFSC codes to remember.
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

        <section className={styles.desktopContactsCard} aria-labelledby="desktop-contacts-heading">
          <h3 id="desktop-contacts-heading" className={styles.desktopContactsTitle}>
            Select from Contacts
          </h3>
          <p className={styles.desktopContactsSub}>Tap a contact to fill in their UPI ID.</p>
          <div className={styles.contactGrid} role="group" aria-labelledby="desktop-contacts-heading">
            {CONTACTS.map((c) => (
              <ContactOption
                key={c.id}
                contact={c}
                selected={c.id === matchedContact?.id}
                onSelect={() => pickContact(c)} />

            ))}
          </div>
        </section>
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
              <p className={styles.successRoute}>to {payee}</p>
              {matchedContact && <p className={styles.successUpi}>{matchedContact.upi}</p>}
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
                {matchedContact && (
                  <div className={styles.summaryRow}>
                    <dt>Name</dt>
                    <dd>{matchedContact.name}</dd>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <dt>UPI ID</dt>
                  <dd>{upiId.trim()}</dd>
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
