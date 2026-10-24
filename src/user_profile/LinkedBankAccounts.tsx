import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faBuildingColumns,
    faCheck,
    faCircleCheck,
    faCircleExclamation,
    faShieldHalved,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./LinkedBankAccounts.module.css";

type StoredProfile = {
    userId?: number;
};

type LinkedAccount = {
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

type GetBankAccount = {
    linked?: boolean;
    message?: string;
    account?: LinkedAccount;
};

type Bank = {
    bankId: number;
    bankCode: string;
    bankName: string;
    shortName: string;
};

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7123"
).replace(/\/+$/, "");

const BANKS: Bank[] = [
    { bankId: 1, bankCode: "SBI", bankName: "State Bank of India", shortName: "SBI" },
    { bankId: 2, bankCode: "ICICI", bankName: "ICICI Bank", shortName: "ICICI" },
    { bankId: 3, bankCode: "HDFC", bankName: "HDFC Bank", shortName: "HDFC" },
    { bankId: 4, bankCode: "AXIS", bankName: "Axis Bank", shortName: "AXIS" },
    { bankId: 5, bankCode: "UBOI", bankName: "Union Bank of India", shortName: "UNION" },
    { bankId: 6, bankCode: "KOTAK", bankName: "Kotak Mahindra Bank", shortName: "KOTAK" },
];

type PopupState = {
    type: "success" | "error";
    title: string;
    message: string;
    account?: LinkedAccount;
} | null;

function getStoredUserId(): number | null {
    try {
        const savedProfile = sessionStorage.getItem("sadaivProfile");

        if (!savedProfile) return null;

        const profile = JSON.parse(savedProfile) as StoredProfile;
        const userId = Number(profile.userId);

        return Number.isInteger(userId) && userId > 0 ? userId : null;
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

function addLinkedBankId(userId: number, bankId: number): number[] {
    const existing = getLinkedBankIds(userId);
    const updated = Array.from(new Set([...existing, bankId]));
    localStorage.setItem(`sadaivLinkedBanks_${userId}`, JSON.stringify(updated));
    return updated;
}

export default function LinkBankAccount() {
    const navigate = useNavigate();

    const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
    const [loadingBankId, setLoadingBankId] = useState<number | null>(null);
    const [linkedBankIds, setLinkedBankIds] = useState<number[]>([]);
    const [popup, setPopup] = useState<PopupState>(null);

    useEffect(() => {
        const userId = getStoredUserId();
        if (userId) {
            setLinkedBankIds(getLinkedBankIds(userId));
        }
    }, []);

    const handleBankSelect = async (bank: Bank) => {
        if (loadingBankId !== null) return;

        const userId = getStoredUserId();

        if (!userId) {
            setPopup({
                type: "error",
                title: "Login required",
                message: "Please log in again to link your bank account.",
            });
            return;
        }

        setSelectedBankId(bank.bankId);
        setLoadingBankId(bank.bankId);
        setPopup(null);

        try {
            let response = await fetch(
                `${API_BASE_URL}/api/auth/linkbankaccount`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId,
                        bankId: bank.bankId,
                    }),
                },
            );

            if (response.status === 404 || response.status === 405) {
                response = await fetch(
                    `${API_BASE_URL}/api/auth/getbankaccount?userid=${userId}&bankid=${bank.bankId}`,
                );
            }

            const data = (await response.json()) as GetBankAccount;

            if (!response.ok || !data.linked || !data.account) {
                setPopup({
                    type: "error",
                    title: "Bank account not linked",
                    message:
                        data.message ||
                        `The backend could not confirm a linked ${bank.bankName} account.`,
                });
                return;
            }

            const updatedIds = addLinkedBankId(userId, bank.bankId);
            setLinkedBankIds(updatedIds);

            setPopup({
                type: "success",
                title: "Bank account linked",
                message: `${bank.bankName} has been successfully linked to your SADAIV profile.`,
                account: data.account,
            });
        } catch (error) {
            console.error("Link bank account error:", error);

            setPopup({
                type: "error",
                title: "Bank account request failed",
                message:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred.",
            });
        } finally {
            setLoadingBankId(null);
        }
    };

    const last4Digits =
        popup?.account?.accountNumberLast4 ||
        popup?.account?.accountNumberLast4Digits ||
        "0000";

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate("/MyProfile")}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Back to My Profile</span>
                </button>

                <section className={styles.pageHeading}>
                    <div>
                        <p className={styles.eyebrow}>BANKING SERVICES</p>
                        <h1>Link Bank Account</h1>
                        <p className={styles.subtitle}>
                            Select your bank to check whether an account is already
                            linked to your SADAIV profile.
                        </p>
                    </div>

                    <div className={styles.headingIcon}>
                        <FontAwesomeIcon icon={faBuildingColumns} />
                    </div>
                </section>

                <section className={styles.infoCard}>
                    <div className={styles.infoIcon}>
                        <FontAwesomeIcon icon={faShieldHalved} />
                    </div>

                    <div>
                        <h3>Secure account lookup</h3>
                        <p>
                            Choose your bank below. SADAIV will check the existing
                            account records and display the result.
                        </p>
                    </div>
                </section>

                <section className={styles.bankSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h2>Select your bank</h2>
                            <p>Choose a bank to check its linked account.</p>
                        </div>

                        <span className={styles.bankCount}>
                            {BANKS.length} banks
                        </span>
                    </div>

                    <div className={styles.bankGrid}>
                        {BANKS.map((bank) => {
                            const isLoading = loadingBankId === bank.bankId;
                            const isSelected =
                                selectedBankId === bank.bankId ||
                                linkedBankIds.includes(bank.bankId);

                            return (
                                <button
                                    key={bank.bankId}
                                    type="button"
                                    className={`${styles.bankCard} ${isSelected ? styles.selectedBank : ""
                                        }`}
                                    onClick={() => handleBankSelect(bank)}
                                    disabled={loadingBankId !== null}
                                    aria-label={`Check ${bank.bankName}`}
                                >
                                    <span className={styles.bankLogo}>
                                        <FontAwesomeIcon icon={faBuildingColumns} />
                                    </span>

                                    <span className={styles.bankInfo}>
                                        <span className={styles.bankName}>
                                            {bank.bankName}
                                        </span>
                                        <span className={styles.bankCode}>
                                            {bank.bankCode}
                                        </span>
                                    </span>

                                    <span className={styles.bankAction}>
                                        {isLoading ? (
                                            <span className={styles.spinner} />
                                        ) : isSelected ? (
                                            <FontAwesomeIcon icon={faCheck} />
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={faArrowLeft}
                                                rotation={180}
                                            />
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <div className={styles.footerNote}>
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span>
                        This development screen checks existing database records.
                        It does not verify bank ownership or send an OTP.
                    </span>
                </div>
            </div>

            {popup && (
                <div
                    className={styles.modalOverlay}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setPopup(null);
                        }
                    }}
                >
                    <section
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="bank-popup-title"
                    >
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={() => setPopup(null)}
                            aria-label="Close popup"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>

                        <div
                            className={`${styles.popupIcon} ${popup.type === "success"
                                ? styles.successIcon
                                : styles.errorIcon
                                }`}
                        >
                            <FontAwesomeIcon
                                icon={
                                    popup.type === "success"
                                        ? faCircleCheck
                                        : faCircleExclamation
                                }
                            />
                        </div>

                        <h2 id="bank-popup-title">{popup.title}</h2>

                        <p className={styles.popupMessage}>{popup.message}</p>

                        {popup.type === "success" && popup.account && (
                            <div className={styles.accountDetails}>
                                <div className={styles.accountBank}>
                                    <FontAwesomeIcon icon={faBuildingColumns} />
                                    <span>{popup.account.bankName}</span>
                                </div>

                                <div className={styles.accountRow}>
                                    <span>Account holder</span>
                                    <strong>
                                        {popup.account.accountHolderName ||
                                            "Not available"}
                                    </strong>
                                </div>

                                <div className={styles.accountRow}>
                                    <span>Account number</span>
                                    <strong>**** **** {last4Digits}</strong>
                                </div>

                                <div className={styles.accountRow}>
                                    <span>IFSC code</span>
                                    <strong>
                                        {popup.account.ifscCode || "Not available"}
                                    </strong>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            className={styles.popupButton}
                            onClick={() => {
                                const wasSuccess = popup.type === "success";
                                setPopup(null);
                                if (wasSuccess) {
                                    navigate("/history");
                                }
                            }}
                        >
                            {popup.type === "success" ? "Done" : "Try again"}
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}