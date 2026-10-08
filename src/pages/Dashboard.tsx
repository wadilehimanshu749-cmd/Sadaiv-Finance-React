import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { IoScan,IoPersonOutline,IoArrowForwardOutline, IoQrCodeOutline, IoWalletOutline, IoPhonePortraitOutline, IoNewspaperOutline, IoCardOutline } from "react-icons/io5";
import styles from "./Dashboard.module.css";

export default function HomeScreen() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const heroTranslate = Math.min(scrollY * 0.25, 70);
  const heroScale = 1 + Math.min(scrollY * 0.00025, 0.025);

  return (
    <main className={styles.container}>

      <section className={styles.topSectionWrapper}>

        <div className={styles.headerBackground}>

          <img
            src="/images/bg-main.jpg"
            alt="SADAIV Finance"
            fetchPriority="high"
            className={styles.headerBackgroundImage}
            style={{
              transform: `translateY(${heroTranslate}px) scale(${heroScale})`,
            }}
          />

          <div className={styles.headerOverlay} />

          <div className={styles.headerSpace} />

          <div className={styles.greetingSection}>
            <p className={styles.smallGreeting}>
              ☀️ Good Morning 👋
            </p>

            <h1 className={styles.userName}>
              Rahul Patil
            </h1>
          </div>

        </div>


        <div className={styles.searchContainer}>

          <span className={styles.searchIcon}>
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: '20px' }} />

          </span>

          <input
            type="text"
            placeholder="Search name, UPI ID or mobile"
            className={styles.searchInput}
          />

          <button className={styles.scanIcon}>
            <IoScan size={25} />
          </button>

        </div>

      </section>

      <section className={styles.sectionHeader}>

        <div>
          <h2 className={styles.sectionTitle}>
            Your Accounts
          </h2>

          <p className={styles.sectionSubtitle}>
            Manage your linked bank accounts
          </p>
        </div>

        <button className={styles.viewAll}>
          View all &gt;
        </button>

      </section>

      <div className={styles.accountsScroll}>

        <div className={styles.accountCard}>

          <img
            src="/images/card3.png"
            alt=""
            className={styles.accountCardImage}
          />

          <div className={styles.cardContent}>

            <div className={styles.accountHeader}>

              <div className={styles.bankIdentity}>

                <div className={styles.bankLogo}>
                  <img
                    src="/images/hdfc.png"
                    alt="HDFC Bank"
                    width={45}
                    height={45}
                  />
                </div>

                <div className={styles.bankInfo}>

                  <p className={styles.bankName}>
                    HDFC Bank
                  </p>

                  <p className={styles.accountNumber}>
                    Savings •••• 1234
                  </p>

                </div>

              </div>

              <button className={styles.cardMenu}>
                •••
              </button>

            </div>


            <div className={styles.balanceSection}>

              <p className={styles.balanceLabel}>
                Available Balance
              </p>

              <p className={styles.balance}>
                ₹2,24,560.50
              </p>

            </div>


            <div className={styles.cardFooter}>

              <div>
                <p className={styles.footerLabel}>
                  Account Type
                </p>

                <p className={styles.footerValue}>
                  Primary Account
                </p>
              </div>

              <div className={styles.activeBadge}>
                <span className={styles.activeDot} />

                <span className={styles.activeText}>
                  Active
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className={styles.accountCard}>

          <img
            src="/images/card3.png"
            alt=""
            className={styles.accountCardImage}
          />

          <div className={styles.cardContent}>

            <div className={styles.accountHeader}>

              <div className={styles.bankIdentity}>

                <div className={styles.bankLogo}>
                  <img
                    src="/images/sboi.png"
                    alt="State Bank of India"
                    width={45}
                    height={45}
                  />
                </div>

                <div className={styles.bankInfo}>

                  <p className={styles.bankName}>
                    State Bank of India
                  </p>

                  <p className={styles.accountNumber}>
                    Savings •••• 5678
                  </p>

                </div>

              </div>

              <button className={styles.cardMenu}>
                •••
              </button>

            </div>


            <div className={styles.balanceSection}>

              <p className={styles.balanceLabel}>
                Available Balance
              </p>

              <p className={styles.balance}>
                ₹56,780.20
              </p>

            </div>


            <div className={styles.cardFooter}>

              <div>
                <p className={styles.footerLabel}>
                  Account Type
                </p>

                <p className={styles.footerValue}>
                  Savings Account
                </p>
              </div>

              <div className={styles.activeBadge}>
                <span className={styles.activeDot} />

                <span className={styles.activeText}>
                  Active
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

      <button className={styles.scanPay}>

        <div className={styles.qrContainer}>
          <IoQrCodeOutline size={30} />
        </div>

        <div className={styles.scanContent}>

          <p className={styles.scanTitle}>
            Scan & Pay
          </p>

          <p className={styles.scanSubtitle}>
            Scan any QR code and make instant payments
          </p>

        </div>

        <div className={styles.arrowButton}>
          <IoArrowForwardOutline size={20} />
        </div>

      </button>

      <section className={styles.sectionHeader}>

        <div>

          <h2 className={styles.sectionTitle}>
            Quick Actions
          </h2>

          <p className={styles.sectionSubtitle}>
            Payments & everyday services
          </p>

        </div>

      </section>


      <div className={styles.quickActions}>

        <QuickAction
          icon=  {<IoWalletOutline size={25} />}
          text="Send Money"
          href="/send_money"
        />

        <QuickAction
          icon={<IoPhonePortraitOutline size={25} />}
          text="To Mobile"
          href="/to_mobile"
        />

        <QuickAction
          image="/images/upi-icon.png"
          text="To UPI ID"
          href="/upi"
          plain
        />

        <QuickAction
          icon= {<IoPersonOutline size={25} />}
          text="Self Transfer"
          href="/self_transfer"
        />

        <QuickAction
          icon={<IoPhonePortraitOutline size={25} />}
          text="Recharge"
          href="/mobile_recharge"
        />

        <QuickAction
          icon= {<IoNewspaperOutline size={25} />}
          text="Utility Bills"
          href="/utility_bills"
        />

        <QuickAction
          icon= {<IoCardOutline size={25} />}
          text="Credit Card"
          href="/credit_card_bill"
        />

        <QuickAction
          image="/images/fastag.png"
          text="FASTag"
          href="/fasttag"
          plain
        />

      </div>

      <section className={styles.sectionHeader}>

        <div>

          <h2 className={styles.sectionTitle}>
            Explore More
          </h2>

          <p className={styles.sectionSubtitle}>
            More ways to manage your money
          </p>

        </div>

      </section>

      <div className={styles.services}>

        <Service
          image="/images/ingots.png"
          text="Digital Gold"
          sub="Buy 24K Gold"
        />

        <Service
          image="/images/growth.png"
          text="SIP Investment"
          sub="Start SIP"
        />

        <Service
          image="/images/insurance.png"
          text="Insurance"
          sub="Protect Now"
        />

        <Service
          image="/images/notification.png"
          text="Reminders"
          sub="3 Dues"
        />

      </div>


      {/* Bottom space for fixed tab bar */}
      <div className={styles.bottomSpace} />

    </main>
  );
}


function QuickAction({
  icon,
  image,
  text,
  href,
  plain = false,
}: {
  icon?: React.ReactNode;
  image?: string;
  text: string;
  href: string;
  plain?: boolean;
}) {
  return (
    <Link to={href} className={styles.quickAction}>

      {image ? (

        <div
          className={
            plain
              ? styles.plainImageContainer
              : styles.iconContainer
          }>

          <img
            src={image}
            alt={text}
            width={34}
            height={34}
            className={styles.actionImage}
          />

        </div>

      ) : (

        <div className={styles.iconContainer}>
          <span className={styles.simpleIcon}>
            {icon}
          </span>
        </div>

      )}

      <span className={styles.quickActionText}>
        {text}
      </span>

    </Link>
  );
}


function Service({
  image,
  text,
  sub,
}: {
  image: string;
  text: string;
  sub: string;
}) {
  return (
    <a href="#" className={styles.service}>

      <div className={styles.serviceIconContainer}>

        <img
          src={image}
          alt={text}
          width={28}
          height={28}
          className={styles.serviceIcon} />

      </div>

      <span className={styles.serviceText}>
        {text}
      </span>

      <span className={styles.serviceSub}>
        {sub}
      </span>

    </a>
  );
}