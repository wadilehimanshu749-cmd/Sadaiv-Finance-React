import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCreditCard, faFileLines, faCircleQuestion, faUser, } from "@fortawesome/free-regular-svg-icons";
import { faArrowRightFromBracket, faBuildingColumns, faCheck, faChevronDown, faCircleCheck, faShieldHalved, } from "@fortawesome/free-solid-svg-icons";
import styles from "./Profilemenu.module.css";

export type ProfileUser = {
  name: string;
  email: string;
  customerId: string;
  kycVerified: boolean;
  linkedAccount?: { bank: string; last4: string };
};

type Props = {
  user: ProfileUser;
  onLogout?: () => void;
};

const MENU_ITEMS = [
  { to: "/MyProfile", label: "My profile", icon: faUser },
  { to: "/profile/accounts", label: "Bank accounts & cards", icon: faCreditCard },
  { to: "/profile/security", label: "Security & login", icon: faShieldHalved },
  { to: "/documents", label: "Documents & statements", icon: faFileLines },
  { to: "/support", label: "Help & support", icon: faCircleQuestion },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Profilemenu({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.customerId);
      setCopied(true);
    } catch {

    }
  };

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) onLogout();
    else navigate("/login");
  };

  const initials = getInitials(user.name);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.open : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="profile-panel">

        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
      </button>

      {open && (
        <div
          id="profile-panel"
          className={styles.panel}
          role="region"
          aria-label="Account">

          <div className={styles.identity}>
            <span className={`${styles.avatar} ${styles.avatarLg}`} aria-hidden="true">
              {initials}
            </span>

            <div className={styles.identityText}>
              <p className={styles.name}>{user.name}</p>
              <p className={styles.email}>{user.email}</p>

              {user.kycVerified ? (
                <span className={`${styles.badge} ${styles.badgeOk}`}>
                  <FontAwesomeIcon icon={faCircleCheck} />
                  KYC verified
                </span>
              ) : (
                <Link
                  to="/profile/kyc"
                  className={`${styles.badge} ${styles.badgeWarn}`}
                  onClick={() => setOpen(false)}>

                  Complete your KYC
                </Link>
              )}
            </div>
          </div>

          <dl className={styles.details}>
            <div className={styles.detailRow}>
              <dt>Customer ID</dt>
              <dd>
                <span className={styles.mono}>{user.customerId}</span>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={handleCopy}
                  aria-label={copied ? "Customer ID copied" : "Copy customer ID"}>

                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                </button>
              </dd>
            </div>

            {user.linkedAccount && (
              <div className={styles.detailRow}>
                <dt>Linked account</dt>
                <dd>
                  <FontAwesomeIcon icon={faBuildingColumns} className={styles.bankIcon} />
                  <span>
                    {user.linkedAccount.bank}{" "}
                    <span className={styles.mono}>•••• {user.linkedAccount.last4}</span>
                  </span>
                </dd>
              </div>
            )}
          </dl>

          <span className={styles.srOnly} aria-live="polite">
            {copied ? "Customer ID copied" : ""}
          </span>

          <nav className={styles.list} aria-label="Account links">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={styles.item}
                onClick={() => setOpen(false)}>

                <FontAwesomeIcon icon={item.icon} className={styles.itemIcon} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.footer}>
            <button type="button" className={styles.logout} onClick={handleLogout}>
              <FontAwesomeIcon icon={faArrowRightFromBracket} className={styles.itemIcon} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
