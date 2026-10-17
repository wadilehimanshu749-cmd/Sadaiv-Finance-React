import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoArrowDown,IoArrowBack, IoArrowUp, IoCheckmarkCircle, IoClose, IoEyeOffOutline, IoEyeOutline, IoReceiptOutline, IoSearchOutline, IoShieldCheckmark, } from "react-icons/io5";

import styles from "./History.module.css";

interface Account {
    id: string;
    bank: string;
    accNo: string;
    type: string;
    balance: number;
    icon: string;
    initials: string;
}

const ACCOUNTS: Account[] = [
    { id: "hdfc", bank: "HDFC Bank", accNo: "•••• 1234", type: "Saving Account", balance: 124560.5, icon: "/images/hdfc.png", initials: "HDFC" },
    { id: "sbi", bank: "State Bank of India", accNo: "•••• 5678", type: "Saving Account", balance: 56780.2, icon: "/images/sboi.png", initials: "SBI" },
];

type Kind = "sent" | "received";

interface Txn {
    id: string;
    kind: Kind;
    name: string;
    upi: string;
    group: string;
    when: string;
    amount: number;
}

const TRANSACTIONS: Txn[] = [
    { id: "t1", kind: "sent", name: "Saurabh Patel", upi: "saurabh@upi", group: "Today", when: "Today, 09:21 AM", amount: 2500 },
    { id: "t2", kind: "received", name: "Neha Singh", upi: "neha.singh@upi", group: "Today", when: "Today, 08:45 AM", amount: 5000 },
    { id: "t3", kind: "sent", name: "Rahul Sharma", upi: "rahul.sharma@upi", group: "Yesterday", when: "Yesterday, 06:32 PM", amount: 1200 },
    { id: "t4", kind: "received", name: "Amit", upi: "amit@upi", group: "Yesterday", when: "Yesterday, 04:18 PM", amount: 3000 },
    { id: "t5", kind: "sent", name: "Priya Mehta", upi: "priya@upi", group: "12 May 2026", when: "12 May, 11:42 AM", amount: 750 },
];

type Tab = "all" | Kind;

const TABS: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "sent", label: "Sent" },
    { id: "received", label: "Received" },
];

const formatInr = (value: number, decimals = false) =>
    "₹" +
    value.toLocaleString(
        "en-IN",
        decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : undefined,
    );

const signedAmount = (t: Txn) => `${t.kind === "sent" ? "−" : "+"}${formatInr(t.amount)}`;

const titleFor = (t: Txn) => `${t.kind === "sent" ? "Sent to" : "Received from"} ${t.name}`;


function BankLogo({ account, size }: { account: Account; size: number }) {
    const [failed, setFailed] = useState(false);

    return (
        <span className={styles.bankLogo} style={{ width: size, height: size }} aria-hidden="true">
            {failed ? (
                <span className={styles.bankInitials} style={{ fontSize: size * 0.26 }}>
                    {account.initials}
                </span>
            ) : (
                <img src={account.icon} alt="" className={styles.bankLogoImg} onError={() => setFailed(true)} />
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


export default function History() {
    const [tab, setTab] = useState<Tab>("all");
    const [query, setQuery] = useState("");
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null);

    const search = query.trim().toLowerCase();
    const filtered = TRANSACTIONS.filter(
        (t) =>
            (tab === "all" || t.kind === tab) &&
            (!search || t.name.toLowerCase().includes(search) || t.upi.toLowerCase().includes(search)),
    );

    const groups = filtered.reduce<{ label: string; items: Txn[] }[]>((acc, t) => {
        const existing = acc.find((g) => g.label === t.group);
        if (existing) existing.items.push(t);
        else acc.push({ label: t.group, items: [t] });
        return acc;
    }, []);

    const toggleBalance = (id: string) => setRevealed((p) => ({ ...p, [id]: !p[id] }));

    return (
        <main className={styles.page}>
            <div className={`${styles.container} ${styles.content}`}>
                <header className={styles.header}>
                    <button
                        type="button"
                        className={styles.headerIconBtn}
                        onClick={() => window.history.back()}
                        aria-label="Go back">
                            
                        <IoArrowBack size={22} />
                    </button>

                    <div className={styles.headerTextWrapper}>
                        <h1 className={styles.headerTitle}>Money</h1>
                        <p className={styles.headerSubtitle}>
                            Your accounts and transaction history
                        </p>
                    </div>
                </header>

                <div className={styles.layout}>
                    <div className={styles.sidebar}>
                        <section className={styles.card} aria-labelledby="accounts-heading">
                            <h2 id="accounts-heading" className={styles.sectionTitle}>
                                Your Accounts
                            </h2>

                            <ul className={styles.accountList}>
                                {ACCOUNTS.map((acc) => {
                                    const shown = !!revealed[acc.id];
                                    return (
                                        <li key={acc.id} className={styles.account}>
                                            <div className={styles.accountTop}>
                                                <BankLogo account={acc} size={46} />
                                                <div className={styles.accountInfo}>
                                                    <span className={styles.bankName}>{acc.bank}</span>
                                                    <span className={styles.accountNumber}>{acc.accNo}</span>
                                                    <span className={styles.accountType}>{acc.type}</span>
                                                </div>
                                            </div>

                                            <div className={styles.accountBottom}>
                                                <div className={styles.balanceBlock}>
                                                    <span className={styles.balanceLabel}>Available balance</span>
                                                    <span className={styles.balanceValue} aria-live="polite">
                                                        {shown ? formatInr(acc.balance, true) : "₹ ••••••"}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.balanceButton}
                                                    onClick={() => toggleBalance(acc.id)}
                                                    aria-pressed={shown}
                                                    aria-label={`${shown ? "Hide" : "Check"} balance for ${acc.bank}`}>

                                                    {shown ? <IoEyeOffOutline size={16} aria-hidden="true" /> : <IoEyeOutline size={16} aria-hidden="true" />}
                                                    {shown ? "Hide" : "Check balance"}
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>

                        <div className={styles.secureCard}>
                            <span className={styles.secureIcon} aria-hidden="true">
                                <IoShieldCheckmark size={20} />
                            </span>
                            <div>
                                <p className={styles.secureTitle}>Secure Transactions</p>
                                <p className={styles.secureSubtitle}>All your UPI transfers are protected</p>
                            </div>
                        </div>
                    </div>

                    <section className={`${styles.card} ${styles.historyCard}`} aria-labelledby="history-heading">
                        <h2 id="history-heading" className={styles.sectionTitle}>
                            Transaction History
                        </h2>

                        <div className={styles.searchBox} role="search">
                            <IoSearchOutline size={20} color="#6f7772" aria-hidden="true" />
                            <input
                                className={styles.searchInput}
                                type="search"
                                placeholder="Search transactions"
                                aria-label="Search transactions"
                                autoComplete="off"
                                autoCapitalize="none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)} />

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

                        <div className={styles.tabs} role="tablist" aria-label="Filter transactions">
                            {TABS.map(({ id, label }) => (
                                <button
                                    key={id}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === id}
                                    className={`${styles.tab} ${tab === id ? styles.tabActive : ""}`}
                                    onClick={() => setTab(id)}>

                                    {label}
                                </button>
                            ))}
                        </div>

                        <div role="tabpanel" aria-live="polite">
                            {groups.length > 0 ? (
                                groups.map((group) => (
                                    <div key={group.label} className={styles.group}>
                                        <h3 className={styles.dateTitle}>{group.label}</h3>
                                        <ul className={styles.txnList}>
                                            {group.items.map((t) => (
                                                <li key={t.id}>
                                                    <button type="button" className={styles.txn} onClick={() => setSelectedTxn(t)}>
                                                        <span
                                                            className={`${styles.txnIcon} ${t.kind === "sent" ? styles.txnIconSent : styles.txnIconReceived}`}
                                                            aria-hidden="true">

                                                            {t.kind === "sent" ? <IoArrowUp size={20} /> : <IoArrowDown size={20} />}
                                                        </span>
                                                        <span className={styles.txnDetails}>
                                                            <span className={styles.personName}>{titleFor(t)}</span>
                                                            <span className={styles.upiId}>{t.upi}</span>
                                                            <span className={styles.txnTime}>{t.when}</span>
                                                        </span>
                                                        <span className={styles.txnAmountCol}>
                                                            <span className={t.kind === "sent" ? styles.sentAmount : styles.receivedAmount}>
                                                                {signedAmount(t)}
                                                            </span>
                                                            <span className={styles.statusPill}>Successful</span>
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState} role="status">
                                    <span className={styles.emptyIcon} aria-hidden="true">
                                        <IoReceiptOutline size={26} />
                                    </span>
                                    <p className={styles.emptyTitle}>No transactions found</p>
                                    <p className={styles.emptyText}>
                                        {search ? `Nothing matches “${query.trim()}”.` : "There's nothing in this list yet."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
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

            {selectedTxn && (
                <Sheet title="Transaction details" onClose={() => setSelectedTxn(null)}>
                    <div className={styles.detailTop}>
                        <span
                            className={`${styles.detailIcon} ${selectedTxn.kind === "sent" ? styles.txnIconSent : styles.txnIconReceived}`}
                            aria-hidden="true">

                            {selectedTxn.kind === "sent" ? <IoArrowUp size={24} /> : <IoArrowDown size={24} />}
                        </span>
                        <p className={selectedTxn.kind === "sent" ? styles.detailAmountSent : styles.detailAmountReceived}>
                            {signedAmount(selectedTxn)}
                        </p>
                        <p className={styles.detailStatus}>
                            <IoCheckmarkCircle size={16} aria-hidden="true" /> Successful
                        </p>
                    </div>

                    <dl className={styles.detailList}>
                        <div className={styles.detailRow}>
                            <dt>{selectedTxn.kind === "sent" ? "Paid to" : "Received from"}</dt>
                            <dd>{selectedTxn.name}</dd>
                        </div>
                        <div className={styles.detailRow}>
                            <dt>UPI ID</dt>
                            <dd>{selectedTxn.upi}</dd>
                        </div>
                        <div className={styles.detailRow}>
                            <dt>Date &amp; time</dt>
                            <dd>{selectedTxn.when}</dd>
                        </div>
                        <div className={styles.detailRow}>
                            <dt>Type</dt>
                            <dd>{selectedTxn.kind === "sent" ? "Money sent" : "Money received"}</dd>
                        </div>
                    </dl>

                    <button type="button" className={styles.button} onClick={() => setSelectedTxn(null)}>
                        Done
                    </button>
                </Sheet>
            )}
        </main>
    );
}
