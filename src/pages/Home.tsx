import { Link } from "react-router-dom";
import { FormEvent, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMobileScreenButton, faArrowRight, faShieldHalved, faChartLine, faIndianRupeeSign, faUmbrella, faGauge, faBolt, faLock, faHeadset, faCalendarDays,} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faLinkedinIn, faInstagram, faFacebookF, faApple, faGooglePlay,} from "@fortawesome/free-brands-svg-icons";

import styles from "./Home.module.css";

type ServiceVariant = "featured" | "wide" | "regular";

const services: {
  icon: IconDefinition;
  title: string;
  description: string;
  href: string;
  variant: ServiceVariant;
}[] = [
  {
    icon: faIndianRupeeSign,
    title: "Digital Gold",
    description:
      "Start buying gold digitally with small amounts and keep track of it in one place.",
    href: "/loan",
    variant: "featured",
  },
  {
    icon: faChartLine,
    title: "SIP Investment",
    description:
      "Build wealth steadily with systematic investment plans that fit your monthly budget.",
    href: "/investment",
    variant: "wide",
  },
  {
    icon: faUmbrella,
    title: "Insurance",
    description:
      "Protect yourself and your loved ones with plans from trusted partners.",
    href: "/insurance",
    variant: "regular",
  },
  {
    icon: faShieldHalved,
    title: "Secure Payments",
    description: "Simple, protected payments for your everyday needs.",
    href: "/login",
    variant: "regular",
  },
];

interface WhySlide {
  id: string;
  tabLabel: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  statValue: string;
  statLabel: string;
  highlights: string[];
  features: {
    icon: IconDefinition;
    tag: string;
    title: string;
    text: string;
  }[];
}

const whySlides: WhySlide[] = [
  {
    id: "security",
    tabLabel: "01. Security & Trust",
    badge: "Bank-Grade Protection",
    titleLine1: "Finance made",
    titleLine2: "safe & transparent.",
    description:
      "SADAIV brings your financial journey together through multi-layer encryption, RBI-regulated partner rails, and complete fee transparency.",
    statValue: "99.98%",
    statLabel: "Transaction success rate with 24×7 real-time fraud monitoring",
    highlights: ["ISO 27001 Certified", "PCI-DSS Compliant", "Zero Data Selling"],
    features: [
      {
        icon: faLock,
        tag: "256-Bit Encryption",
        title: "Secure by design",
        text: "Your personal KYC, bank accounts, and payment tokens stay locked with enterprise-grade security protocols.",
      },
      {
        icon: faShieldHalved,
        tag: "Verified Rails",
        title: "Regulated financial partners",
        text: "Every loan, insurance policy, and BBPS utility payment routes directly through certified banking partners.",
      },
      {
        icon: faBolt,
        tag: "100% Transparent",
        title: "Zero hidden charges",
        text: "See exact breakdowns before you tap pay—no surprise convenience fees or hidden markups.",
      },
    ],
  },
  {
    id: "speed",
    tabLabel: "02. Speed & Bills",
    badge: "Smart Bill Automation",
    titleLine1: "Everyday bills",
    titleLine2: "paid in seconds.",
    description:
      "Never miss a due date again. Track electricity, FASTag, credit cards, and loan EMIs from one unified dashboard with instant confirmation.",
    statValue: "Under 3s",
    statLabel: "Average checkout time for recharges & BBPS utility bill payments",
    highlights: ["Auto Bill Fetch", "Instant Biller Receipt", "Smart Due Alerts"],
    features: [
      {
        icon: faCalendarDays,
        tag: "Auto-Reminders",
        title: "Never miss a due date",
        text: "Get smart alerts for electricity, broadband, gas, and credit card bills days before late fees apply.",
      },
      {
        icon: faGauge,
        tag: "Instant Settlement",
        title: "Fast and simple checkout",
        text: "Recharge and pay bills in a few taps with guaranteed instant biller confirmation or auto-refund.",
      },
      {
        icon: faMobileScreenButton,
        tag: "1-Tap Repeat",
        title: "Saved billers & family tags",
        text: "Save meter IDs, mobile numbers, and vehicle FASTags once for effortless one-tap monthly top-ups.",
      },
    ],
  },
  {
    id: "wealth",
    tabLabel: "03. Wealth & Support",
    badge: "Long-Term Growth",
    titleLine1: "Grow your money",
    titleLine2: "with human backing.",
    description:
      "From ₹100 Digital Gold micro-savings to goal-based SIPs and instant credit, build long-term wealth backed by real human support.",
    statValue: "24×7",
    statLabel: "Dedicated human support desk across live chat, phone, and email",
    highlights: ["24K 99.9% Pure Gold", "Zero-Paperwork KYC", "Priority Help Desk"],
    features: [
      {
        icon: faChartLine,
        tag: "Automated Wealth",
        title: "Goal-based SIP & Digital Gold",
        text: "Start investing with small monthly amounts and track your real-time portfolio returns in one place.",
      },
      {
        icon: faIndianRupeeSign,
        tag: "Quick Disbursal",
        title: "Paperless flexible credit",
        text: "Check pre-approved loan offers in minutes with transparent interest rates and flexible EMI tenures.",
      },
      {
        icon: faHeadset,
        tag: "Always Available",
        title: "Support when you need it",
        text: "Have a question on a payment or policy? Reach our specialist team anytime from the Help Center.",
      },
    ],
  },
];

const AUTO_SWIPE_MS = 3600;
const DRAG_THRESHOLD = 55;

export default function HomePage() {
  const [activeWhySlide, setActiveWhySlide] = useState(0);
  const [isWhyPaused, setIsWhyPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const dragStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (isWhyPaused || isDragging) return;

    const timer = window.setInterval(() => {
      setActiveWhySlide((prev) => (prev + 1) % whySlides.length);
    }, AUTO_SWIPE_MS);

    return () => window.clearInterval(timer);
  }, [isWhyPaused, isDragging, activeWhySlide]);

  const goToNextSlide = () => {
    setActiveWhySlide((prev) => (prev + 1) % whySlides.length);
  };

  const goToPrevSlide = () => {
    setActiveWhySlide((prev) => (prev - 1 + whySlides.length) % whySlides.length);
  };

  const handleDragStart = (clientX: number) => {
    dragStartXRef.current = clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartXRef.current === null) return;
    setDragOffset(clientX - dragStartXRef.current);
  };

  const handleDragEnd = () => {
    if (dragStartXRef.current === null) return;

    if (dragOffset <= -DRAG_THRESHOLD) {
      goToNextSlide();
    } else if (dragOffset >= DRAG_THRESHOLD) {
      goToPrevSlide();
    }

    dragStartXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleGetAppLink = (e: FormEvent) => {
    e.preventDefault();
    if (mobileNumber.trim().length === 10) {
      setLinkSent(true);
      setTimeout(() => setLinkSent(false), 3500);
      setMobileNumber("");
    }
  };

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
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section
        className={styles.whySection}
        onMouseEnter={() => setIsWhyPaused(true)}
        onMouseLeave={() => {
          setIsWhyPaused(false);
          handleDragEnd();
        }}
      >
        <div className={styles.whyWrapper}>
          <div className={styles.whyTopBar}>
            <div
              className={styles.whyTabs}
              role="tablist"
              aria-label="Why SADAIV highlights">

              {whySlides.map((slide, index) => {
                const isActive = index === activeWhySlide;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`${styles.whyTabBtn} ${isActive ? styles.whyTabActive : ""}`}
                    onClick={() => setActiveWhySlide(index)}>

                    <span>{slide.tabLabel}</span>
                    {isActive && !isWhyPaused && (
                      <span key={activeWhySlide} className={styles.whyTabProgress} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={styles.whyCarouselViewport}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onTouchStart={(e) => {
              setIsWhyPaused(true);
              handleDragStart(e.touches[0].clientX);
            }}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={() => {
              handleDragEnd();
              setIsWhyPaused(false);
            }}>

            <div
              className={`${styles.whyCarouselTrack} ${isDragging ? styles.whyTrackDragging : ""}`}
              style={{
                transform: `translate3d(calc(-${activeWhySlide * 100}% + ${dragOffset}px), 0, 0)`,
              }}>

              {whySlides.map((slide) => (
                <div key={slide.id} className={styles.whySlide}>
                  <div className={styles.whyContent}>
                    <div className={styles.whyText}>
                      <span className={styles.whyBadge}>{slide.badge}</span>
                      <h2>
                        {slide.titleLine1}
                        <br />
                        {slide.titleLine2}
                      </h2>
                      <p>{slide.description}</p>

                      <div className={styles.whyStatCard}>
                        <strong className={styles.whyStatValue}>
                          {slide.statValue}
                        </strong>
                        <span className={styles.whyStatLabel}>
                          {slide.statLabel}
                        </span>
                      </div>

                      <div className={styles.whyPills}>
                        {slide.highlights.map((item) => (
                          <span key={item} className={styles.whyPill}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.featureList}>
                      {slide.features.map((feature) => (
                        <Feature key={feature.title} {...feature} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.whyDots}>
            {whySlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                className={`${styles.whyDot} ${index === activeWhySlide ? styles.whyDotActive : ""}`}
                onClick={() => setActiveWhySlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div>
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

      <section className={styles.appPromoSection}>
        <div className={styles.appPromoInner}>
          <div className={styles.appPromoLeft}>
            <h2 className={styles.appPromoTitle}>
              Download the SADAIV app to get more features 
            </h2>

            <div className={styles.storeButtonsRow}>
              <a
                href="#appstore"
                className={styles.storeBadgeBtn}
                aria-label="Download on the App Store">

                <FontAwesomeIcon icon={faApple} className={styles.storeBadgeIcon} />
                <div className={styles.storeBadgeText}>
                  <span>Download on the</span>
                  <strong>App Store</strong>
                </div>
              </a>

              <a
                href="#googleplay"
                className={styles.storeBadgeBtn}
                aria-label="Get it on Google Play">

                <FontAwesomeIcon
                  icon={faGooglePlay}
                  className={styles.storeBadgeIconPlay}/>

                <div className={styles.storeBadgeText}>
                  <span>GET IT ON</span>
                  <strong>Google Play</strong>
                </div>
              </a>
            </div>

            <p className={styles.getLinkLabel}>or get the link on your phone</p>

            <form className={styles.phoneInputBar} onSubmit={handleGetAppLink}>
              <span className={styles.countryCode}>+91</span>
              <input
                type="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter mobile number"
                className={styles.phoneInputField}
                aria-label="Enter mobile number"/>

              <button type="submit" className={styles.getAppSubmitBtn}>
                {linkSent ? "Link Sent!" : "Get app"}
              </button>
            </form>
          </div>
        </div>
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
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter">

                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn">

                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram">

                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook">
                  
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Products</h4>
            <ul>
              <li>
                <Link to="/loan">Digital Gold &amp; Loans</Link>
              </li>
              <li>
                <Link to="/investment">SIP Investment</Link>
              </li>
              <li>
                <Link to="/insurance">Insurance</Link>
              </li>
              <li>
                <Link to="/login">Secure Payments</Link>
              </li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Support</h4>
            <ul>
              <li>
                <Link to="/help">Help Center</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
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
  variant,
}: {
  icon: IconDefinition;
  title: string;
  description: string;
  href: string;
  variant: ServiceVariant;
}) {
  const variantClass =
    variant === "featured"
      ? styles.serviceFeatured
      : variant === "wide"
        ? styles.serviceWide
        : "";

  return (
    <Link to={href} className={`${styles.serviceCard} ${variantClass}`}>
      <div className={styles.serviceIcon}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>

      {variant === "wide" && (
        <div className={styles.miniChart} aria-hidden="true">
          {[30, 44, 38, 58, 52, 74, 92].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      )}

      <span className={styles.cardLink}>
        Explore
        <FontAwesomeIcon icon={faArrowRight} />
      </span>
    </Link>
  );
}

function Feature({
  icon,
  tag,
  title,
  text,
}: {
  icon: IconDefinition;
  tag: string;
  title: string;
  text: string;
}) {
  return (
    <div className={styles.feature}>
      <span className={styles.featureIcon}>
        <FontAwesomeIcon icon={icon} />
      </span>
      <div className={styles.featureBody}>
        <div className={styles.featureHead}>
          <h3>{title}</h3>
          <span className={styles.featureTag}>{tag}</span>
        </div>
        <p>{text}</p>
      </div>
    </div>
  );
}
