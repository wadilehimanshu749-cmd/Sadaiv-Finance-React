import React, { useEffect, useState } from "react";
import { Link, } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faLinkedinIn, faInstagram, faFacebookF, } from "@fortawesome/free-brands-svg-icons";
import { IoScan, IoPersonOutline, IoArrowForwardOutline, IoQrCodeOutline, IoWalletOutline, IoPhonePortraitOutline, IoNewspaperOutline, IoCardOutline, } from "react-icons/io5";
import styles from "./Dashboard.module.css";

interface UserProfile {
  fullName?: string;
  FullName?: string;
  email?: string;
  Email?: string;
}

interface ProfileResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

export default function HomeScreen() {

  const [scrollY, setScrollY] = useState(0);
  const [userName, setUserName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);


  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      const token = sessionStorage.getItem("accessToken");

     
      if (!token) {
        setUserName("Rahul Patil");
        setProfileLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://localhost:7123/api/auth/userprofile",
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
          sessionStorage.removeItem("sadaivProfile");

          if (isMounted) {
            setUserName("Rahul Patil");
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Profile request failed: ${response.status}`
          );
        }

        const data: ProfileResponse = await response.json();

        if (!data.success || !data.user) {
          throw new Error(
            data.message || "User profile was not returned."
          );
        }

        const name = data.user.fullName ?? data.user.FullName;

        if (typeof name !== "string" || !name.trim()) {
          throw new Error("User name is missing.");
        }

        if (isMounted) {
          setUserName(name.trim());
        }
      } catch (error) {
        console.error("Unable to fetch authenticated profile:", error);

        if (isMounted) {
          setUserName("Rahul Patil");
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);


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
              {profileLoading
                ? "Loading..."
                : userName || "Welcome"}
            </h1>
          </div>
        </div>

        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              style={{ fontSize: "20px" }}
            />
          </span>

          <input
            type="text"
            placeholder="Search name, UPI ID or mobile"
            className={styles.searchInput}
          />

          <button
            type="button"
            className={styles.scanIcon}
            aria-label="Scan QR code"
          >
            <IoScan size={25} />
          </button>
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Your Accounts</h2>
          <p className={styles.sectionSubtitle}>
            Manage your linked bank accounts
          </p>
        </div>

        <button type="button" className={styles.viewAll}>
          View all &gt;
        </button>
      </section>

      <div className={styles.accountsAndScan}>
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
                    <p className={styles.bankName}>HDFC Bank</p>
                    <p className={styles.accountNumber}>
                      Savings •••• 1234
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.cardMenu}
                  aria-label="HDFC account options"
                >
                  •••
                </button>
              </div>

              <div className={styles.balanceSection}>
                <p className={styles.balanceLabel}>
                  Available Balance
                </p>
                <p className={styles.balance}>₹2,24,560.50</p>
              </div>

              <div className={styles.cardFooter}>
                <div>
                  <p className={styles.footerLabel}>Account Type</p>
                  <p className={styles.footerValue}>
                    Primary Account
                  </p>
                </div>

                <div className={styles.activeBadge}>
                  <span className={styles.activeDot} />
                  <span className={styles.activeText}>Active</span>
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

                <button
                  type="button"
                  className={styles.cardMenu}
                  aria-label="SBI account options"
                >
                  •••
                </button>
              </div>

              <div className={styles.balanceSection}>
                <p className={styles.balanceLabel}>
                  Available Balance
                </p>
                <p className={styles.balance}>₹56,780.20</p>
              </div>

              <div className={styles.cardFooter}>
                <div>
                  <p className={styles.footerLabel}>Account Type</p>
                  <p className={styles.footerValue}>
                    Savings Account
                  </p>
                </div>

                <div className={styles.activeBadge}>
                  <span className={styles.activeDot} />
                  <span className={styles.activeText}>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="button" className={styles.scanPay}>
          <div className={styles.qrContainer}>
            <IoQrCodeOutline size={30} />
          </div>

          <div className={styles.scanContent}>
            <p className={styles.scanTitle}>Scan &amp; Pay</p>
            <p className={styles.scanSubtitle}>
              Scan any QR code and make instant payments
            </p>
          </div>

          <div className={styles.arrowButton}>
            <IoArrowForwardOutline size={20} />
          </div>
        </button>
      </div>

      <section className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <p className={styles.sectionSubtitle}>
            Payments &amp; everyday services
          </p>
        </div>
      </section>

      <div className={styles.quickActions}>
        <QuickAction
          icon={<IoWalletOutline size={25} />}
          text="Send Money"
          href="/Sendmoney"
        />

        <QuickAction
          icon={<IoPhonePortraitOutline size={25} />}
          text="To Mobile"
          href="/Sendmoneytomobile"
        />

        <QuickAction
          image="/images/upi-icon.png"
          text="To UPI ID"
          href="/Upitransfer"
          plain
        />

        <QuickAction
          icon={<IoPersonOutline size={25} />}
          text="Self Transfer"
          href="/selftransfer"
        />

        <QuickAction
          icon={<IoPhonePortraitOutline size={25} />}
          text="Recharge"
          href="/MobileRecharge"
        />

        <QuickAction
          icon={<IoNewspaperOutline size={25} />}
          text="Utility Bills"
          href="/Utilitybills"
        />

        <QuickAction
          icon={<IoCardOutline size={25} />}
          text="Credit Card"
          href="/Creditcardbill"
        />

        <QuickAction
          image="/images/fastag.png"
          text="FASTag"
          href="/Fasttag"
          plain
        />
      </div>

      <section className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Explore More</h2>
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

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerCol}>
            <h3 className={styles.footerBrandTitle}>
              SADAIV Finance
            </h3>

            <p className={styles.footerText}>
              Your trusted partner for loans, investments, insurance,
              and everyday payments.
            </p>

            <div className={styles.socialIcons}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedinIn} />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
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
              Mutual fund investments are subject to market risks.
              Please read all scheme-related documents carefully
              before investing. SADAIV Finance acts as a technology
              platform connecting users with regulated financial
              partners.
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

interface QuickActionProps {
  icon?: React.ReactNode;
  image?: string;
  text: string;
  href: string;
  plain?: boolean;
}

function QuickAction({
  icon,
  image,
  text,
  href,
  plain = false,
}: QuickActionProps) {
  return (
    <Link to={href} className={styles.quickAction}>
      {image ? (
        <div
          className={
            plain
              ? styles.plainImageContainer
              : styles.iconContainer
          }
        >
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
          <span className={styles.simpleIcon}>{icon}</span>
        </div>
      )}

      <span className={styles.quickActionText}>{text}</span>
    </Link>
  );
}

interface ServiceProps {
  image: string;
  text: string;
  sub: string;
}

function Service({ image, text, sub }: ServiceProps) {
  return (
    <a
      href="#"
      className={styles.service}
      onClick={(event) => event.preventDefault()}
    >
      <div className={styles.serviceIconContainer}>
        <img
          src={image}
          alt={text}
          width={28}
          height={28}
          className={styles.serviceIcon}
        />
      </div>

      <span className={styles.serviceText}>{text}</span>
      <span className={styles.serviceSub}>{sub}</span>
    </a>
  );
}