import { useState } from "react";
import { api } from "../utils/api";

const PRESETS = [
  {
    label: "Normal Payment", icon: "✅",
    signals: {
      typing_speed_ms: 200, hesitation_before_confirm_ms: 2000,
      session_age_seconds: 180, amount_copy_pasted: false, new_payee: false,
      amount_round_number: false, transaction_amount: 800,
      user_tier: "urban", mic_active: false, hour_of_day: 11, checks_in_session: 1,
    }
  },
  {
    label: "Active Scam Call", icon: "📞",
    signals: {
      typing_speed_ms: 650, hesitation_before_confirm_ms: 16000,
      session_age_seconds: 15, amount_copy_pasted: true, new_payee: true,
      amount_round_number: true, transaction_amount: 50000,
      user_tier: "rural", mic_active: true, hour_of_day: 14, checks_in_session: 1,
    }
  },
];

export default function ScamDemo() {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [active,  setActive]  = useState(null);

  const runPreset = async (p, i) => {
    setLoading(true);
    setActive(i);
    setResult(null);
    try { setResult(await api.detectScam(p.signals)); }
    catch (_) { setResult({ error: true }); }
    setLoading(false);
  };

  const msgs = result?.intervention_messages;

  return (
    <div className="page">
      <div className="page-header animate-fade-up">
        <div className="eyebrow">MODULE 02</div>
        <h1>📞 ScamRadar</h1>
        <p>
          Detects if the user is being socially engineered in real time — coached by a scammer
          on a concurrent phone call. Inspired by UK Callsign (reduced APP fraud 29%) and
          US BioCatch scam-state detection. When triggered, generates intervention messages
          in English, Hindi, and Tamil.
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
          <span className="mono" style={{ fontSize: 12 }}>Detecting scam signals...</span>
        </div>
      )}

      {result && !result.error && !loading && (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
              <span className="section-label" style={{ marginBottom: 0 }}>SCAM RISK SCORE</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 40, fontWeight: 700,
                color: result.scam_risk_score < 30 ? "var(--risk-low)"
                  : result.scam_risk_score < 60 ? "var(--risk-med)" : "var(--risk-high)",
              }}>
                {result.scam_risk_score}/100
              </span>
            </div>
            <div className="progress-track" style={{ marginBottom: 16 }}>
              <div className="progress-fill" style={{
                width: `${result.scam_risk_score}%`,
                background: result.scam_risk_score < 30 ? "var(--risk-low)"
                  : result.scam_risk_score < 60 ? "var(--risk-med)" : "var(--risk-high)",
              }}/>
            </div>
            {result.scam_signals?.map((s, i) => (
              <div key={i} className="reason-item">
                <span className="reason-icon">▲</span>
                <span className="reason-text">{s}</span>
              </div>
            ))}
          </div>

          {result.intervention_required && msgs && (
            <div>
              <div className="section-label" style={{ marginBottom: 16 }}>
                CONTEXTUAL INTERVENTIONS — SHOWN IN MULTIPLE LANGUAGES
              </div>
              {Object.entries(msgs).map(([lang, m]) => (
                <div key={lang} className="card" style={{ marginBottom: 12, borderColor: "rgba(245,158,11,0.3)" }}>
                  <span className="mono" style={{ fontSize: 9, color: "var(--accent-blue)", letterSpacing: 2 }}>
                    {lang.toUpperCase()}
                  </span>
                  <div style={{ fontWeight: 700, color: "var(--risk-med)", margin: "6px 0" }}>{m.title}</div>
                  <p className="hindi" style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7 }}>
                    {m.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}