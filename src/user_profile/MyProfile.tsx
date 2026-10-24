import { useState } from "react";
import type { SyntheticEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faEnvelope, faLock,faBuildingColumns, faMobileScreenButton, faPen, faShieldHalved, faUser, faXmark, } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import styles from "./MyProfile.module.css";

type EditableField = "name" | "email";

type StoredProfile = {
    userId?: number;
    name?: string;
    email?: string;
    mobileNumber?: string;
};

type UpdateResponse = {
    success: boolean;
    message: string;
};

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7123"
).replace(/\/+$/, "");

function readProfile(): StoredProfile {
    try {
        const savedProfile = sessionStorage.getItem("sadaivProfile");
        return savedProfile ? JSON.parse(savedProfile) : {};
    } catch {
        return {};
    }
}

export default function MyProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<StoredProfile>(readProfile);
    const [activeField, setActiveField] = useState<EditableField | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const openEditor = (field: EditableField) => {
        setActiveField(field);
        setInputValue(field === "name" ? profile.name ?? "" : profile.email ?? "");
        setError("");
        setSuccessMessage("");
    };

    const closeEditor = () => {
        if (saving) return;

        setActiveField(null);
        setInputValue("");
        setError("");
    };

    const handleSave = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!profile.userId) {
            setError("Your user ID is missing. Please log in again.");
            return;
        }

        const value = inputValue.trim();

        if (activeField === "name") {
            if (!value) {
                setError("Please enter your full name.");
                return;
            }

            if (value.length > 100) {
                setError("Your name cannot exceed 100 characters.");
                return;
            }
        }

        if (activeField === "email") {
            if (!value) {
                setError("Please enter your email address.");
                return;
            }

            if (value.length > 100) {
                setError("Your email cannot exceed 100 characters.");
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setError("Please enter a valid email address.");
                return;
            }
        }

        if (!activeField) return;

        const updatedName =
            activeField === "name" ? value : profile.name ?? "";

        const updatedEmail =
            activeField === "email" ? value : profile.email ?? "";

        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: profile.userId,
                    fullName: activeField === "name" ? value : null,
                    email: activeField === "email" ? value : null,
                }),
            });

            const data = (await response.json()) as UpdateResponse;

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to update your profile.");
            }

            const updatedProfile: StoredProfile = {
                ...profile,
                name: updatedName,
                email: updatedEmail,
            };

            sessionStorage.setItem(
                "sadaivProfile",
                JSON.stringify(updatedProfile)
            );

            setProfile(updatedProfile);

            window.dispatchEvent(new Event("sadaivProfileUpdated"));

            setActiveField(null);
            setInputValue("");
            setSuccessMessage(activeField === "name"
                ? "Your name has been updated successfully."
                : "Your email has been updated successfully."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const initials = (profile.name || "User")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate("/dashboard")}>

                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Back to dashboard</span>
                </button>

                <section className={styles.pageHeading}>
                    <div>
                        <p className={styles.eyebrow}>ACCOUNT SETTINGS</p>
                        <h1>My Profile</h1>
                        <p className={styles.subtitle}>
                            Manage your personal information and keep your account details
                            up to date.
                        </p>
                    </div>

                    <div className={styles.headingIcon}>
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                </section>

                {successMessage && (
                    <div className={styles.successBanner} role="status">
                        <FontAwesomeIcon icon={faCheck} />
                        <span>{successMessage}</span>
                        <button
                            type="button"
                            aria-label="Dismiss message"
                            onClick={() => setSuccessMessage("")}>

                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}

                <section className={styles.profileCard}>
                    <div className={styles.profileHero}>
                        <div className={styles.avatar}>{initials || "U"}</div>

                        <div className={styles.heroInfo}>
                            <p className={styles.heroLabel}>YOUR SADAIV ACCOUNT</p>
                            <h2>{profile.name?.trim() || "Your name"}</h2>
                            <p>{profile.email || "Email address not added"}</p>
                        </div>

                        <div className={styles.accountBadge}>
                            <FontAwesomeIcon icon={faShieldHalved} />
                            <span>Account profile</span>
                        </div>
                    </div>

                    <div className={styles.sectionHeader}>
                        <div>
                            <h3>Personal information</h3>
                            <p>Review and update your registered details.</p>
                        </div>
                        <span className={styles.secureLabel}>
                            <FontAwesomeIcon icon={faLock} />
                            Secure details
                        </span>
                    </div>

                    <div className={styles.detailsList}>
                        <div className={styles.detailRow}>
                            <div className={styles.detailIcon}>
                                <FontAwesomeIcon icon={faUser} />
                            </div>

                            <div className={styles.detailContent}>
                                <span className={styles.fieldLabel}>Full name</span>
                                <span className={styles.fieldValue}>
                                    {profile.name?.trim() || "Not available"}
                                </span>
                                <span className={styles.fieldHint}>
                                    Your registered account name
                                </span>
                            </div>

                            <button
                                type="button"
                                className={styles.editButton}
                                onClick={() => openEditor("name")}>

                                <FontAwesomeIcon icon={faPen} />
                                <span>Edit</span>
                            </button>
                        </div>

                        <div className={styles.detailRow}>
                            <div className={styles.detailIcon}>
                                <FontAwesomeIcon icon={faEnvelope} />
                            </div>

                            <div className={styles.detailContent}>
                                <span className={styles.fieldLabel}>Email address</span>
                                <span className={styles.fieldValue}>
                                    {profile.email || "Not available"}
                                </span>
                                <span className={styles.fieldHint}>
                                    Used for account communication
                                </span>
                            </div>

                            <button
                                type="button"
                                className={styles.editButton}
                                onClick={() => openEditor("email")}>

                                <FontAwesomeIcon icon={faPen} />
                                <span>Edit</span>
                            </button>
                        </div>

                        <div className={`${styles.detailRow} ${styles.mobileRow}`}>
                            <div className={styles.detailIcon}>
                                <FontAwesomeIcon icon={faMobileScreenButton} />
                            </div>

                            <div className={styles.detailContent}>
                                <span className={styles.fieldLabel}>Registered mobile</span>
                                <span className={styles.fieldValue}>
                                    {profile.mobileNumber || "Not available"}
                                </span>
                                <span className={styles.fieldHint}>
                                    Your registered mobile number cannot be changed here.
                                </span>
                            </div>

                            <span className={styles.readOnlyBadge}>
                                <FontAwesomeIcon icon={faLock} />
                                <span>Read only</span>
                            </span>
                        </div>
                    </div>

                    <div className={styles.linkBankAction}>
                        <div>
                            <h4>Manage your bank accounts</h4>
                            <p>Check the bank accounts linked to your profile.</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/LinkedBankAccounts")}>

                            <FontAwesomeIcon icon={faBuildingColumns} />
                            Link Bank Account
                        </button>
                    </div>

                    <div className={styles.securityNote}>
                        <div className={styles.securityIcon}>
                            <FontAwesomeIcon icon={faShieldHalved} />
                        </div>
                        <div>
                            <h4>Your information is important</h4>
                            <p>
                                Only the selected field is submitted when you edit your name
                                or email. Your other profile details remain unchanged.
                            </p>
                        </div>
                    </div>
                </section>

                {activeField && (
                    <div
                        className={styles.modalOverlay}
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) closeEditor();
                        }}>

                        <section
                            className={styles.modal}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="edit-profile-title">

                            <div className={styles.modalHeader}>
                                <div className={styles.modalIcon}>
                                    <FontAwesomeIcon
                                        icon={activeField === "name" ? faUser : faEnvelope}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={closeEditor}
                                    disabled={saving}
                                    aria-label="Close editor">

                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>

                            <h2 id="edit-profile-title">
                                Edit {activeField === "name" ? "full name" : "email address"}
                            </h2>

                            <p className={styles.modalDescription}>
                                {activeField === "name"
                                    ? "Update your name. Your email address and registered mobile number will remain unchanged."
                                    : "Update your email address. Your name and registered mobile number will remain unchanged."}
                            </p>

                            <form onSubmit={handleSave}>
                                <label className={styles.inputLabel} htmlFor="profile-edit-input">
                                    {activeField === "name" ? "Full name" : "Email address"}
                                </label>

                                <input
                                    id="profile-edit-input"
                                    className={styles.input}
                                    type={activeField === "email" ? "email" : "text"}
                                    value={inputValue}
                                    onChange={(event) => {
                                        setInputValue(event.target.value);
                                        setError("");
                                    }}
                                    placeholder={
                                        activeField === "name"
                                            ? "Enter your full name"
                                            : "Enter your email address"
                                    }
                                    maxLength={100}
                                    autoComplete={
                                        activeField === "name" ? "name" : "email"
                                    }
                                    autoFocus
                                    disabled={saving} />


                                {error && (
                                    <p className={styles.errorMessage} role="alert">
                                        {error}
                                    </p>
                                )}

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={closeEditor}
                                        disabled={saving}>

                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className={styles.saveButton}
                                        disabled={saving}>

                                        {saving ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faCheck} />
                                                Save changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}
