"use client";

import { useState } from "react";
import Link from "next/link";
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
      <h1>Bid War</h1>
      <p className="subtitle">Anukriti'26 | Placement Cell - RTUK X Finance Club</p>

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

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link 
          href="/results"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4338ca';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(79, 70, 229, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4f46e5';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(79, 70, 229, 0.3)';
          }}
        >
          🏆 View Final Results
        </Link>
      </div>
    </div>
  );
}
