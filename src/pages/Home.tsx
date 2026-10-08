import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight, faShieldHalved, faChartLine, faIndianRupeeSign, faUmbrella} from "@fortawesome/free-solid-svg-icons";

import styles from "./Home.module.css";

export default function HomePage() {
  return (<main className={styles.container}>

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

            <Link
              to="/signup"
              className={styles.primaryButton}
            >
              Get Started
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>

            <Link
              to="/login"
              className={styles.secondaryButton}
            >
              Login
            </Link>

          </div>

        </div>


      </div>

    </section>

    <section className={styles.servicesSection}>

      <div className={styles.sectionHeading}>

        {/* <p className={styles.sectionEyebrow}>
          FINANCIAL SERVICES
        </p> */}

        <h2>
          Everything you need,
          <br />
          in one place.
        </h2>

        <p>
          More way to manage your money
        </p>

      </div>


      <div className={styles.serviceGrid}>

        <ServiceCard
          icon={faIndianRupeeSign}
          title="Digital Gold"
          description="Buy 24K Gold"
          href="/loan"
        />

        <ServiceCard
          icon={faChartLine}
          title="SIP Investment"
          description="Grow your money with smart investment options."
          href="/investment"
        />

        <ServiceCard
          icon={faUmbrella}
          title="Insurance"
          description="Protect yourself and your loved ones."
          href="/insurance"
        />

        <ServiceCard
          icon={faShieldHalved}
          title="Secure Payments"
          description="Simple and convenient everyday payments."
          href="/login"
        />

      </div>

    </section>

    <section className={styles.whySection}>

      <div className={styles.whyContent}>

        <div>

          <p className={styles.sectionEyebrow}>
            WHY SADAIV
          </p>

          <h2>
            Finance made
            <br />
            simple.
          </h2>

          <p>
            SADAIV brings your financial journey together
            through a simple, professional and secure platform.
          </p>

        </div>


        <div className={styles.featureList}>

          <Feature
            number="01"
            title="Simple"
            text="Easy-to-understand financial products."
          />

          <Feature
            number="02"
            title="Secure"
            text="Designed with security and privacy in mind."
          />

          <Feature
            number="03"
            title="Convenient"
            text="Access your financial services from anywhere."
          />

        </div>

      </div>

    </section>


    <section className={styles.ctaSection}>

      <div>

        <p className={styles.ctaSmall}>
          START YOUR JOURNEY
        </p>

        <h2>
          Take control of
          <br />
          your finances.
        </h2>

        <p>
          Create your SADAIV account and get started.
        </p>

      </div>

      <Link
        to="/signup"
        className={styles.ctaButton}
      >
        Get Started
        <FontAwesomeIcon icon={faArrowRight} />
      </Link>

    </section>


    <footer className={styles.footer}>

      <div className={styles.footerBrand}>

      </div>

      <p>
        © 2026 SADAIV Finance. All rights reserved.
      </p>

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
  return (<Link to={href} className={styles.serviceCard}>

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
  return (<div className={styles.feature}>

    <span className={styles.featureNumber}>
      {number}
    </span>

    <div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>

  </div>
  );
}