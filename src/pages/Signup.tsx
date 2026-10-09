import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { AiOutlineMail } from "react-icons/ai";

import styles from "./Signup.module.css";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    setError("");

    navigate("/login");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.backButton}>
          <span className={styles.backText}>‹</span>
          <span className={styles.backLabel}>Back</span>
        </Link>

        <div className={styles.logoContainer}>
          <div className={styles.logoCircle}>
            <img
              src="/images/comp_logo.png"
              alt="SADAIV"
              className={styles.logoIcon}
            />
          </div>

          <p className={styles.logoText}>
            S A D A I V <span className={styles.logoGreen}>Finance</span>
          </p>
        </div>

        <div className={styles.headingContainer}>
          <h1 className={styles.title}>Create your account</h1>

          <p className={styles.subtitle}>
            Join S A D A I V Finance and make payments easier
          </p>
        </div>

        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <label className={styles.label} htmlFor="name">
            Full Name
          </label>
          <div className={styles.inputContainer}>
            <span className={styles.inputIcon}>
              <FontAwesomeIcon icon={faUser} />
            </span>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <label className={styles.label} htmlFor="mobile">
            Mobile Number
          </label>
          <div className={styles.inputContainer}>
            <span className={styles.countryCode}>+91</span>
            <span className={styles.verticalLine} />
            <input
              id="mobile"
              className={styles.input}
              type="tel"
              inputMode="numeric"
              placeholder="Enter mobile number"
              autoComplete="tel-national"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          <label className={styles.label} htmlFor="email">
            Email Address
          </label>
          <div className={styles.inputContainer}>
            <span className={styles.inputIcon}>
              <AiOutlineMail size={20} />
            </span>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="Enter email address"
              autoComplete="email"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.inputContainer}>
            <input
              id="password"
              className={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.showText}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label className={styles.label} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className={styles.inputContainer}>
            <input
              id="confirmPassword"
              className={styles.input}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.showText}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          </div>

          <label className={styles.termsContainer}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className={styles.checkbox} aria-hidden="true">
              <span className={styles.check}>✓</span>
            </span>

            <span className={styles.termsText}>
              I agree to Sadaiv&apos;s{" "}
              <span className={styles.termsGreen}>Terms &amp; Conditions</span>{" "}
              and <span className={styles.termsGreen}>Privacy Policy</span>
            </span>
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button type="submit" className={styles.signupButton}>
            Create Account
          </button>
        </form>

        <div className={styles.loginContainer}>
          <span className={styles.accountText}>Already have an account?</span>
          <Link to="/login" className={styles.loginText}>
            Login
          </Link>
        </div>

        <div className={styles.securityContainer}>
          <span className={styles.securityIcon}>✓</span>
          <span className={styles.securityText}>
            Your information is securely encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
