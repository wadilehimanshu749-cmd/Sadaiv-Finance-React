import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBack, IoCarSportOutline, IoClose, IoFlash, IoHeadsetOutline, IoInformationCircleOutline, IoLockClosed, IoSearchOutline, IoShieldCheckmark,} from "react-icons/io5";

import styles from "./FastTag.module.css";

interface Provider {
  id: string;
  name: string;
  icon: string;
  initials: string;
  popular: boolean;
}

const PROVIDERS: Provider[] = [
  { id: "idfc", name: "IDFC FIRST FASTag", icon: "/images/IDFC.png", initials: "IDFC", popular: true },
  { id: "icici", name: "ICICI Bank FASTag", icon: "/images/ICICI.png", initials: "ICICI", popular: true },
  { id: "sbi", name: "State Bank of India SBI - FASTag", icon: "/images/sboi.png", initials: "SBI", popular: true },
  { id: "axis", name: "Axis Bank FASTag", icon: "/images/axis.png", initials: "AXIS", popular: true },
];

const PAYMENT_ROUTE = "/fasttag-payment";
const VEHICLE_RE = /^[A-Z0-9]{6,10}$/;

const STEPS = [
  { title: "Choose your FASTag bank", text: "Pick the bank that issued your FASTag." },
  { title: "Enter your vehicle number", text: "Use the number linked with your FASTag." },
  { title: "Recharge and go", text: "Add balance and skip the toll queue." },
];

function ProviderLogo({ provider, className }: { provider: Provider; className: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={className} aria-hidden="true">
      {failed ? (
        <span className={styles.logoInitials}>{provider.initials}</span>
      ) : (
        <img
          src={provider.icon}
          alt=""
          className={styles.logoImg}
          onError={() => setFailed(true)}
        />
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

export default function FastTag() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [error, setError] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);

  const vehicleRef = useRef<HTMLInputElement>(null);

  const selected = PROVIDERS.find((p) => p.id === selectedId);
  const search = query.trim().toLowerCase();
  const visible = PROVIDERS.filter((p) => p.name.toLowerCase().includes(search));

  useEffect(() => {
    if (popupOpen && window.matchMedia("(hover: hover)").matches) {
      vehicleRef.current?.focus();
    }
  }, [popupOpen]);

  const selectProvider = (id: string) => {
    setSelectedId(id);
    setVehicleNumber("");
    setError("");
    setPopupOpen(true);
  };

  const handleConfirm = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!selected) return;

    if (!VEHICLE_RE.test(vehicleNumber)) {
      setError("Enter a valid vehicle number, e.g. MH12AB1234.");
      vehicleRef.current?.focus();
      return;
    }

    setPopupOpen(false);

    const params = new URLSearchParams({ provider: selected.name, vehicle: vehicleNumber });
    navigate(`${PAYMENT_ROUTE}?${params.toString()}`);
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
            <h1 className={styles.headerTitle}>FASTag Recharge</h1>
            <p className={styles.headerSubtitle}>Recharge your FASTag in seconds</p>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.formCard}>
            <div className={styles.cardHeaderDesktop}>
              <h2 className={styles.cardMainTitle}>FASTag Recharge Online</h2>
              <p className={styles.cardMainSub}>Find your FASTag provider to get started.</p>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>
                <IoCarSportOutline size={28} color="#1f7a4d" />
              </span>
              <div>
                <p className={styles.infoTitle}>Recharge your FASTag</p>
                <p className={styles.infoSubtitle}>Fast • Safe • Convenient</p>
              </div>
            </div>

            <label className={styles.label} htmlFor="bank-search">
              Search by bank name
            </label>
            <div className={styles.searchBox} role="search">
              <IoSearchOutline size={20} color="#89918c" aria-hidden="true" />
              <input
                id="bank-search"
                className={styles.input}
                type="search"
                placeholder="e.g. ICICI, Axis, SBI"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}/>

              {query && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setQuery("")}
                  aria-label="Clear search">

                  <IoClose size={18} />
                </button>
              )}
            </div>

            <ol className={styles.steps}>
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <span className={styles.stepNum} aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className={styles.stepText}>
                    <strong>{step.title}</strong>
                    <small>{step.text}</small>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <aside className={styles.side} aria-label="FASTag information">
            <div className={styles.sideHeroCard}>
              {/* <span className={styles.sideHeroBadge} aria-hidden="true">
                <IoCarSportOutline size={30} />
              </span> */}
              <h2 className={styles.sideHeroTitle}>Recharge your FASTag in seconds</h2>
              <p className={styles.sideHeroDesc}>
                Pick your FASTag bank, enter your vehicle number and top up instantly. Keep your
                balance topped up and breeze through toll plazas without the queue.
              </p>

              <ul className={styles.trustList}>
                <li>
                  <span className={styles.trustIcon}>
                    <IoFlash size={20} />
                  </span>
                  <span>
                    <strong>Instant</strong>
                    <small>Balance updated in seconds</small>
                  </span>
                </li>
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

        <section className={styles.providersCard} aria-labelledby="providers-heading">
          <h3 id="providers-heading" className={styles.providersTitle}>
            {search ? "Search results" : "Popular banks"}
          </h3>

          {visible.length > 0 ? (
            <div className={styles.providerGrid}>
              {visible.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={styles.provider}
                  onClick={() => selectProvider(p.id)}>

                  <ProviderLogo provider={p} className={styles.providerLogo} />
                  <span className={styles.providerName}>{p.name}</span>
                  {p.popular && <span className={styles.popularTag}>Popular</span>}
                </button>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState} role="status">
              No FASTag provider found for “{query.trim()}”. Try a different bank name.
            </p>
          )}

          <p className={styles.bottomInfo}>
            <IoInformationCircleOutline size={18} color="#245d45" aria-hidden="true" />
            Select your FASTag provider to continue
          </p>
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

      {popupOpen && selected && (
        <Sheet title="FASTag Details" onClose={() => setPopupOpen(false)}>
          <form onSubmit={handleConfirm} noValidate>
            <div className={styles.selectedProvider}>
              <ProviderLogo provider={selected} className={styles.popupLogo} />
              <div>
                <p className={styles.selectedLabel}>Selected Provider</p>
                <p className={styles.selectedName}>{selected.name}</p>
              </div>
            </div>

            <label className={styles.label} htmlFor="vehicle">
              Vehicle Number
            </label>
            <div className={`${styles.inputBox} ${error ? styles.inputError : ""}`}>
              <input
                ref={vehicleRef}
                id="vehicle"
                className={`${styles.input} ${styles.vehicleInput}`}
                type="text"
                placeholder="e.g. MH12AB1234"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={10}
                value={vehicleNumber}
                aria-invalid={!!error}
                aria-describedby="vehicle-help"
                onChange={(e) => {
                  setVehicleNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                  setError("");
                }}/>

            </div>
            <p
              id="vehicle-help"
              className={error ? styles.errorText : styles.helpText}
              role={error ? "alert" : undefined}>

              {error || "Enter your vehicle number linked with FASTag"}
            </p>

            <button type="submit" className={styles.button} disabled={vehicleNumber.trim() === ""}>
              Confirm & Continue
            </button>

            <p className={styles.secureNote}>
              <IoLockClosed size={14} color="#245d45" aria-hidden="true" />
              Your information is secure
            </p>
          </form>
        </Sheet>
      )}
    </main>
  );
}
