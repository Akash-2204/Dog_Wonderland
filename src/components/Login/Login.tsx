"use client";
import React, { useState } from "react";
import { login } from "../../services/api";
import { useRouter } from "next/navigation";
import styles from './LoginComponent.module.scss';
import clsx from 'clsx';
import { triggerLogin } from "@/stores/uiStore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginComponent: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [validationErrors, setValidationErrors] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    let isValid = true;
    const errors = { name: "", email: "" };
    if (!name.trim()) { errors.name = "Name is required."; isValid = false; }
    if (!email.trim()) { errors.email = "Email is required."; isValid = false; }
    else if (!EMAIL_REGEX.test(email)) { errors.email = "Please enter a valid email address."; isValid = false; }
    setValidationErrors(errors);
    return isValid;
  };

  const handleLogin = async (event: React.FormEvent) => {
     event.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await login({ name, email });
      console.log("Login successful");
      triggerLogin();
      router.push("/dashboard");
    } catch (err) {
      console.error("Login component caught API error:", err);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className={styles.loginForm}>
      <h2 className={styles.title}>Login</h2>

      <div className={styles.inputGroup}>
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: "" })); }}
          placeholder="Enter your name"
          className={clsx(styles.input, validationErrors.name && styles.inputError)}
          aria-invalid={!!validationErrors.name}
          aria-describedby={validationErrors.name ? "name-error" : undefined}
        />
        {validationErrors.name && (
          <p id="name-error" className={styles.errorMessage}>
            {validationErrors.name}
          </p>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: "" })); }}
          placeholder="you@example.com"
          className={clsx(styles.input, validationErrors.email && styles.inputError)}
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? "email-error" : undefined}
        />
        {validationErrors.email && (
          <p id="email-error" className={styles.errorMessage}>
            {validationErrors.email}
          </p>
        )}
      </div>

      <button type="submit" disabled={isLoading} className={styles.submitButton}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginComponent;
