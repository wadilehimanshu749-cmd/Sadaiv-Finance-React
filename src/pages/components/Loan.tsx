import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { IoAdd, IoArrowBack, IoCalendar, IoCheckmark, IoFlashSharp, IoNewspaper, IoRemove, IoShieldCheckmark,} from "react-icons/io5";

import styles from "./Loan.module.css";

const TENURE_OPTIONS = [12, 18, 24, 36];
const INTEREST_RATE = 10.5;
const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 1000000;
const STEP_AMOUNT = 10000;

const formatCurrency = (val: number) => "₹" + val.toLocaleString("en-IN");

export default function Loan() {
  const [loanAmount, setLoanAmount] = useState<number>(350000);
  const [selectedTenure, setSelectedTenure] = useState<number>(24);

  const calculatedEMI = useMemo(() => {
    const monthlyRate = INTEREST_RATE / (12 * 100);
    const months = selectedTenure;
    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  }, [loanAmount, selectedTenure]);

  const incrementAmount = () =>
    setLoanAmount((prev) => Math.min(MAX_AMOUNT, prev + STEP_AMOUNT));

  const decrementAmount = () =>
    setLoanAmount((prev) => Math.max(MIN_AMOUNT, prev - STEP_AMOUNT));

  const fillPercent = ((loanAmount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;

  const atMin = loanAmount <= MIN_AMOUNT;
  const atMax = loanAmount >= MAX_AMOUNT;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/dashboard" className={styles.headerIconBtn} aria-label="Back to dashboard">
            <IoArrowBack size={23} />
          </Link>

          <div className={styles.headerTextWrapper}>
            <h1 className={styles.headerTitle}>Personal Loan Application</h1>
            <p className={styles.headerSubtitle}>New loan</p>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            <section className={styles.darkGreenCard}>
              <div className={styles.cardTop}>
                <label htmlFor="loan-amount" className={styles.cardHeaderLabel}>
                  Select Loan Amount
                </label>

                <div className={styles.amountControlRow}>
                  <button
                    type="button"
                    className={styles.stepButton}
                    onClick={decrementAmount}
                    disabled={atMin}
                    aria-label="Decrease loan amount"
                  >
                    <IoRemove size={20} />
                  </button>

                  <output className={styles.cardMainValue} htmlFor="loan-amount" aria-live="polite">
                    {formatCurrency(loanAmount)}
                  </output>

                  <button
                    type="button"
                    className={styles.stepButton}
                    onClick={incrementAmount}
                    disabled={atMax}
                    aria-label="Increase loan amount"
                  >
                    <IoAdd size={20} />
                  </button>
                </div>
              </div>

              <input
                id="loan-amount"
                type="range"
                className={styles.slider}
                style={{ "--pct": `${fillPercent}%` } as CSSProperties}
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={STEP_AMOUNT}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                aria-valuetext={formatCurrency(loanAmount)}
              />

              <div className={styles.sliderLimitsRow}>
                <span className={styles.limitLabel}>{formatCurrency(MIN_AMOUNT)} (Min.)</span>
                <span className={styles.limitLabel}>{formatCurrency(MAX_AMOUNT)} (Max.)</span>
              </div>
            </section>

            <div className={styles.sectionHedingContainer}>
              <IoCalendar size={25} color="#307a56" />
              <h2 className={styles.sectionHedingtxt} id="tenure-heading">
                Select Loan Duration
              </h2>
            </div>

            <div className={styles.loancontainer} role="radiogroup" aria-labelledby="tenure-heading">
              {TENURE_OPTIONS.map((tenure) => {
                const isSelected = selectedTenure === tenure;

                return (
                  <label
                    key={tenure}
                    className={`${styles.tenurePill} ${isSelected ? styles.tenurePillSelected : ""}`}
                  >
                    <input
                      type="radio"
                      name="tenure"
                      className={styles.srOnly}
                      checked={isSelected}
                      onChange={() => setSelectedTenure(tenure)}
                    />

                    {isSelected && (
                      <span className={styles.checkmarkBadge}>
                        <IoCheckmark size={10} color="#244d41" />
                      </span>
                    )}

                    <span className={styles.tenureNumber}>{tenure}</span>
                    <span className={styles.tenureSubText}>Months</span>
                  </label>
                );
              })}
            </div>
          </div>

          <aside className={styles.sideColumn}>
            <section className={styles.summaryCard}>
              <h2 className={styles.summaryCardHeading}>Estimated EMI Summary</h2>

              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>Estimated Monthly EMI:</span>
                <span className={styles.summaryRowValue}>{formatCurrency(calculatedEMI)}/mo</span>
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryRowSpaced}`}>
                <span className={styles.summaryRowLabel}>Yearly Interest:</span>
                <span className={styles.summaryRowValue}>{INTEREST_RATE}% p.a. (Fixed)</span>
              </div>
            </section>

            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <span className={styles.featureIconContainer}>
                  <IoFlashSharp size={22} />
                </span>
                <span className={styles.featureLabel}>
                  Quick
                  <br />
                  Approval
                </span>
              </div>

              <div className={styles.featureItem}>
                <span className={styles.featureIconContainer}>
                  <IoShieldCheckmark size={22} />
                </span>
                <span className={styles.featureLabel}>
                  100% Secure
                  <br />& Trusted
                </span>
              </div>

              <div className={styles.featureItem}>
                <span className={styles.featureIconContainer}>
                  <IoNewspaper size={22} />
                </span>
                <span className={styles.featureLabel}>
                  Minimal
                  <br />
                  Documentation
                </span>
              </div>

              <div className={styles.featureItem}>
                <span className={styles.featureIconContainer}>
                  <IoCheckmark size={22} />
                </span>
                <span className={styles.featureLabel}>
                  Competitive
                  <br />
                  Interest Rates
                </span>
              </div>
            </div>

            <Link to="/loankyc" className={styles.primaryButton}>
              Proceed to Personal Details
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
