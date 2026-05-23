import { useState } from "react";
import { api } from "../utils/api";

// Three scenarios for the BehaviorCore demo
const PRESETS = [
  {
    label: "Normal Urban User", icon: "🏙️",
    signals: {
      typing_speed_ms: 175, hesitation_before_confirm_ms: 2100,
      session_age_seconds: 280, amount_copy_pasted: false, new_payee: false,
      amount_round_number: false, transaction_amount: 1350,
      user_tier: "urban", mic_active: false, hour_of_day: 14, checks_in_session: 1,
    }
  },
  {
    label: "Coached Scam Victim", icon: "🚨",
    signals: {
      typing_speed_ms: 680, hesitation_before_confirm_ms: 19000,
      session_age_seconds: 10, amount_copy_pasted: true, new_payee: true,
      amount_round_number: true, transaction_amount: 50000,
      user_tier: "rural", mic_active: true, hour_of_day: 2, checks_in_session: 4,
    }
  },
  {
    label: "Bot / Auto-fill Attack", icon: "🤖",
    signals: {
      typing_speed_ms: 15, hesitation_before_confirm_ms: 180,
      session_age_seconds: 5, amount_copy_pasted: true, new_payee: true,
      amount_round_number: true, transaction_amount: 100000,
      user_tier: "urban", mic_active: false, hour_of_day: 3, checks_in_session: 8,
    }
  },
];

export default function BehaviorDemo() {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [active,  setActive]  = useState(null);

  const runPreset = async (preset, i) => {
    setLoading(true);
    setActive(i);
    setResult(null);
    try {
      const data = await api.analyzeBehavior(preset.signals);
      setResult(data);
    } catch (_) { setResult({ error: true }); }
    setLoading(false);
  };

  const score  = result?.risk_score || 0;
  const scoreC = score < 30 ? "var(--risk-low)" : score < 60 ? "var(--risk-med)" : "var(--risk-high)";
  const ac     = result?.action === "ALLOW" ? "allow" : result?.action === "SOFT_BLOCK" ? "warn" : "block";

  return (
    <div className="page">
      <div className="page-header animate-fade-up">
        <div className="eyebrow">MODULE 01</div>
        <h1>⌨ BehaviorCore</h1>
        <p>
          Real-time behavioral risk scoring based on HOW the user interacts —
          not WHO they claim to be. Runs in the browser with zero latency added
          to the UPI payment rail. Inspired by Alipay AlphaRisk (CN) and BioCatch (US).
          Version 2 has 9 checks with weighted scoring and research citations.
        </p>
      </div>

      <div className="card animate-fade-up stagger-1" style={{ marginBottom: 24 }}>
        <div className="section-label">SELECT SCENARIO</div>
        <div style={{ display: "flex", gap: 12 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className={`scenario-btn ${active === i ? "active-urban" : ""}`}
              onClick={() => runPreset(p, i)}
              style={{ flex: 1 }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.label}</div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", gap: 12, color: "var(--text-dim)", padding: 16 }}>
          <div className="spinner"/>
          <span className="mono" style={{ fontSize: 12 }}>Scoring behavioral signals...</span>
        </div>
      )}

      {result && !result.error && !loading && (
        <div className="card animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
            <span className="section-label" style={{ marginBottom: 0 }}>RISK SCORE</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 40, fontWeight: 700, color: scoreC }}>
              {score}/100
            </span>
          </div>
          <div className="progress-track" style={{ marginBottom: 20 }}>
            <div className="progress-fill" style={{ width: `${score}%`, background: scoreC }}/>
          </div>
          <div className={`action-banner ${ac}`} style={{ marginBottom: 20 }}>
            <span>{result.action === "ALLOW" ? "✓" : "⚠"}</span>
            <span>{result.action?.replace("_", " ")}</span>
            <span className="mono" style={{ marginLeft: "auto", fontSize: 10, opacity: 0.6 }}>
              confidence: {result.confidence}
            </span>
          </div>
          {result.reasons?.map((r, i) => (
            <div key={i} className="reason-item">
              <span className="reason-icon">▲</span>
              <span className="reason-text">{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}