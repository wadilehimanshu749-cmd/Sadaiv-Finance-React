import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowRightArrowLeft, faBell, faBuildingColumns, faCheck, faCircleQuestion, faFileLines, faHouse, faRightFromBracket, faShieldHalved, faUser, faXmark, } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import styles from "./MyProfile.module.css";

type StoredProfile = {
    userId?: number;
    name?: string;
    email?: string;
    mobileNumber?: string;
};

type ProfileResponse = {
    success: boolean;
    message?: string;
    user?: {
        userId?: number;
        UserId?: number;
        fullName?: string;
        FullName?: string;
        email?: string;
        Email?: string;
        mobileNumber?: string;
        MobileNumber?: string;
    };
};

type UpdateResponse = {
    success: boolean;
    message: string;
};

type FieldErrors = { name?: string; email?: string };

type NavItem = {
    label: string;
    icon: IconDefinition;
    path?: string;
};

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", icon: faHouse, path: "/dashboard" },
    { label: "Personal information", icon: faUser },
    { label: "Linked bank accounts", icon: faBuildingColumns, path: "/LinkedBankAccounts" },
    { label: "Transactions", icon: faArrowRightArrowLeft, path: "/transactions" },
    { label: "Statements", icon: faFileLines, path: "/statements" },
    { label: "Security", icon: faShieldHalved, path: "/security" },
    { label: "Notifications", icon: faBell, path: "/notifications" },
    { label: "Help & support", icon: faCircleQuestion, path: "/support" },
];

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7123"
).replace(/\/+$/, "");

const SESSION_EXPIRED = "Your session has expired. Please log in again.";

function readProfile(): StoredProfile {
    try {
        const saved = sessionStorage.getItem("sadaivProfile");
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

function validateName(value: string): string {
    if (!value) return "Enter your full name.";
    if (value.length > 100) return "Name can be up to 100 characters.";
    return "";
}

function validateEmail(value: string): string {
    if (!value) return "Enter your email address.";
    if (value.length > 100) return "Email can be up to 100 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Enter a valid email address.";
    }
    return "";
}

export default function MyProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<StoredProfile>(readProfile);
    const [nameDraft, setNameDraft] = useState(() => readProfile().name ?? "");
    const [emailDraft, setEmailDraft] = useState(() => readProfile().email ?? "");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState("");
    const [pageError, setPageError] = useState("");
    const [notice, setNotice] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = sessionStorage.getItem("accessToken");

            if (!token) {
                setPageError("Please log in to view your profile.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/auth/userprofile`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    sessionStorage.removeItem("accessToken");
                    throw new Error(SESSION_EXPIRED);
                }

                const data: ProfileResponse = await response.json();

                if (!response.ok || !data.success || !data.user) {
                    throw new Error(
                        data.message || "We couldn't load your profile."
                    );
                }

                const fresh: StoredProfile = {
                    userId: data.user.userId ?? data.user.UserId,
                    name: data.user.fullName ?? data.user.FullName ?? "",
                    email: data.user.email ?? data.user.Email ?? "",
                    mobileNumber:
                        data.user.mobileNumber ?? data.user.MobileNumber ?? "",
                };

                sessionStorage.setItem("sadaivProfile", JSON.stringify(fresh));
                setProfile(fresh);
                setNameDraft(fresh.name ?? "");
                setEmailDraft(fresh.email ?? "");
            } catch (err) {
                console.error("Profile API error:", err);
                setPageError(
                    err instanceof Error
                        ? err.message
                        : "We couldn't load your profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const nameChanged = nameDraft.trim() !== (profile.name ?? "");
    const emailChanged = emailDraft.trim() !== (profile.email ?? "");
    const hasChanges = nameChanged || emailChanged;
    const formDisabled = loading || saving || Boolean(pageError);

    const handleCancel = () => {
        setNameDraft(profile.name ?? "");
        setEmailDraft(profile.email ?? "");
        setErrors({});
        setFormError("");
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const token = sessionStorage.getItem("accessToken");

        if (!token) {
            setFormError("Please log in to update your profile.");
            return;
        }

        const name = nameDraft.trim();
        const email = emailDraft.trim();

        const nextErrors: FieldErrors = {
            name: nameChanged ? validateName(name) : "",
            email: emailChanged ? validateEmail(email) : "",
        };

        setErrors(nextErrors);
        setFormError("");
        setNotice("");

        if (nextErrors.name || nextErrors.email) return;

        setSaving(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fullName: nameChanged ? name : null,
                    email: emailChanged ? email : null,
                }),
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem("accessToken");
                throw new Error(SESSION_EXPIRED);
            }

            const data: UpdateResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "We couldn't save your changes."
                );
            }

            const updated: StoredProfile = {
                ...profile,
                name: nameChanged ? name : profile.name,
                email: emailChanged ? email : profile.email,
            };

            sessionStorage.setItem("sadaivProfile", JSON.stringify(updated));
            setProfile(updated);
            setNameDraft(updated.name ?? "");
            setEmailDraft(updated.email ?? "");
            window.dispatchEvent(new Event("sadaivProfileUpdated"));

            setNotice("Your details have been updated.");
        } catch (err) {
            console.error("Update profile error:", err);
            setFormError(
                err instanceof Error
                    ? err.message
                    : "We couldn't save your changes. Try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("sadaivProfile");
        window.dispatchEvent(new Event("sadaivProfileUpdated"));
        navigate("/");
    };

    const initials =
        (profile.name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("") || "U";

    return (
        <main className={styles.page}>
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <div className={styles.account}>
                        <div className={styles.avatar} aria-hidden="true">
                            {initials}
                        </div>

                        <div className={styles.accountText}>
                            <p className={styles.accountName}>
                                {loading ? "Loading..." : profile.name?.trim() || "Your name"}
                            </p>
                            <p className={styles.accountMeta}>
                                {profile.mobileNumber || profile.email || ""}
                            </p>
                        </div>
                    </div>

                    <nav className={styles.nav} aria-label="Account">
                        {NAV_ITEMS.map((item) => {
                            const current = !item.path;

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    className={`${styles.navItem} ${current ? styles.navItemActive : ""}`}
                                    aria-current={current ? "page" : undefined}
                                    onClick={() => item.path && navigate(item.path)}>
                                    <FontAwesomeIcon icon={item.icon} fixedWidth />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            className={`${styles.navItem} ${styles.logout}`}
                            onClick={handleLogout} >
                            <FontAwesomeIcon icon={faRightFromBracket} fixedWidth />
                            <span>Log out</span>
                        </button>
                    </nav>
                </aside>

                <section className={styles.content}>
                    <h1 className={styles.title}>Personal information</h1>
                    <p className={styles.subtitle}>
                        These details are used for your account and for
                        messages we send you.
                    </p>

                    {notice && (
                        <div className={styles.notice} role="status">
                            <FontAwesomeIcon icon={faCheck} />
                            <span>{notice}</span>
                            <button
                                type="button"
                                aria-label="Dismiss"
                                onClick={() => setNotice("")}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    )}

                    {pageError && (
                        <div className={styles.pageError} role="alert">
                            {pageError}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSave} noValidate>
                        <div className={styles.field}>
                            <label htmlFor="profile-name">Full name</label>
                            <input
                                id="profile-name"
                                className={styles.input}
                                type="text"
                                value={nameDraft}
                                onChange={(event) => {
                                    setNameDraft(event.target.value);
                                    setErrors((prev) => ({ ...prev, name: "" }));
                                }}
                                maxLength={100}
                                autoComplete="name"
                                disabled={formDisabled}
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={errors.name ? "profile-name-error" : undefined} />
                            {errors.name && (
                                <p id="profile-name-error" className={styles.fieldError} role="alert">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="profile-email">Email address</label>
                            <input
                                id="profile-email"
                                className={styles.input}
                                type="email"
                                value={emailDraft}
                                onChange={(event) => {
                                    setEmailDraft(event.target.value);
                                    setErrors((prev) => ({ ...prev, email: "" }));
                                }}
                                maxLength={100}
                                autoComplete="email"
                                disabled={formDisabled}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? "profile-email-error" : undefined} />
                            {errors.email && (
                                <p id="profile-email-error" className={styles.fieldError} role="alert">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="profile-mobile">Mobile number</label>
                            <input
                                id="profile-mobile"
                                className={styles.input}
                                type="text"
                                value={loading ? "" : profile.mobileNumber ?? ""}
                                placeholder={loading ? "Loading..." : "Not available"}
                                readOnly
                                disabled />
                            <p className={styles.hint}>
                                Your registered mobile number can't be changed here.
                            </p>
                        </div>

                        {formError && (
                            <p className={styles.formError} role="alert">
                                {formError}
                            </p>
                        )}

                        <div className={styles.actions}>
                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={formDisabled || !hasChanges}>
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={handleCancel}
                                disabled={saving || !hasChanges}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
