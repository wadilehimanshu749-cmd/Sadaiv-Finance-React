import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignature } from "@fortawesome/free-solid-svg-icons";
import { IoArrowBack, IoBusiness, IoCheckmarkCircle, IoCheckmarkCircleSharp, } from "react-icons/io5";

import styles from "./LoanSanction.module.css";

const SANCTION = {
  lender: "ABC Finance Ltd.",
  amount: 1_000_000,
  tenureMonths: 24,
  interestRate: 10.5,
  processingFee: 15_000,
  disbursalAccount: "HDFC Bank ****1234",
};

const formatCurrency = (val: number) => "₹" + val.toLocaleString("en-IN");
const calculateEmi = (principal: number, annualRate: number, months: number) => {
  const monthlyRate = annualRate / (12 * 100);
  const growth = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * growth) / (growth - 1));
};

export default function LoanSanction() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  useEffect(() => {
    if (status !== "submitting") return;
    const timer = setTimeout(() => setStatus("done"), 900);
    return () => clearTimeout(timer);
  }, [status]);

  const emi = calculateEmi(SANCTION.amount, SANCTION.interestRate, SANCTION.tenureMonths);
  const youReceive = SANCTION.amount - SANCTION.processingFee;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/loan/kyc" className={styles.headerIconBtn} aria-label="Back to personal details">
            <IoArrowBack size={23} />
          </Link>

          <div className={styles.headerTextWrapper}>
            <h1 className={styles.headerTitle}>Loan Sanctioned</h1>
          </div>
        </div>

        <div className={styles.layout}>
          <section className={styles.card} aria-label="Sanction summary">
            <div className={styles.cardheader}>
              <span className={styles.badge}>
                <IoCheckmarkCircleSharp size={23} color="#a6e5a5" />
                <span className={styles.badgetext}>Loan Sanctioned</span>
              </span>
            </div>

            <div className={styles.loancontainer}>
              <span className={styles.companyLogo}>
                <IoBusiness size={27} color="#0F4A38" />
              </span>

              <div className={styles.companyInfo}>
                <p className={styles.loanlabel}>Loan provided by</p>

                <div className={styles.companyNameRow}>
                  <p className={styles.loancompany}>{SANCTION.lender}</p>
                  <IoCheckmarkCircle size={18} color="#a6e5a4" className={styles.verified} />
                </div>

                <p className={styles.companySubtext}>Trusted lending partner</p>
              </div>
            </div>

            <div className={styles.cardlabel}>
              <p className={styles.label}>Approved loan amount</p>
              <p className={styles.labelamount}>{formatCurrency(SANCTION.amount)}</p>
            </div>

            <dl className={styles.containerrow}>
              <div className={styles.columns}>
                <dt className={styles.columnslabel}>Monthly EMI</dt>
                <dd className={styles.columnslableamount}>{formatCurrency(emi)}</dd>
              </div>

              <span className={styles.verticalDivider} />

              <div className={styles.columns}>
                <dt className={styles.columnslabel}>Tenure</dt>
                <dd className={styles.columnslableamount}>{SANCTION.tenureMonths} Months</dd>
              </div>

              <span className={styles.verticalDivider} />

              <div className={styles.columns}>
                <dt className={styles.columnslabel}>Interest</dt>
                <dd className={styles.columnslableamount}>{SANCTION.interestRate}% fixed</dd>
              </div>
            </dl>
          </section>

          <div className={styles.side}>
            <section className={styles.card2} aria-label="Payout breakdown">
              <dl className={styles.breakdown}>
                <div className={styles.row}>
                  <dt className={styles.rowtext}>Processing fee</dt>
                  <dd className={styles.rowvaluetext}>-{formatCurrency(SANCTION.processingFee)}</dd>
                </div>

                <div className={styles.horizontalDivider} />

                <div className={styles.row}>
                  <dt className={styles.rowtext}>You&apos;ll receive</dt>
                  <dd className={styles.santionedamound}>{formatCurrency(youReceive)}</dd>
                </div>

                <div className={styles.horizontalDivider} />

                <div className={styles.row}>
                  <dt className={styles.rowtext}>Disbursal account</dt>
                  <dd className={styles.rowvaluetext}>{SANCTION.disbursalAccount}</dd>
                </div>
              </dl>
            </section>

            <div className={styles.banner}>
              <FontAwesomeIcon icon={faSignature} size="2x" className={styles.bannerIcon} />
              <p className={styles.bannertext}>
                e-NACH mandate signed. Your money arrives within 24 hours of confirming.
              </p>
            </div>

            {status === "done" ? (
              <div className={styles.success} role="status">
                <IoCheckmarkCircle size={44} color="#1f8a5b" />
                <h2 className={styles.successTitle}>Funds are on the way</h2>
                <p className={styles.successText}>
                  {formatCurrency(youReceive)} will reach {SANCTION.disbursalAccount} within 24 hours.
                </p>
                <Link to="/dashboard" className={styles.button}>
                  Go to dashboard
                </Link>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.button}
                  disabled={status === "submitting"}
                  onClick={() => setStatus("submitting")}>
                  {status === "submitting" ? "Processing…" : "Accept and get fund"}
                </button>

                <p className={styles.footerText}>By continuing, you accept the loan terms</p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
