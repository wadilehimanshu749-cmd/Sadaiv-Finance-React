import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMobileScreenButton, faCar, faLightbulb, faSatelliteDish, faBorderAll, faArrowRight, faShieldHalved, faChartLine, faIndianRupeeSign, faUmbrella, faTrainTram, faGauge, faPlug, } from "@fortawesome/free-solid-svg-icons";
import { faRoadBarrier, faWifi, faFireFlameSimple, faFaucetDrip, faCalendarDays, faTv, faXmark, } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faLinkedinIn, faInstagram, faFacebookF, } from "@fortawesome/free-brands-svg-icons";

import styles from "./Home.module.css";
import { faCreditCard, faHouse } from "@fortawesome/free-regular-svg-icons";

const mainQuickActions = [
  { icon: faMobileScreenButton, title: "Mobile Recharge/Bill", href: "/mobile-recharge" },
  { icon: faLightbulb, title: "Electricity Bill", href: "/electricity" },
  { icon: faCar, title: "FASTag Recharge", href: "/fasttag" },
  { icon: faCreditCard, title: "Credit Card Bill", href: "/dth" },
  { icon: faHouse, title: "Rent", href: "/insurance" },
];

const rechargeActions = [
  { icon: faMobileScreenButton, title: "Mobile Recharge", href: "/mobile-recharge" },
  { icon: faSatelliteDish, title: "DTH Recharge", href: "/dth" },
  { icon: faCar, title: "FASTag Recharge", href: "/fasttag" },
  { icon: faTrainTram, title: "NCMC Recharge", href: "/ncmc" },
  { icon: faGauge, title: "Prepaid Meter", href: "/prepaid-meter" },
  { icon: faPlug, title: "EV Recharge", href: "/ev" },
  { icon: faTrainTram, title: "Metro Recharge", href: "/metro" },
  { icon: faRoadBarrier, title: "Toll Tag Recharge", href: "/toll" },
];

const billPaymentActions = [
  { icon: faLightbulb, title: "Electricity Bill", href: "/electricity" },
  { icon: faWifi, title: "Broadband/Landline", href: "/broadband" },
  { icon: faFireFlameSimple, title: "Piped Gas", href: "/gas" },
  { icon: faFaucetDrip, title: "Water Bill", href: "/water" },
  { icon: faCalendarDays, title: "Loan EMI Payment", href: "/emi" },
  { icon: faUmbrella, title: "LIC / Insurance", href: "/insurance" },
  { icon: faTv, title: "Cable TV", href: "/cable" },

];

export default function HomePage() {
  const [showAllActions, setShowAllActions] = useState(false);

  useEffect(() => {
    if (!showAllActions) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAllActions(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAllActions]);

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Your Money.
              <br />
              Your Future.
              <br />
              <span>One Platform.</span>
            </h1>

            <p className={styles.heroDescription}>
              Manage your loans, investments, insurance and everyday
              financial needs with SADAIV Finance.
            </p>

            <div className={styles.heroButtons}>
              <Link to="/signup" className={styles.primaryButton}>
                Get Started
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>

              <Link to="/login" className={styles.secondaryButton}>
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.quickActionsSection}>
        <div className={styles.quickActionsContainer}>
          <h2 className={styles.quickActionsHeaderTitle}>
            Recharges &amp; Bill Payments
          </h2>

          <div className={styles.quickActionsGrid}>
            {mainQuickActions.map((action) => (
              <QuickAction
                key={action.title}
                {...action}
              />
            ))}

            <button
              type="button"
              className={styles.viewAllBtn}
              onClick={() => setShowAllActions(true)}
              aria-expanded={showAllActions}
              aria-haspopup="dialog"
            >
              <span className={styles.quickActionIcon}>
                <FontAwesomeIcon icon={faBorderAll} />
              </span>
              <span className={styles.quickActionTitle}>
                View All Products
              </span>
            </button>
          </div>
        </div>

        {showAllActions && (
          <div
            className={styles.modalLayer}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowAllActions(false);
              }
            }}
          >
            <section className={styles.quickActionsModal} role="dialog" aria-modal="true" aria-labelledby="quickActionsModalTitle">
              <header className={styles.modalHeader}>
                <div>

                  {/* <h2
                    id="quickActionsModalTitle"
                    className={styles.modalTitle}
                  >
                    All Products
                  </h2> */}
                  {/* <p className={styles.modalDescription}>
                    Choose a recharge or bill payment service.
                  </p> */}
                </div>

                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setShowAllActions(false)}
                  aria-label="Close products popup"
                  autoFocus
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </header>

              <div className={styles.modalContent}>
                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>
                    Recharges
                  </h3>

                  <div className={styles.modalGrid}>
                    {rechargeActions.map((action) => (
                      <QuickAction
                        key={action.title}
                        {...action}
                        onNavigate={() => setShowAllActions(false)}
                      />
                    ))}
                  </div>
                </section>

                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>
                    Bill Payments
                  </h3>

                  <div className={styles.modalGrid}>
                    {billPaymentActions.map((action) => (
                      <QuickAction
                        key={action.title}
                        {...action}
                        onNavigate={() => setShowAllActions(false)}
                      />
                    ))}
                  </div>
                </section>
              </div>

              <footer className={styles.modalFooter}>
                <span>Simple payments, all in one place.</span>
                <button
                  type="button"
                  className={styles.modalDoneBtn}
                  onClick={() => setShowAllActions(false)}>
                  Done
                </button>
              </footer>
            </section>
          </div>
        )}
      </section>

      <section className={styles.servicesSection}>
        <div className={styles.sectionHeading}>
          <h2>
            Everything you need,
            <br />
            in one place.
          </h2>
          <p>More ways to manage your money.</p>
        </div>

        <div className={styles.serviceGrid}>
          <ServiceCard
            icon={faIndianRupeeSign}
            title="Digital Gold"
            description="Explore digital gold options."
            href="/loan"/>

          <ServiceCard
            icon={faChartLine}
            title="SIP Investment"
            description="Grow your money with smart investment options."
            href="/investment"/>

          <ServiceCard
            icon={faUmbrella}
            title="Insurance"
            description="Protect yourself and your loved ones."
            href="/insurance"/>

          <ServiceCard
            icon={faShieldHalved}
            title="Secure Payments"
            description="Simple and convenient everyday payments."
            href="/login"/>
        </div>
      </section>

      <section className={styles.whySection}>
        <div className={styles.whyContent}>
          <div>
            <p className={styles.sectionEyebrow}>WHY SADAIV</p>
            <h2>
              Finance made
              <br />
              simple.
            </h2>
            <p>
              SADAIV brings your financial journey together through a
              simple, professional and secure platform.
            </p>
          </div>

          <div className={styles.featureList}>
            <Feature
              number="01"
              title="Simple"
              text="Easy-to-understand financial products."/>
            <Feature
              number="02"
              title="Secure"
              text="Designed with security and privacy in mind."/>
            <Feature
              number="03"
              title="Convenient"
              text="Access your financial services from anywhere."/>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div>
          <p className={styles.ctaSmall}>START YOUR JOURNEY</p>
          <h2>
            Take control of
            <br />
            your finances.
          </h2>
          <p>Create your SADAIV account and get started.</p>
        </div>

        <Link to="/signup" className={styles.ctaButton}>
          Get Started
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerCol}>
            <h3 className={styles.footerBrandTitle}>SADAIV Finance</h3>
            <p className={styles.footerText}>
              Your trusted partner for loans, investments, insurance,
              and everyday payments.
            </p>

            <div className={styles.socialIcons}>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Products</h4>
            <ul>
              <li><Link to="/loan">Digital Gold &amp; Loans</Link></li>
              <li><Link to="/investment">SIP Investment</Link></li>
              <li><Link to="/insurance">Insurance</Link></li>
              <li><Link to="/login">Secure Payments</Link></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Regulatory Notice</h4>
            <p className={styles.footerDisclaimer}>
              Mutual fund investments are subject to market risks. Please
              read all scheme-related documents carefully before investing.
              SADAIV Finance acts as a technology platform connecting users
              with regulated financial partners.
            </p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 SADAIV Finance. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  href,
}: {
  icon: IconDefinition;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link to={href} className={styles.serviceCard}>
      <div className={styles.serviceIcon}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className={styles.cardArrow}>
        <FontAwesomeIcon icon={faArrowRight} />
      </span>
    </Link>
  );
}

function Feature({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className={styles.feature}>
      <span className={styles.featureNumber}>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  href,
  onNavigate,
}: {
  icon: IconDefinition;
  title: string;
  href: string;
  onNavigate?: () => void;
}) {
  return (
    <Link to={href} className={styles.quickActionCard} onClick={onNavigate}>
      <span className={styles.quickActionIcon}>
        <FontAwesomeIcon icon={icon} />
      </span>
      <span className={styles.quickActionTitle}>{title}</span>
    </Link>
  );
}
