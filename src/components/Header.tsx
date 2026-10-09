import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBell } from "@fortawesome/free-regular-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function Header({ variant = "public" }: { variant?: "public" | "app" }) {

  const [scrolled, setScrolled] = useState(false);

  const { pathname } = useLocation();

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
                }`}
            >
              Home
            </Link>

            <Link to="/features" className={styles.navItem}>
              Features
            </Link>

            <Link
              to="/investment"
              className={styles.navItem}
            >
              About
            </Link>

            <Link
              to="/insurance"
              className={styles.navItem}
            >
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
                }`}
            >
              Home
            </Link>

            <Link
              to="/loan"
              className={`${styles.navItem} ${pathname.startsWith("/loan") ? styles.activeNavItem : ""
                }`}
            >
              Loan
            </Link>

            <Link
              to="/investment"
              className={`${styles.navItem} ${pathname.startsWith("/investment") ? styles.activeNavItem : ""
                }`}
            >
              Investment
            </Link>

            <Link
              to="/history"
              className={styles.navItem}
            >
              History
            </Link>

          </nav>

        )}

        {!isDashboard ? (

          <div className={styles.publicActions}>

            <Link
              to="/login"
              className={styles.loginButton}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className={styles.signupButton}
            >
              Sign up
            </Link>

            <button className={styles.mobileMenu}>
              <FontAwesomeIcon icon={faBars} />
            </button>

          </div>

        ) : (

          <div className={styles.rightSection}>

             <button className={styles.iconBtn}>
              <FontAwesomeIcon icon={faBell} />
            </button>

            <button className={styles.iconBtn}>
              <FontAwesomeIcon icon={faUser} />
            </button>

          </div>

        )}

      </div>

    </header>


  );
}
