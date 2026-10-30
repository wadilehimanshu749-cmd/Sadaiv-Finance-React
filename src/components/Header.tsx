import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileMenu from "../user_profile/Profilemenu";
import styles from "./Header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

type StoredProfile = {
  userId?: number;
  name?: string;
  email?: string;
};

export default function Header({ variant = "public" }: { variant?: "public" | "app" }) {

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { pathname } = location;

  const [profile, setProfile] = useState<StoredProfile>(() => {
    try {
      const savedProfile = sessionStorage.getItem("sadaivProfile");
      return savedProfile ? JSON.parse(savedProfile) : {};
    } catch {
      return {};
    }
  });

  

  useEffect(() => {
    const refreshProfile = () => {
      try {
        const savedProfile = sessionStorage.getItem("sadaivProfile");

        setProfile(savedProfile ? JSON.parse(savedProfile) : {});
      } catch {
        setProfile({});
      }
    };

    window.addEventListener("sadaivProfileUpdated", refreshProfile);

    refreshProfile();

    return () => {
      window.removeEventListener(
        "sadaivProfileUpdated",
        refreshProfile
      );
    };
  }, [pathname]);

  const isDashboard = variant === "app";
  const hasDarkHero = pathname === "/" || pathname.startsWith("/dashboard");

  useEffect(() => {


    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };


  }, []);

  return (

    <header className={`${styles.fixedContainer} ${scrolled || !hasDarkHero ? styles.scrolled : ""}`}>

      <div className={styles.whiteBg} />

      <div className={styles.header}>


        <Link to={isDashboard ? "/dashboard" : "/"} className={styles.brand} >

          <div className={styles.logoBox}>

            <img
              src="/images/comp_logo.png"
              alt="SADAIV"
              width={70}
              height={70}
              className={styles.logoImage}
            />

          </div>

          <span className={styles.logo}>
            S A D A I V
          </span>

          <span className={styles.subLogo}>
            Finance
          </span>

        </Link>

        {!isDashboard ? (

          <nav className={styles.desktopNav}>

            <Link
              to="/"
              className={`${styles.navItem} ${pathname === "/" ? styles.activeNavItem : ""
                }`}>

              Home
            </Link>

            <Link to="/features" className={styles.navItem}>
              Features
            </Link>

            <Link
              to="/investment"
              className={styles.navItem}>

              About
            </Link>

            <Link
              to="/insurance"
              className={styles.navItem}>

              Security
            </Link>

          </nav>

        ) : (

          <nav className={styles.desktopNav}>

            <Link
              to="/dashboard"
              className={`${styles.navItem} ${pathname === "/dashboard"
                ? styles.activeNavItem
                : ""
                }`}>

              Home
            </Link>

            <Link
              to="/loan"
              className={`${styles.navItem} ${pathname.startsWith("/loan") ? styles.activeNavItem : ""
                }`}>

              Loan
            </Link>

            <Link
              to="/investment"
              className={`${styles.navItem} ${pathname.startsWith("/investment") ? styles.activeNavItem : ""
                }`}>

              Investment
            </Link>

            <Link
              to="/history"
              className={styles.navItem}>

              History
            </Link>

          </nav>

        )}

        {!isDashboard ? (

          <div className={styles.publicActions}>

            <Link
              to="/login"
              className={styles.loginButton}>

              Login
            </Link>

            <Link
              to="/signup"
              className={styles.signupButton}>

              Sign up
            </Link>

            <button
              type="button"
              className={styles.mobileMenu}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenuOpen}>

              <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
            </button>

          </div>

        ) : (

          <div className={styles.rightSection}>

            <button className={styles.iconBtn}>
              <FontAwesomeIcon icon={faBell} />
            </button>

            <ProfileMenu
              user={{
                name: profile.name || "Rahul Patil",
                email: profile.email || "rahul@gmail.com",
                customerId: "SDV-204819",
                kycVerified: true,
                linkedAccount: { bank: "HDFC Bank", last4: "4821" },
              }} />

          </div>

        )}

        {mobileMenuOpen && (
          <nav className={styles.mobileNav}>
            {!isDashboard ? (
              <>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/features" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link to="/investment" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <Link to="/insurance" onClick={() => setMobileMenuOpen(false)}>
                  Security
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/loan" onClick={() => setMobileMenuOpen(false)}>
                  Loan
                </Link>
                <Link to="/investment" onClick={() => setMobileMenuOpen(false)}>
                  Investment
                </Link>
                <Link to="/history" onClick={() => setMobileMenuOpen(false)}>
                  History
                </Link>
              </>
            )}
          </nav>
        )}

      </div>

    </header>


  );
}
