import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock, faMobileScreenButton, } from "@fortawesome/free-solid-svg-icons";
import { faApple, faGoogle, faMicrosoft, } from "@fortawesome/free-brands-svg-icons";
import styles from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setError("");

    navigate("/dashboard");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoContainer} aria-label="SADAIV Finance home">
          <div className={styles.logoCircle}>
            <img src="/images/comp_logo.png" alt="" className={styles.logoIcon}/>
          </div>

          <p className={styles.logoText}>
            S A D A I V <span className={styles.logoGreen}>Finance</span>
          </p>
        </Link>

        <div className={styles.layout}>
          <div className={styles.intro}>
            <div className={styles.headingContainer}>
              <h1 className={styles.title}>Welcome !</h1>

              <p className={styles.subtitle}>
                Login to your account and continue your
                <br />
                financial journey.
              </p>
            </div>

            <div className={styles.logincard}>
              <img src="/images/login.png" alt="" className={styles.loginicon}/>

            </div>
          </div>

          <div className={styles.formColumn}>
            <form className={styles.card} onSubmit={handleSubmit} noValidate>
              <div className={styles.inputContainer}>
                <span className={styles.inputIcon}>
                  <FontAwesomeIcon icon={faMobileScreenButton} size="xl" />
                </span>
                <span className={styles.verticalLine} />
                <input
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  placeholder="Mobile Number"
                  aria-label="Mobile Number"
                  autoComplete="tel-national"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}/>
              </div>

              <div className={styles.inputContainer}>
                <span className={styles.inputIcon}>
                  <FontAwesomeIcon icon={faLock} size="lg" />
                </span>
                <span className={styles.verticalLine} />

                <input
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} />

                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              <Link to="/forgot-password" className={styles.forgot}>
                Forgot Password ?
              </Link>

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className={styles.signinButton}>
                Login
              </button>
            </form>

            <div className={styles.divider}>
              <span className={styles.horizontalline} />
              <span className={styles.dividerText}>Or continue with</span>
              <span className={styles.horizontalline} />
            </div>

            <div className={styles.continuewith}>
              <button type="button" className={styles.card2}>
                <FontAwesomeIcon icon={faGoogle} size="lg" color="#EA4335" />
                <span className={styles.card2Text}>Continue with Google</span>
              </button>

              <button type="button" className={styles.card2}>
                <FontAwesomeIcon icon={faApple} size="lg" color="#080808" />
                <span className={styles.card2Text}>Continue with Apple</span>
              </button>

              <button type="button" className={styles.card2}>
                <FontAwesomeIcon icon={faMicrosoft} size="lg" color="#080808" />
                <span className={styles.card2Text}>Continue with Microsoft</span>
              </button>
            </div>

            <div className={styles.account}>
              <span className={styles.accountText}>
                Don&apos;t have an account ?
              </span>
              <Link to="/signup" className={styles.signupLink}>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
