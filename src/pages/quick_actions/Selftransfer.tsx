import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoArrowForward, IoBusinessOutline, IoCashOutline, IoCheckmark, IoCheckmarkCircle, IoClose, IoFlash, IoShieldCheckmark,} from "react-icons/io5";

import styles from "./Selftransfer.module.css";


interface Account {
  id: string;
  name: string;
  accNo: string;
  balance: number;
  icon: string;
  initials: string;
}

const ACCOUNTS: Account[] = [
  { id: "hdfc", name: "HDFC Bank", accNo: "•••• 1234", balance: 124560.5, icon: "/images/hdfc.png", initials: "HDFC" },
  { id: "sbi", name: "State Bank of India", accNo: "•••• 5678", balance: 56780.2, icon: "/images/sboi.png", initials: "SBI" },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100000; 
const DESKTOP_QUERY = "(min-width: 960px)";

const formatInr = (value: number, decimals = false) =>
  "₹" +
  value.toLocaleString(
    "en-IN",
    decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : undefined,
  );

function BankLogo({ account, size }: { account: Account; size: number }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={styles.bankLogo} style={{ width: size, height: size }} aria-hidden="true">
      {failed ? (
        <span className={styles.bankInitials} style={{ fontSize: size * 0.26 }}>
          {account.initials}
        </span>
      ) : (
        <img
          src={account.icon}
          alt=""
          className={styles.bankLogoImg}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

function AccountOption({
  account,
  name,
  selected,
  onSelect,
}: {
  account: Account;
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={`${styles.account} ${selected ? styles.accountSelected : ""}`}>
      <input
        type="radio"
        name={name}
        className={styles.srOnly}
        checked={selected}
        onChange={onSelect}
      />
      <BankLogo account={account} size={46} />
      <span className={styles.accountInfo}>
        <span className={styles.bankName}>{account.name}</span>
        <span className={styles.accountNumber}>{account.accNo}</span>
        <span className={styles.balance}>{formatInr(account.balance, true)}</span>
      </span>
      <span className={styles.radioDot} aria-hidden="true">
        {selected && <IoCheckmark size={14} color="#ffffff" />}
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


type Errors = { account?: string; amount?: string };

export default function SelfTransfer() {
  const [destinationId, setDestinationId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const [sheetOpen, setSheetOpen] = useState(false);
  const [payStatus, setPayStatus] = useState<"idle" | "paying" | "done">("idle");

  const amountRef = useRef<HTMLInputElement>(null);
  const accountListRef = useRef<HTMLDivElement>(null);
  const desktopAccountRef = useRef<HTMLElement>(null);

  const amountNumber = Number(amount) || 0;
  const destination = ACCOUNTS.find((a) => a.id === destinationId);
  const sourceAccounts = ACCOUNTS.filter((a) => a.id !== destinationId);
  const source = sourceAccounts.find((a) => a.id === sourceId);
  const insufficient = !!source && amountNumber > source.balance;

  useEffect(() => {
    if (payStatus !== "paying") return;
    const timer = setTimeout(() => setPayStatus("done"), 1100);
    return () => clearTimeout(timer);
  }, [payStatus]);

  const selectDestination = (id: string) => {
    setDestinationId(id);
    setErrors((p) => ({ ...p, account: undefined }));
  };

  const focusAccount = () => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      const el = desktopAccountRef.current;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    } else {
      accountListRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!destination) e.account = "Select the account you want to transfer to.";
    if (!Number.isInteger(amountNumber) || amountNumber < MIN_AMOUNT || amountNumber > MAX_AMOUNT) {
      e.amount = `Enter an amount between ${formatInr(MIN_AMOUNT)} and ${formatInr(MAX_AMOUNT)}.`;
    }
    return e;
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const found = validate();
    setErrors(found);

    if (found.account) return focusAccount();
    if (found.amount) return amountRef.current?.focus();

    setSourceId(sourceAccounts.length === 1 ? sourceAccounts[0].id : "");
    setPayStatus("idle");
    setSheetOpen(true);
  };

  const resetForm = () => {
    setDestinationId("");
    setSourceId("");
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
            <h1 className={styles.headerTitle}>Self Transfer</h1>
            <p className={styles.headerSubtitle}>Move money between your accounts</p>
          </div>
        </div>

        <div className={styles.layout}>
          <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
            <div>
              <div className={styles.cardHeaderDesktop}>
                <h2 className={styles.cardMainTitle}>Self Transfer</h2>
                <p className={styles.cardMainSub}>Move money between your own bank accounts.</p>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>
                  <IoBusinessOutline size={24} color="#1f7a4d" />
                </span>
                <div>
                  <p className={styles.infoTitle}>Transfer to your account</p>
                  <p className={styles.infoSubtitle}>
                    Select the account where you want to transfer money.
                  </p>
                </div>
              </div>

              <div className={styles.accountSectionMobile}>
                <span className={styles.label} id="destination-label">
                  Transfer to
                </span>
                <div
                  ref={accountListRef}
                  className={styles.accountList}
                  role="radiogroup"
                  aria-labelledby="destination-label">

                  {ACCOUNTS.map((acc) => (
                    <AccountOption
                      key={acc.id}
                      account={acc}
                      name="destination-mobile"
                      selected={acc.id === destinationId}
                      onSelect={() => selectDestination(acc.id)}/>

                  ))}
                </div>
                {errors.account && (
                  <p className={styles.errorText} role="alert">
                    {errors.account}
                  </p>
                )}
              </div>

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

                    {formatInr(value)}
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
                Transfer Money
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
                <IoSwapHorizontal size={30} />
              </span> */}
              <h2 className={styles.sideHeroTitle}>Move money between your own accounts</h2>
              <p className={styles.sideHeroDesc}>
                Top up one account from another in a few taps. Choose where the money should go,
                enter an amount, and pick which account to debit.
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
                    <IoCashOutline size={20} />
                  </span>
                  <span>
                    <strong>No extra charges</strong>
                    <small>Transfer between your own accounts</small>
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <section
          ref={desktopAccountRef}
          tabIndex={-1}
          className={styles.desktopAccountCard}
          aria-labelledby="desktop-account-heading">

          <h3 id="desktop-account-heading" className={styles.desktopAccountTitle}>
            Transfer to
          </h3>
          <p className={styles.desktopAccountSub}>Select the account where you want to receive money.</p>
          <div className={styles.desktopAccountGrid} role="radiogroup" aria-labelledby="desktop-account-heading">
            {ACCOUNTS.map((acc) => (
              <AccountOption
                key={acc.id}
                account={acc}
                name="destination-desktop"
                selected={acc.id === destinationId}
                onSelect={() => selectDestination(acc.id)}/>
                
            ))}
          </div>
          {errors.account && (
            <p className={`${styles.errorText} ${styles.desktopAccountError}`} role="alert">
              {errors.account}
            </p>
          )}
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

      {sheetOpen && destination && (
        <Sheet title={payStatus === "done" ? "Transfer successful" : "Transfer from"} onClose={closeSheet}>
          {payStatus === "done" && source ? (
            <div className={styles.success} role="status">
              <IoCheckmarkCircle size={54} color="#1f8a5b" />
              <p className={styles.successTitle}>{formatInr(amountNumber)} transferred</p>
              <p className={styles.successRoute}>
                <span>{source.name}</span>
                <IoArrowForward size={16} aria-hidden="true" />
                <span>{destination.name}</span>
              </p>
              <p className={styles.successText}>The money should reflect in your account within a few seconds.</p>
              <Link to="/dashboard" className={styles.button}>
                Back to dashboard
              </Link>
              <button type="button" className={styles.secondaryButton} onClick={startAnother}>
                Make another transfer
              </button>
            </div>
          ) : (
            <>
              <p className={styles.sheetSubtitle}>Select the bank account to debit money from.</p>

              <div className={styles.sourceList} role="radiogroup" aria-label="Transfer from">
                {sourceAccounts.map((acc) => (
                  <AccountOption
                    key={acc.id}
                    account={acc}
                    name="source"
                    selected={acc.id === sourceId}
                    onSelect={() => setSourceId(acc.id)}/>

                ))}
              </div>

              {insufficient && (
                <p className={styles.errorText} role="alert">
                  Insufficient balance in {source?.name}. Available: {formatInr(source!.balance, true)}.
                </p>
              )}

              <dl className={styles.reviewList}>
                <div className={styles.summaryRow}>
                  <dt>Transfer to</dt>
                  <dd>{destination.name}</dd>
                </div>
                {note.trim() && (
                  <div className={styles.summaryRow}>
                    <dt>Note</dt>
                    <dd>{note.trim()}</dd>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <dt>You transfer</dt>
                  <dd>{formatInr(amountNumber)}</dd>
                </div>
              </dl>

              <button
                type="button"
                className={styles.button}
                disabled={!source || insufficient || payStatus === "paying"}
                onClick={() => setPayStatus("paying")}>

                {payStatus === "paying" ? "Processing…" : `Confirm & transfer ${formatInr(amountNumber)}`}
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
