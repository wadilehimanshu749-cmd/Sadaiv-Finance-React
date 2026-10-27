import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IoArrowDown, IoArrowBack, IoArrowUp, IoCheckmarkCircle, IoClose, IoEyeOffOutline, IoEyeOutline, IoReceiptOutline, IoSearchOutline, IoShieldCheckmark,} from "react-icons/io5";

import styles from "./History.module.css";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7123"
).replace(/\/+$/, "");

const BANK_ID_TO_CODE: Record<number, string> = {
    1: "SBI",
    2: "ICICI",
    3: "HDFC",
    4: "AXIS",
    5: "UBOI",
    6: "KOTAK",
};

type ApiBankAccount = {
    userBankAccountId: number;
    bankId: number;
    bankCode?: string;
    bankName: string;
    accountHolderName: string | null;
    accountNumberLast4?: string;
    accountNumberLast4Digits?: string;
    ifscCode: string | null;
    isPrimary?: boolean;
    isprimary?: boolean;
};

type LookupResponse = {
    linked?: boolean;
    message?: string;
    account?: ApiBankAccount;
};

interface Account {
    id: string;
    bank: string;
    accNo: string;
    type: string;
    balance: number;
    icon: string;
    initials: string;
    isPrimary: boolean;
}

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

type Tab = "all" | Kind;

const TABS: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "sent", label: "Sent" },
    { id: "received", label: "Received" },
];

const DUMMY_BALANCES: Record<string, number> = {
    SBI: 56780.2,
    ICICI: 38950.75,
    HDFC: 124560.5,
    AXIS: 45200,
    UBOI: 28450.25,
    KOTAK: 76500.8,
};

const BANK_PRESENTATION: Record<
    string,
    { icon: string; initials: string }
> = {
    SBI: { icon: "/images/sboi.png", initials: "SBI" },
    ICICI: { icon: "/images/icici.png", initials: "ICICI" },
    HDFC: { icon: "/images/hdfc.png", initials: "HDFC" },
    AXIS: { icon: "/images/axis.png", initials: "AXIS" },
    UBOI: { icon: "/images/union.png", initials: "UBI" },
    KOTAK: { icon: "/images/kotak.png", initials: "KOTAK" },
};

const TRANSACTIONS: Txn[] = [
    {
        id: "t1",
        kind: "sent",
        name: "Saurabh Patel",
        upi: "saurabh@upi",
        group: "Today",
        when: "Today, 09:21 AM",
        amount: 2500,
    },
    {
        id: "t2",
        kind: "received",
        name: "Neha Singh",
        upi: "neha.singh@upi",
        group: "Today",
        when: "Today, 08:45 AM",
        amount: 5000,
    },
    {
        id: "t3",
        kind: "sent",
        name: "Rahul Sharma",
        upi: "rahul.sharma@upi",
        group: "Yesterday",
        when: "Yesterday, 06:32 PM",
        amount: 1200,
    },
    {
        id: "t4",
        kind: "received",
        name: "Amit",
        upi: "amit@upi",
        group: "Yesterday",
        when: "Yesterday, 04:18 PM",
        amount: 3000,
    },
    {
        id: "t5",
        kind: "sent",
        name: "Priya Mehta",
        upi: "priya@upi",
        group: "12 May 2026",
        when: "12 May, 11:42 AM",
        amount: 750,
    },
];

const formatInr = (value: number, decimals = false) =>
    "₹" +
    value.toLocaleString(
        "en-IN",
        decimals
            ? {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
            : undefined,
    );

const signedAmount = (transaction: Txn) =>
    `${transaction.kind === "sent" ? "−" : "+"}${formatInr(
        transaction.amount,
    )}`;

const titleFor = (transaction: Txn) =>
    `${transaction.kind === "sent" ? "Sent to" : "Received from"} ${transaction.name
    }`;

function readUserId(): number | null {
    try {
        const savedProfile = sessionStorage.getItem("sadaivProfile");

        if (!savedProfile) return null;

        const profile = JSON.parse(savedProfile);
        const userId = Number(profile.userId);

        return Number.isInteger(userId) && userId > 0
            ? userId
            : null;
    } catch {
        return null;
    }
}

function getLinkedBankIds(userId: number): number[] {
    try {
        const raw = localStorage.getItem(`sadaivLinkedBanks_${userId}`);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter((id): id is number => Number.isInteger(id))
            : [];
    } catch {
        return [];
    }
}

function mapAccount(apiAccount: ApiBankAccount): Account {
    const resolvedBankCode = apiAccount.bankCode || BANK_ID_TO_CODE[apiAccount.bankId] || "BANK";

    const presentation = BANK_PRESENTATION[resolvedBankCode] ?? {
        icon: "",
        initials: resolvedBankCode,
    };

    const last4 =
        apiAccount.accountNumberLast4 ||
        apiAccount.accountNumberLast4Digits ||
        "0000";

    const isPrimaryFlag = Boolean(
        apiAccount.isPrimary ?? apiAccount.isprimary,
    );

    return {
        id: String(apiAccount.userBankAccountId),
        bank: apiAccount.bankName,
        accNo: `•••• ${last4}`,
        type: "Savings Account",
        balance: DUMMY_BALANCES[resolvedBankCode] ?? 10000,
        icon: presentation.icon,
        initials: presentation.initials,
        isPrimary: isPrimaryFlag,
    };
}

function BankLogo({
    account,
    size,
}: {
    account: Account;
    size: number;
}) {
    const [failed, setFailed] = useState(!account.icon);

    useEffect(() => {
        setFailed(!account.icon);
    }, [account.icon]);

    return (
        <span
            className={styles.bankLogo}
            style={{ width: size, height: size }}
            aria-hidden="true"
        >
            {failed ? (
                <span
                    className={styles.bankInitials}
                    style={{ fontSize: size * 0.26 }}
                >
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
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

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
                onClick={(event) => event.stopPropagation()}>

                <div className={styles.sheetHeader}>
                    <h2 className={styles.sheetTitle}>{title}</h2>

                    <button
                        type="button"
                        className={styles.sheetClose}
                        onClick={onClose}
                        aria-label="Close">

                        <IoClose size={22} />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}

export default function History() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [accountsLoading, setAccountsLoading] = useState(true);
    const [accountsError, setAccountsError] = useState("");

    const [tab, setTab] = useState<Tab>("all");
    const [query, setQuery] = useState("");
    const [revealed, setRevealed] = useState<Record<string, boolean>>({});
    const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null);

    const loadAccounts = useCallback(async () => {
        setAccountsLoading(true);
        setAccountsError("");

        const userId = readUserId();

        if (!userId) {
            setAccounts([]);
            setAccountsError("Please log in again to view your linked accounts.");
            setAccountsLoading(false);
            return;
        }

        const linkedBankIds = getLinkedBankIds(userId);

        if (linkedBankIds.length === 0) {
            setAccounts([]);
            setAccountsLoading(false);
            return;
        }

        try {
            const results = await Promise.all(
                linkedBankIds.map(async (bankId) => {
                    const response = await fetch(
                        `${API_BASE_URL}/api/auth/getbankaccount?userid=${userId}&bankid=${bankId}`,
                    );

                    if (response.status === 404) {
                        return null;
                    }

                    if (!response.ok) {
                        throw new Error(
                            `Failed to check linked account for bank ID ${bankId}.`,
                        );
                    }

                    const data = (await response.json()) as LookupResponse;

                    if (
                        data.linked !== true ||
                        !data.account ||
                        data.account.bankId !== bankId
                    ) {
                        return null;
                    }

                    return mapAccount(data.account);
                }),
            );

            const linkedAccounts = results.filter(
                (account): account is Account => account !== null,
            );

            linkedAccounts.sort(
                (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
            );

            setAccounts(linkedAccounts);
        } catch {
            setAccounts([]);
            setAccountsError(
                "Could not connect to the bank accounts API. Check that backend is running.",
            );
        } finally {
            setAccountsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAccounts();
    }, [loadAccounts]);

    const search = query.trim().toLowerCase();

    const filtered = TRANSACTIONS.filter(
        (transaction) =>
            (tab === "all" || transaction.kind === tab) &&
            (!search ||
                transaction.name.toLowerCase().includes(search) ||
                transaction.upi.toLowerCase().includes(search)),
    );

    const groups = filtered.reduce<{ label: string; items: Txn[] }[]>(
        (accumulator, transaction) => {
            const existing = accumulator.find(
                (group) => group.label === transaction.group,
            );

            if (existing) {
                existing.items.push(transaction);
            } else {
                accumulator.push({
                    label: transaction.group,
                    items: [transaction],
                });
            }

            return accumulator;
        },
        [],
    );

    const toggleBalance = (id: string) => {
        setRevealed((previous) => ({
            ...previous,
            [id]: !previous[id],
        }));
    };

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

                            <div className={styles.accountsHeading}>
                                <h2 id="accounts-heading"className={styles.sectionTitle}>

                                    Your Accounts
                                </h2>

                                <button
                                    type="button"
                                    className={styles.refreshButton}
                                    onClick={() => void loadAccounts()}
                                    disabled={accountsLoading}>

                                    {accountsLoading ? "Loading..." : "Refresh"}
                                </button>
                            </div>

                            {accountsLoading ? (
                                <p className={styles.accountsMessage}>
                                    Loading your linked accounts...
                                </p>
                            ) : accountsError ? (
                                <div className={styles.accountsMessage}>
                                    <p>{accountsError}</p>
                                    <button
                                        type="button"
                                        className={styles.retryButton}
                                        onClick={() => void loadAccounts()}
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : accounts.length === 0 ? (
                                <div className={styles.accountsMessage}>
                                    <p>No linked bank accounts found.</p>
                                    <Link
                                        to="/LinkedBankAccounts"
                                        className={styles.linkBankButton}
                                    >
                                        Link Bank Account
                                    </Link>
                                </div>
                            ) : (
                                <ul className={styles.accountList}>
                                    {accounts.map((account) => {
                                        const shown = !!revealed[account.id];

                                        return (
                                            <li
                                                key={account.id}
                                                className={styles.account}
                                            >
                                                <div className={styles.accountTop}>
                                                    <BankLogo
                                                        account={account}
                                                        size={46}
                                                    />

                                                    <div className={styles.accountInfo}>
                                                        <span className={styles.bankName}>
                                                            {account.bank}
                                                        </span>

                                                        <span className={styles.accountNumber}>
                                                            {account.accNo}
                                                        </span>

                                                        <span className={styles.accountType}>
                                                            {account.type}
                                                        </span>

                                                        {account.isPrimary && (
                                                            <span className={styles.primaryBadge}>
                                                                Primary account
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className={styles.accountBottom}>
                                                    <div className={styles.balanceBlock}>
                                                        <span className={styles.balanceLabel}>
                                                            Available balance
                                                        </span>

                                                        <span
                                                            className={styles.balanceValue}
                                                            aria-live="polite"
                                                        >
                                                            {shown
                                                                ? formatInr(account.balance, true)
                                                                : "₹ ••••••"}
                                                        </span>

                                                        <span className={styles.dummyLabel}>
                                                            Demo balance
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className={styles.balanceButton}
                                                        onClick={() =>
                                                            toggleBalance(account.id)
                                                        }
                                                        aria-pressed={shown}
                                                        aria-label={`${shown ? "Hide" : "Check"
                                                            } balance for ${account.bank}`}
                                                    >
                                                        {shown ? (
                                                            <IoEyeOffOutline
                                                                size={16}
                                                                aria-hidden="true"
                                                            />
                                                        ) : (
                                                            <IoEyeOutline
                                                                size={16}
                                                                aria-hidden="true"
                                                            />
                                                        )}

                                                        {shown ? "Hide" : "Check balance"}
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>

                        <div className={styles.secureCard}>
                            <span className={styles.secureIcon} aria-hidden="true">
                                <IoShieldCheckmark size={20} />
                            </span>

                            <div>
                                <p className={styles.secureTitle}>
                                    Secure Transactions
                                </p>
                                <p className={styles.secureSubtitle}>
                                    All your UPI transfers are protected
                                </p>
                            </div>
                        </div>
                    </div>

                    <section
                        className={`${styles.card} ${styles.historyCard}`}
                        aria-labelledby="history-heading"
                    >
                        <h2
                            id="history-heading"
                            className={styles.sectionTitle}
                        >
                            Transaction History
                        </h2>

                        <div className={styles.searchBox} role="search">
                            <IoSearchOutline
                                size={20}
                                color="#6f7772"
                                aria-hidden="true"
                            />

                            <input
                                className={styles.searchInput}
                                type="search"
                                placeholder="Search transactions"
                                aria-label="Search transactions"
                                autoComplete="off"
                                autoCapitalize="none"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                            />

                            {query && (
                                <button
                                    type="button"
                                    className={styles.clearBtn}
                                    onClick={() => setQuery("")}
                                    aria-label="Clear search"
                                >
                                    <IoClose size={18} />
                                </button>
                            )}
                        </div>

                        <div
                            className={styles.tabs}
                            role="tablist"
                            aria-label="Filter transactions"
                        >
                            {TABS.map(({ id, label }) => (
                                <button
                                    key={id}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === id}
                                    className={`${styles.tab} ${tab === id ? styles.tabActive : ""
                                        }`}
                                    onClick={() => setTab(id)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div role="tabpanel" aria-live="polite">
                            {groups.length > 0 ? (
                                groups.map((group) => (
                                    <div
                                        key={group.label}
                                        className={styles.group}
                                    >
                                        <h3 className={styles.dateTitle}>
                                            {group.label}
                                        </h3>

                                        <ul className={styles.txnList}>
                                            {group.items.map((transaction) => (
                                                <li key={transaction.id}>
                                                    <button
                                                        type="button"
                                                        className={styles.txn}
                                                        onClick={() =>
                                                            setSelectedTxn(transaction)
                                                        }
                                                    >
                                                        <span
                                                            className={`${styles.txnIcon} ${transaction.kind === "sent"
                                                                    ? styles.txnIconSent
                                                                    : styles.txnIconReceived
                                                                }`}
                                                            aria-hidden="true"
                                                        >
                                                            {transaction.kind === "sent" ? (
                                                                <IoArrowUp size={20} />
                                                            ) : (
                                                                <IoArrowDown size={20} />
                                                            )}
                                                        </span>

                                                        <span className={styles.txnDetails}>
                                                            <span className={styles.personName}>
                                                                {titleFor(transaction)}
                                                            </span>

                                                            <span className={styles.upiId}>
                                                                {transaction.upi}
                                                            </span>

                                                            <span className={styles.txnTime}>
                                                                {transaction.when}
                                                            </span>
                                                        </span>

                                                        <span className={styles.txnAmountCol}>
                                                            <span
                                                                className={
                                                                    transaction.kind === "sent"
                                                                        ? styles.sentAmount
                                                                        : styles.receivedAmount
                                                                }
                                                            >
                                                                {signedAmount(transaction)}
                                                            </span>

                                                            <span className={styles.statusPill}>
                                                                Successful
                                                            </span>
                                                        </span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState} role="status">
                                    <span
                                        className={styles.emptyIcon}
                                        aria-hidden="true"
                                    >
                                        <IoReceiptOutline size={26} />
                                    </span>

                                    <p className={styles.emptyTitle}>
                                        No transactions found
                                    </p>

                                    <p className={styles.emptyText}>
                                        {search
                                            ? `Nothing matches “${query.trim()}”.`
                                            : "There's nothing in this list yet."}
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
                        &copy; {new Date().getFullYear()} Sadaiv Finance.
                        All rights reserved.
                    </p>

                    <div className={styles.footerLinks}>
                        <Link to="/terms">Terms &amp; Conditions</Link>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/support">Help &amp; Support</Link>
                    </div>
                </div>
            </footer>

            {selectedTxn && (
                <Sheet
                    title="Transaction details"
                    onClose={() => setSelectedTxn(null)}
                >
                    <div className={styles.detailTop}>
                        <span
                            className={`${styles.detailIcon} ${selectedTxn.kind === "sent"
                                    ? styles.txnIconSent
                                    : styles.txnIconReceived
                                }`}
                            aria-hidden="true"
                        >
                            {selectedTxn.kind === "sent" ? (
                                <IoArrowUp size={24} />
                            ) : (
                                <IoArrowDown size={24} />
                            )}
                        </span>

                        <p
                            className={
                                selectedTxn.kind === "sent"
                                    ? styles.detailAmountSent
                                    : styles.detailAmountReceived
                            }
                        >
                            {signedAmount(selectedTxn)}
                        </p>

                        <p className={styles.detailStatus}>
                            <IoCheckmarkCircle size={16} aria-hidden="true" />
                            Successful
                        </p>
                    </div>

                    <dl className={styles.detailList}>
                        <div className={styles.detailRow}>
                            <dt>
                                {selectedTxn.kind === "sent"
                                    ? "Paid to"
                                    : "Received from"}
                            </dt>
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
                            <dd>
                                {selectedTxn.kind === "sent"
                                    ? "Money sent"
                                    : "Money received"}
                            </dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        className={styles.button}
                        onClick={() => setSelectedTxn(null)}
                    >
                        Done
                    </button>
                </Sheet>
            )}
        </main>
    );
}