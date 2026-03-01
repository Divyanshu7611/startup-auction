"use client";

import { useState } from "react";
import "../app/register/register.css";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";

export default function RegisterPageContent() {
  const [view, setView] = useState("choice"); // "choice" | "login" | "register"

  if (view === "login") {
    return (
      <LoginForm onBack={() => setView("choice")} />
    );
  }

  if (view === "register") {
    return (
      <RegistrationForm onBack={() => setView("choice")} />
    );
  }

  return (
    <div className="form-container auth-choice-container">
      <h1>Startup Auction</h1>
      <p className="subtitle">Training and Placement Cell</p>

      <p className="auth-choice-prompt">Register a new team or login to your existing team.</p>

      <div className="auth-choice-buttons">
        <button
          type="button"
          className="choice-btn violet"
          onClick={() => setView("login")}
        >
          Login
        </button>
        <button
          type="button"
          className="choice-btn"
          onClick={() => setView("register")}
        >
          Register new team
        </button>
      </div>
    </div>
  );
}
