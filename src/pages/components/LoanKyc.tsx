import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBack, IoArrowForward, IoBriefcaseOutline, IoBusinessOutline, IoCalendarOutline, IoCardOutline, IoCashOutline,  IoChevronDown,IoLocationOutline,IoMailOutline, IoPersonOutline, IoShieldCheckmarkOutline,} from "react-icons/io5";

import styles from "./LoanKyc.module.css";

const employmentTypes = [
  { label: "Salaried", value: "salaried" },
  { label: "Self-Employed", value: "self-employed" },
  { label: "Business Owner", value: "business-owner" },
  { label: "Professional", value: "professional" },
  { label: "Government Employee", value: "government" },
];

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatDob = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

const parseDob = (value: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(year, month - 1, day);
  const real =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return real ? date : null;
};

const ageFrom = (birth: Date) => {
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age;
};

const formatIncome = (digits: string) =>
  digits ? Number(digits).toLocaleString("en-IN") : "";


function Field({
  id,
  label,
  icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>

      <div className={`${styles.inputContainer} ${error ? styles.inputError : ""}`}>
        <span className={styles.fieldIcon}>{icon}</span>
        {children}
      </div>

      {error && (
        <p className={styles.errorText} id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type Errors = Partial<
  Record< | "fullName" | "dob" | "address" | "pan" | "employmentType" | "company" | "workEmail" | "income", string>
>;

export default function LoanKYC() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [pan, setPan] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [company, setCompany] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [income, setIncome] = useState(""); // digits only

  const [errors, setErrors] = useState<Errors>({});
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clearError = (key: keyof Errors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const validate = (): Errors => {
    const e: Errors = {};

    if (fullName.trim().length < 3) e.fullName = "Enter your full name as per PAN.";

    const birth = parseDob(dob);
    if (!birth) e.dob = "Enter a valid date as DD/MM/YYYY.";
    else if (birth > new Date()) e.dob = "Date of birth can't be in the future.";
    else if (ageFrom(birth) < 18) e.dob = "You must be at least 18 years old.";

    if (address.trim().length < 6) e.address = "Enter your residential address.";

    if (!PAN_RE.test(pan)) e.pan = "PAN must look like ABCDE1234E.";

    if (!employmentType) e.employmentType = "Select your employment type.";

    if (!company.trim()) e.company = "Enter your company name.";

    if (!EMAIL_RE.test(workEmail.trim())) e.workEmail = "Enter a valid work email.";

    if (!income || Number(income) <= 0) e.income = "Enter your monthly in-hand income.";

    return e;
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const found = validate();
    setErrors(found);

    const order: (keyof Errors)[] = [
      "fullName",
      "dob",
      "address",
      "pan",
      "employmentType",
      "company",
      "workEmail",
      "income",
    ];
    const firstInvalid = order.find((key) => found[key]);

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    navigate("/loan/sanction");
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/loan" className={styles.headerIconBtn} aria-label="Back to loan amount">
            <IoArrowBack size={23} />
          </Link>

          <div className={styles.headerTextWrapper}>
            <h1 className={styles.headerTitle}>Personal Loan Application</h1>
            <p className={styles.headerSubtitle}>Configure your New loan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.cards}>
            <section className={styles.card}>
              <div className={styles.greenCard}>
                <span className={styles.iconCircle}>
                  <IoPersonOutline size={23} />
                </span>
                <h2 className={styles.greenCardTitle}>Personal Details</h2>
              </div>

              <div className={styles.formContainer}>
                <Field id="fullName" label="Full Name (as per PAN)" icon={<IoPersonOutline size={20} />} error={errors.fullName}>
                  <input
                    id="fullName"
                    className={styles.input}
                    type="text"
                    placeholder="Enter full name"
                    autoComplete="name"
                    value={fullName}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearError("fullName");
                    }}
                  />
                </Field>

                <Field id="dob" label="Date of Birth (DD/MM/YYYY)" icon={<IoCalendarOutline size={20} />} error={errors.dob}>
                  <input
                    id="dob"
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="DD/MM/YYYY"
                    autoComplete="bday"
                    maxLength={10}
                    value={dob}
                    aria-invalid={!!errors.dob}
                    aria-describedby={errors.dob ? "dob-error" : undefined}
                    onChange={(e) => {
                      setDob(formatDob(e.target.value));
                      clearError("dob");
                    }}
                  />
                </Field>

                <Field id="address" label="Residential Address" icon={<IoLocationOutline size={20} />} error={errors.address}>
                  <input
                    id="address"
                    className={styles.input}
                    type="text"
                    placeholder="Enter your address"
                    autoComplete="street-address"
                    value={address}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? "address-error" : undefined}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearError("address");
                    }}
                  />
                </Field>

                <Field id="pan" label="PAN Card Number" icon={<IoCardOutline size={20} />} error={errors.pan}>
                  <input
                    id="pan"
                    className={styles.input}
                    type="text"
                    placeholder="ABCDE1234E"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    maxLength={10}
                    value={pan}
                    aria-invalid={!!errors.pan}
                    aria-describedby={errors.pan ? "pan-error" : undefined}
                    onChange={(e) => {
                      setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                      clearError("pan");
                    }}
                  />
                </Field>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.greenCard}>
                <span className={styles.iconCircle}>
                  <IoBriefcaseOutline size={23} />
                </span>
                <h2 className={styles.greenCardTitle}>Employment Details</h2>
              </div>

              <div className={styles.formContainer}>
                <Field id="employmentType" label="Employment Type" icon={<IoBriefcaseOutline size={20} />} error={errors.employmentType}>
                  <select
                    id="employmentType"
                    className={`${styles.select} ${employmentType ? "" : styles.selectPlaceholder}`}
                    value={employmentType}
                    aria-invalid={!!errors.employmentType}
                    aria-describedby={errors.employmentType ? "employmentType-error" : undefined}
                    onChange={(e) => {
                      setEmploymentType(e.target.value);
                      clearError("employmentType");
                    }}
                  >
                    <option value="" disabled>
                      Select Employment Type
                    </option>
                    {employmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <span className={styles.chevron}>
                    <IoChevronDown size={20} />
                  </span>
                </Field>

                <Field id="company" label="Company Name" icon={<IoBusinessOutline size={20} />} error={errors.company}>
                  <input
                    id="company"
                    className={styles.input}
                    type="text"
                    placeholder="Enter company name"
                    autoComplete="organization"
                    value={company}
                    aria-invalid={!!errors.company}
                    aria-describedby={errors.company ? "company-error" : undefined}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      clearError("company");
                    }}
                  />
                </Field>

                <Field id="workEmail" label="Work Email" icon={<IoMailOutline size={20} />} error={errors.workEmail}>
                  <input
                    id="workEmail"
                    className={styles.input}
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    value={workEmail}
                    aria-invalid={!!errors.workEmail}
                    aria-describedby={errors.workEmail ? "workEmail-error" : undefined}
                    onChange={(e) => {
                      setWorkEmail(e.target.value);
                      clearError("workEmail");
                    }}
                  />
                </Field>

                <Field id="income" label="Monthly In-Hand Income" icon={<IoCashOutline size={20} />} error={errors.income}>
                  <input
                    id="income"
                    className={styles.input}
                    type="text"
                    inputMode="numeric"
                    placeholder="1,50,000"
                    autoComplete="off"
                    maxLength={12}
                    value={formatIncome(income)}
                    aria-invalid={!!errors.income}
                    aria-describedby={errors.income ? "income-error" : undefined}
                    onChange={(e) => {
                      setIncome(e.target.value.replace(/\D/g, "").slice(0, 9));
                      clearError("income");
                    }}
                  />
                </Field>
              </div>
            </section>
          </div>

          <div className={styles.footerRow}>
            <div className={styles.infoContainer}>
              <span className={styles.infoIcon}>
                <IoShieldCheckmarkOutline size={20} />
              </span>

              <div className={styles.infoTextContainer}>
                <p className={styles.infoTitle}>Your information is secure</p>
                <p className={styles.infoSubtitle}>
                  Your personal details are protected and used only for loan processing.
                </p>
              </div>
            </div>

            <button type="submit" className={styles.proceedButton}>
              <span>Proceed to KYC &amp; Documents</span>
              <IoArrowForward size={20} />
            </button>
          </div>
        </form>
      </div>

      <div
        className={`${styles.scrollIndicator} ${scrolled ? styles.scrollIndicatorHidden : ""}`}
        aria-hidden="true"
      >
        <span className={styles.scrollArrowCircle}>
          <IoChevronDown size={21} color="#287454" />
        </span>
      </div>
    </main>
  );
}
