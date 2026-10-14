import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoArrowBack, IoCheckmark, IoCheckmarkCircle, IoChevronForward, IoClose, IoFlash, IoHeadsetOutline, IoListOutline, IoPersonCircleOutline, IoPhonePortraitOutline, IoShieldCheckmark,} from "react-icons/io5";

import styles from "./MobileRecharge.module.css";

interface Operator {
  id: string;
  name: string;
  displayName: string;
  color: string;
  logo?: string;
  whiteLogo?: boolean;
  logoScale?: number;
}

const OPERATORS: Operator[] = [
  { id: "airtel", name: "Airtel", displayName: "Airtel Recharge", color: "#ED1C24", logo: "/images/airtel-icon.png", whiteLogo: true, logoScale: 0.62 },
  { id: "bsnl", name: "BSNL", displayName: "BSNL Recharge", color: "#F0EEE2", logo: "/images/bsnl-icon.png", logoScale: 0.74 },
  { id: "jio", name: "Jio", displayName: "Jio Recharge", color: "#2161A8" },
  { id: "vi", name: "Vi", displayName: "Vi Recharge", color: "#ED1C24", logo: "/images/vi-icon.png", whiteLogo: true, logoScale: 0.54 },
];

const QUICK_AMOUNTS = [149, 199, 299, 399, 599, 799];

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 10000;

const DESKTOP_QUERY = "(min-width: 960px)";

const SAMPLE_PLANS = [
  { price: 199, validity: "28 days", data: "1.5 GB/day", extra: "Unlimited calls, 100 SMS/day" },
  { price: 299, validity: "28 days", data: "2 GB/day", extra: "Unlimited calls, 100 SMS/day" },
  { price: 479, validity: "56 days", data: "1.5 GB/day", extra: "Unlimited calls, 100 SMS/day" },
  { price: 599, validity: "56 days", data: "2 GB/day", extra: "Unlimited calls, 100 SMS/day" },
  { price: 859, validity: "84 days", data: "1.5 GB/day", extra: "Unlimited calls, 100 SMS/day" },
  { price: 2999, validity: "365 days", data: "2.5 GB/day", extra: "Unlimited calls, 100 SMS/day" },
];

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

function OperatorLogo({ operator, size }: { operator: Operator; size: number }) {
  return (
    <span
      className={styles.operatorCircle}
      style={{ width: size, height: size, background: operator.color }}
      aria-hidden="true">
      {operator.logo ? (
        <img
          src={operator.logo}
          alt=""
          className={`${styles.operatorImg} ${operator.whiteLogo ? styles.whiteLogo : ""}`}
          style={{ width: `${(operator.logoScale ?? 0.6) * 100}%`, height: `${(operator.logoScale ?? 0.6) * 100}%` }}/>
      ) : (
        <span className={styles.jioText} style={{ fontSize: size * 0.28 }}>{operator.name}</span>
      )}
    </span>
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

type Errors = { mobile?: string; operator?: string; amount?: string };

export default function MobileRecharge() {
  const [rechargeType, setRechargeType] = useState<"prepaid" | "postpaid">("prepaid");
  const [mobile, setMobile] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const [sheet, setSheet] = useState<"none" | "plans" | "review">("none");
  const [payStatus, setPayStatus] = useState<"idle" | "paying" | "done">("idle");

  const mobileRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const operatorGroupRef = useRef<HTMLDivElement>(null);
  const desktopOperatorRef = useRef<HTMLElement>(null);

  const contacts = getContacts();
  const operator = OPERATORS.find((o) => o.id === operatorId);
  const amountNumber = Number(amount) || 0;

  useEffect(() => {
    if (payStatus !== "paying") return;
    const timer = setTimeout(() => setPayStatus("done"), 1100);
    return () => clearTimeout(timer);
  }, [payStatus]);

  const selectOperator = (id: string) => {
    setOperatorId(id);
    setErrors((p) => ({ ...p, operator: undefined }));
  };

  
  const focusOperator = () => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      const el = desktopOperatorRef.current;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    } else {
      operatorGroupRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }
  };

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
    if (!operator) e.operator = "Select your operator.";
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
    if (found.operator) return focusOperator();
    if (found.amount) return amountRef.current?.focus();

    setPayStatus("idle");
    setSheet("review");
  };

  const openPlans = () => {
    if (!operator) {
      setErrors((p) => ({ ...p, operator: "Select your operator to view plans." }));
      focusOperator();
      return;
    }
    setSheet("plans");
  };

  const choosePlan = (price: number) => {
    setAmount(String(price));
    setErrors((p) => ({ ...p, amount: undefined }));
    setSheet("none");
  };

  const closeSheet = () => {
    if (payStatus === "paying") return;
    setSheet("none");
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
            <h1 className={styles.headerTitle}>Mobile Recharge</h1>
            <p className={styles.headerSubtitle}>Prepaid recharge in seconds</p>
          </div>
        </div>

        <div className={styles.layout}>
          <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
            <div>
              <div className={styles.cardHeaderDesktop}>
                <h2 className={styles.cardMainTitle}>Mobile Recharge Online</h2>
                <div className={styles.radioTypes}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="rechargeType"
                      checked={rechargeType === "prepaid"}
                      onChange={() => setRechargeType("prepaid")}
                    />
                    Prepaid
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="rechargeType"
                      checked={rechargeType === "postpaid"}
                      onChange={() => setRechargeType("postpaid")}
                    />
                    Postpaid
                  </label>
                </div>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>
                  <IoPhonePortraitOutline size={27} color="#1f7a4d" />
                </span>
                <div>
                  <p className={styles.infoTitle}>Recharge your mobile</p>
                  <p className={styles.infoSubtitle}>Quick and secure</p>
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
                    placeholder="98765 43210"
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
                    title="Choose from contacts"
                  >
                    <IoPersonCircleOutline size={26} />
                  </button>
                )}
              </div>
              <p
                id="mobile-help"
                className={errors.mobile ? styles.errorText : styles.helpText}
                role={errors.mobile ? "alert" : undefined}
              >
                {errors.mobile ?? "Ensure this is a valid mobile number"}
              </p>

              <div className={styles.operatorSectionMobile}>
                <span className={styles.label} id="operator-label">
                  Select Operator
                </span>
                <div
                  ref={operatorGroupRef}
                  className={styles.operatorRow}
                  role="radiogroup"
                  aria-labelledby="operator-label">

                  {OPERATORS.map((op) => {
                    const selected = op.id === operatorId;
                    return (
                      <label
                        key={op.id}
                        className={`${styles.operator} ${selected ? styles.operatorSelected : ""}`}>

                        <input
                          type="radio"
                          name="operator"
                          className={styles.srOnly}
                          checked={selected}
                          onChange={() => selectOperator(op.id)}/>

                        {selected && (
                          <span className={styles.operatorCheck}>
                            <IoCheckmark size={11} color="#ffffff" />
                          </span>
                        )}
                        <OperatorLogo operator={op} size={42} />
                        <span className={styles.operatorName}>{op.name}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.operator && (
                  <p className={styles.errorText} role="alert">
                    {errors.operator}
                  </p>
                )}
              </div>

              <label className={styles.label} htmlFor="amount">
                Recharge Amount
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
                  maxLength={5}
                  value={amount}
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? "amount-error" : undefined}
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/\D/g, ""));
                    setErrors((p) => ({ ...p, amount: undefined }));
                  }}
                />
              </div>
              {errors.amount && (
                <p className={styles.errorText} id="amount-error" role="alert">
                  {errors.amount}
                </p>
              )}

              <div className={styles.browseLinkWrapper}>
                <button type="button" className={styles.browseLink} onClick={openPlans}>
                  Browse Plans
                  
                </button>
              </div>

              <div className={styles.chips} role="group" aria-label="Popular amounts">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${amountNumber === value ? styles.chipActive : ""}`}
                    onClick={() => {
                      setAmount(String(value));
                      setErrors((p) => ({ ...p, amount: undefined }));
                    }}
                  >
                    ₹{value}
                  </button>
                ))}
              </div>

              <div className={styles.operatorSectionMobile}>
                <button type="button" className={styles.planCard} onClick={openPlans}>
                  <span className={styles.planIcon}>
                    <IoListOutline size={24} color="#1f7a4d" />
                  </span>
                  <span className={styles.planTextContainer}>
                    <span className={styles.planTitle}>View Recharge Plans</span>
                    <span className={styles.planSubtitle}>Check best plans for your number</span>
                  </span>
                  <IoChevronForward size={22} color="#3e6b4a" />
                </button>
              </div>
            </div>

            <button type="submit" className={styles.button}>
              Proceed to Mobile Recharge
            </button>
          </form>

          <aside className={styles.side} aria-label="Recharge Information">
            <div className={styles.sideHeroCard}>
              {/* <span className={styles.sideHeroBadge} aria-hidden="true">
                <IoPhonePortraitOutline size={30} />
              </span> */}
              <h2 className={styles.sideHeroTitle}>Instant & Secure Mobile Recharges</h2>
              <p className={styles.sideHeroDesc}>
                Experience seamless and fast online recharges across all top telecom operators.
                Enjoy exclusive data packs, talktime recharges, and zero transaction fees.
              </p>

              <ul className={styles.trustList}>
                <li>
                  <span className={styles.trustIcon}>
                    <IoShieldCheckmark size={20} />
                  </span>
                  <span>
                    <strong>100% Safe</strong>
                    <small>End-to-end encrypted</small>
                  </span>
                </li>
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

        <section
          ref={desktopOperatorRef}
          tabIndex={-1}
          className={styles.desktopOperatorCard}
          aria-labelledby="desktop-operator-heading"
        >
          <h3 id="desktop-operator-heading" className={styles.desktopOperatorTitle}>
            Select an Operator
          </h3>
          <div className={styles.desktopOperatorGrid}>
            {OPERATORS.map((op) => {
              const selected = op.id === operatorId;
              return (
                <button
                  type="button"
                  key={op.id}
                  aria-pressed={selected}
                  className={`${styles.desktopOperatorItem} ${selected ? styles.desktopOperatorItemSelected : ""}`}
                  onClick={() => selectOperator(op.id)}>

                  <div className={styles.desktopOperatorLogoWrapper} style={{ background: op.color }}>
                    {op.logo ? (
                      <img
                        src={op.logo}
                        alt=""
                        className={`${styles.operatorImg} ${op.whiteLogo ? styles.whiteLogo : ""}`}
                        style={{ width: `${(op.logoScale ?? 0.6) * 100}%`, height: `${(op.logoScale ?? 0.6) * 100}%` }}/>

                    ) : (
                      <span className={styles.jioText} style={{ fontSize: "20px" }}>{op.name}</span>
                    )}
                    {selected && (
                      <span className={styles.desktopOperatorCheck}>
                        <IoCheckmark size={12} color="#ffffff" />
                      </span>
                    )}
                  </div>
                  <span className={styles.desktopOperatorName}>{op.displayName}</span>
                </button>
              );
            })}
          </div>
          {errors.operator && (
            <p className={`${styles.errorText} ${styles.desktopOperatorError}`} role="alert">
              {errors.operator}
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

      {sheet === "plans" && operator && (
        <Sheet title={`${operator.name} recharge plans`} onClose={closeSheet}>
          <ul className={styles.planList}>
            {SAMPLE_PLANS.map((plan) => (
              <li key={plan.price}>
                <button type="button" className={styles.planItem} onClick={() => choosePlan(plan.price)}>
                  <span className={styles.planPrice}>{formatCurrency(plan.price)}</span>
                  <span className={styles.planDetails}>
                    <strong>
                      {plan.validity} · {plan.data}
                    </strong>
                    <small>{plan.extra}</small>
                  </span>
                  <IoChevronForward size={18} color="#3e6b4a" />
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.sheetNote}>
            Sample plans for demonstration. Connect your recharge-plans API to show live offers.
          </p>
        </Sheet>
      )}

      {sheet === "review" && operator && (
        <Sheet title={payStatus === "done" ? "Recharge successful" : "Review recharge"} onClose={closeSheet}>
          {payStatus === "done" ? (
            <div className={styles.success} role="status">
              <IoCheckmarkCircle size={54} color="#1f8a5b" />
              <p className={styles.successTitle}>
                {formatCurrency(amountNumber)} recharge to {formatMobile(mobile)}
              </p>
              <p className={styles.successText}>
                Your {operator.name} recharge is being processed and should reflect within a few minutes.
              </p>
              <Link to="/dashboard" className={styles.button}>
                Back to dashboard
              </Link>
            </div>
          ) : (
            <>
              <dl className={styles.reviewList}>
                <div className={styles.summaryRow}>
                  <dt>Mobile number</dt>
                  <dd>{formatMobile(mobile)}</dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt>Operator</dt>
                  <dd className={styles.summaryOperator}>
                    <OperatorLogo operator={operator} size={22} />
                    {operator.name}
                  </dd>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <dt>You pay</dt>
                  <dd>{formatCurrency(amountNumber)}</dd>
                </div>
              </dl>

              <button
                type="button"
                className={styles.button}
                disabled={payStatus === "paying"}
                onClick={() => setPayStatus("paying")}
              >
                {payStatus === "paying" ? "Processing…" : `Confirm & pay ${formatCurrency(amountNumber)}`}
              </button>
            </>
          )}
        </Sheet>
      )}
    </main>
  );
}
