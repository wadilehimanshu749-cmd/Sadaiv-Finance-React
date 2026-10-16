import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { IoAdd, IoArrowBack, IoArrowForward, IoCalendar, IoCheckmark, IoFlashSharp, IoHeadset, IoNewspaper, IoStatsChart, IoRemove, IoShieldCheckmark, IoWalletOutline,} from "react-icons/io5";
import styles from "./Loan.module.css";

const TENURE_OPTIONS = [12, 18, 24, 36];
const INTEREST_RATE = 10.5;
const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 1000000;
const STEP_AMOUNT = 10000;

const formatCurrency = (value: number) =>
  "₹" + value.toLocaleString("en-IN");

export default function Loan() {
  const [loanAmount, setLoanAmount] = useState(350000);
  const [selectedTenure, setSelectedTenure] = useState(24);

  const calculatedEMI = useMemo(() => {
    const monthlyRate = INTEREST_RATE / 1200;
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

  const fillPercent =
    ((loanAmount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;

  const atMin = loanAmount <= MIN_AMOUNT;
  const atMax = loanAmount >= MAX_AMOUNT;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link
            to="/dashboard"
            className={styles.headerIconBtn}
            aria-label="Back to dashboard">
            <IoArrowBack size={22} />
          </Link>

          <div className={styles.headerTextWrapper}>
            <h1 className={styles.headerTitle}>
              Personal Loan Application
            </h1>
            <p className={styles.headerSubtitle}>
              Quick. Simple. Secure.
            </p>
          </div>
        </header>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            <div className={styles.topCards}>
              <section className={styles.darkGreenCard}>
                <div className={styles.amountHeading}>
                  <span className={styles.amountIcon}>
                    <IoWalletOutline size={30} />
                  </span>

                  <div className={styles.cardTop}>
                    <label
                      htmlFor="loan-amount"
                      className={styles.cardHeaderLabel}>
                      Select Loan Amount
                    </label>

                    <output
                      className={styles.cardMainValue}
                      htmlFor="loan-amount"
                      aria-live="polite">
                      {formatCurrency(loanAmount)}
                    </output>
                  </div>

                  <div className={styles.amountButtons}>
                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={decrementAmount}
                      disabled={atMin}
                      aria-label="Decrease loan amount"
                    >
                      <IoRemove size={21} />
                    </button>

                    <button
                      type="button"
                      className={styles.stepButton}
                      onClick={incrementAmount}
                      disabled={atMax}
                      aria-label="Increase loan amount">
                      <IoAdd size={21} />
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
                  onChange={(event) =>
                    setLoanAmount(Number(event.target.value))
                  }
                  aria-valuetext={formatCurrency(loanAmount)}/>

                <div className={styles.sliderLimitsRow}>
                  <span className={styles.limitLabel}>
                    {formatCurrency(MIN_AMOUNT)} (Min.)
                  </span>
                  <span className={styles.limitLabel}>
                    {formatCurrency(MAX_AMOUNT)} (Max.)
                  </span>
                </div>
              </section>

              <section className={styles.journeyCard}>
                <div className={styles.journeyIllustration}>
                  <IoNewspaper size={39} />
                  <span className={styles.journeyShield}>
                    <IoShieldCheckmark size={19} />
                  </span>
                </div>

                <h2>Your journey to funds starts here</h2>
                <p>
                  Apply for a personal loan with minimal documentation
                  and a simple application process.
                </p>
              </section>
            </div>

            <section className={styles.tenureSection}>
              <div className={styles.sectionHeading}>
                <IoCalendar size={23} />
                <h2 id="tenure-heading">Select Loan Duration</h2>
              </div>

              <div
                className={styles.loancontainer}
                role="radiogroup"
                aria-labelledby="tenure-heading">
                {TENURE_OPTIONS.map((tenure) => {
                  const isSelected = selectedTenure === tenure;

                  return (
                    <label
                      key={tenure}
                      className={`${styles.tenurePill} ${isSelected ? styles.tenurePillSelected : ""
                        }`}>
                      <input
                        type="radio"
                        name="tenure"
                        className={styles.srOnly}
                        checked={isSelected}
                        onChange={() => setSelectedTenure(tenure)}/>

                      {isSelected && (
                        <span className={styles.checkmarkBadge}>
                          <IoCheckmark size={12} />
                        </span>
                      )}

                      <span className={styles.tenureNumber}>
                        {tenure}
                      </span>
                      <span className={styles.tenureSubText}>
                        Months
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className={styles.benefitsSection}>
              <h2>Why Choose SADAIV Finance?</h2>

              <div className={styles.benefitsGrid}>
                <article className={styles.benefitCard}>
                  <span className={styles.benefitIcon}>
                    <IoFlashSharp size={22} />
                  </span>
                  <span>Fast &amp; Easy Application</span>
                </article>

                <article className={styles.benefitCard}>
                  <span className={styles.benefitIcon}>
                    <IoShieldCheckmark size={22} />
                  </span>
                  <span>Secure Transactions</span>
                </article>

                <article className={styles.benefitCard}>
                  <span className={styles.benefitIcon}>
                    <IoStatsChart size={23} />
                  </span>
                  <span>Competitive Interest Rates</span>
                </article>

                <article className={styles.benefitCard}>
                  <span className={styles.benefitIcon}>
                    <IoHeadset size={22} />
                  </span>
                  <span>Dedicated Customer Support</span>
                </article>
              </div>
            </section>
          </div>

          <aside className={styles.sideColumn}>
            <section className={styles.summaryCard}>
              <h2 className={styles.summaryCardHeading}>
                Estimated EMI Summary
              </h2>

              <div className={styles.summaryRow}>
                <span className={styles.summaryRowLabel}>
                  Estimated Monthly EMI
                </span>
                <span className={styles.emiValue}>
                  {formatCurrency(calculatedEMI)}/mo
                </span>
              </div>

              <div className={styles.summaryRowSpaced}>
                <span className={styles.summaryRowLabel}>
                  Yearly Interest Rate
                </span>
                <span className={styles.summaryRowValue}>
                  {INTEREST_RATE}% p.a. (Fixed)
                </span>
              </div>

              <div className={styles.approvalBanner}>
                <span className={styles.approvalIcon}>
                  <IoFlashSharp size={22} />
                </span>
                <div>
                  <p>Quick Approval</p>
                  <span>Simple application process</span>
                </div>
              </div>

              <div className={styles.featuresGrid}>
                <div className={styles.featureItem}>
                  <span className={styles.featureIconContainer}>
                    <IoShieldCheckmark size={21} />
                  </span>
                  <span className={styles.featureLabel}>
                    100% Secure
                    <br />&amp; Trusted
                  </span>
                </div>

                <div className={styles.featureItem}>
                  <span className={styles.featureIconContainer}>
                    <IoNewspaper size={21} />
                  </span>
                  <span className={styles.featureLabel}>
                    Minimal
                    <br />
                    Documentation
                  </span>
                </div>

                <div className={styles.featureItem}>
                  <span className={styles.featureIconContainer}>
                    <IoStatsChart size={21} />
                  </span>
                  <span className={styles.featureLabel}>
                    Competitive
                    <br />
                    Interest Rates
                  </span>
                </div>

                <div className={styles.featureItem}>
                  <span className={styles.featureIconContainer}>
                    <IoCalendar size={21} />
                  </span>
                  <span className={styles.featureLabel}>
                    Flexible
                    <br />
                    Tenure Options
                  </span>
                </div>
              </div>

              <Link to="/loankyc" className={styles.primaryButton}>
                <span>Proceed to Personal Details</span>
                <IoArrowForward size={18} />
              </Link>

              <p className={styles.disclaimer}>
                Your final loan terms are subject to eligibility and
                approval.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
