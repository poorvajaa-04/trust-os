import { useState } from "react";
import { api } from "../utils/api";

// Pre-built user profiles for the demo buttons
// Each one will produce a different vulnerability tier and language
const PRESETS = [
  {
    label: "Urban (Low Vulnerability)", icon: "🏙️",
    data: { user_id: "u1", account_type: "savings", preferred_language: "english",
            error_rate: 0.05, digital_literacy_score: 0.85 }
  },
  {
    label: "Semi-urban (Medium)", icon: "🏘️",
    data: { user_id: "u2", account_type: "savings", preferred_language: "hindi",
            error_rate: 0.35, digital_literacy_score: 0.45 }
  },
  {
    label: "Rural Jan Dhan — Hindi", icon: "🌾",
    data: { user_id: "u3", account_type: "jan_dhan", preferred_language: "hindi",
            error_rate: 0.6, digital_literacy_score: 0.2 }
  },
  {
    label: "Rural Jan Dhan — Tamil", icon: "🌴",
    data: { user_id: "u4", account_type: "jan_dhan", preferred_language: "tamil",
            error_rate: 0.65, digital_literacy_score: 0.18 }
  },
  {
    label: "Rural Jan Dhan — Telugu", icon: "🏔️",
    data: { user_id: "u5", account_type: "jan_dhan", preferred_language: "telugu",
            error_rate: 0.7, digital_literacy_score: 0.15 }
  },
  {
    label: "Rural Jan Dhan — Malayalam", icon: "🌿",
    data: { user_id: "u6", account_type: "jan_dhan", preferred_language: "malayalam",
            error_rate: 0.68, digital_literacy_score: 0.17 }
  },
  {
    label: "Rural Jan Dhan — Marathi", icon: "🏞️",
    data: { user_id: "u7", account_type: "jan_dhan", preferred_language: "marathi",
            error_rate: 0.62, digital_literacy_score: 0.22 }
  },
];

const TIER_COLOR = {
  LOW:    "var(--risk-low)",
  MEDIUM: "var(--risk-med)",
  HIGH:   "var(--risk-high)",
};

export default function VulnDemo() {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [active,  setActive]  = useState(null);

  const runPreset = async (preset, idx) => {
    setLoading(true);
    setActive(idx);
    setResult(null);
    try {
      const data = await api.getUserVulnerability(preset.data);
      setResult(data);
    } catch (_) {
      setResult({ error: true });
    }
    setLoading(false);
  };

  const tier = result?.vulnerability_tier;
  const wt   = result?.warning_texts;

  return (
    <div className="page">

      {/* Page header */}
      <div className="page-header animate-fade-up">
        <div className="eyebrow">MODULE 04 — WORLD FIRST</div>
        <h1>🌏 VulnGuard</h1>
        <p>
          The only fraud detection system ever designed for India's 500M+ first-time digital
          banking users. No global system — not BioCatch, Callsign, or Alipay — does this.
          VulnGuard identifies vulnerability tier and delivers warnings in the user's own language
          with zero friction for normal users.
        </p>
      </div>

      {/* Preset profile buttons */}
      <div className="card animate-fade-up stagger-1" style={{ marginBottom: 32 }}>
        <div className="section-label">SELECT USER PROFILE — WATCH THE TIER AND LANGUAGE CHANGE</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => runPreset(p, i)}
              className={`scenario-btn ${active === i ? "active-urban" : ""}`}
              style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}
            >
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-dim)", padding: 16 }}>
          <div className="spinner"/>
          <span className="mono" style={{ fontSize: 12 }}>Computing vulnerability profile...</span>
        </div>
      )}

      {/* Results */}
      {result && !result.error && !loading && (
        <div className="animate-fade-in">

          {/* Vulnerability score card */}
          <div className="card" style={{ borderColor: TIER_COLOR[tier], marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className="section-label" style={{ marginBottom: 0 }}>VULNERABILITY SCORE</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize:   32,
                fontWeight: 700,
                color:      TIER_COLOR[tier],
              }}>
                {result.vulnerability_score}/100
              </span>
            </div>
            <div className="progress-track" style={{ marginBottom: 16 }}>
              <div className="progress-fill" style={{
                width:      `${result.vulnerability_score}%`,
                background: TIER_COLOR[tier],
              }}/>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: TIER_COLOR[tier], letterSpacing: 1 }}>
                TIER: {tier}
              </span>
              <span style={{ color: "var(--text-dim)", fontSize: 11 }}>·</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                FRICTION: {result.friction_level}
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
              {result.description}
            </p>
            {result.vulnerability_factors?.length > 0 && (
              <div>
                <div className="section-label">CONTRIBUTING FACTORS</div>
                {result.vulnerability_factors.map((f, i) => (
                  <div key={i} className="reason-item" style={{ borderLeftColor: TIER_COLOR[tier] }}>
                    <span className="reason-icon" style={{ color: TIER_COLOR[tier] }}>→</span>
                    <span className="reason-text">{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HIGH tier: Phone mockup with vernacular warning */}
          {tier === "HIGH" && wt && (
            <div>
              <div className="section-label" style={{ marginBottom: 16 }}>
                📱 WHAT THE USER SEES ON THEIR PHONE — IN THEIR OWN LANGUAGE
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="phone-mockup">
                  <div className="phone-notch"/>

                  {/* App header */}
                  <div style={{
                    fontSize:      10,
                    color:         "rgba(255,255,255,0.3)",
                    fontFamily:    "var(--font-mono)",
                    marginBottom:  16,
                    letterSpacing: 1,
                  }}>
                    UPI PAYMENT
                  </div>

                  {/* Warning title in vernacular */}
                  <div className="hindi" style={{
                    fontSize:     18,
                    fontWeight:   700,
                    color:        "#fbbf24",
                    marginBottom: 14,
                    lineHeight:   1.4,
                  }}>
                    {wt.warning_title}
                  </div>

                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }}/>

                  {/* Scam warning text */}
                  <div className="hindi" style={{
                    fontSize:     13,
                    color:        "#e2e8f0",
                    lineHeight:   1.8,
                    marginBottom: 20,
                  }}>
                    {wt.scam_warning}
                  </div>

                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }}/>

                  {/* Cancel button — large and red (design is intentional) */}
                  <button style={{
                    width:        "100%",
                    padding:      "13px",
                    background:   "#ef4444",
                    color:        "white",
                    border:       "none",
                    borderRadius: 10,
                    fontWeight:   700,
                    fontSize:     14,
                    cursor:       "pointer",
                    marginBottom: 8,
                    fontFamily:   "var(--font-devanagari)",
                  }}>
                    {wt.cancel_button}
                  </button>

                  {/* Confirm button — small and faded (design is intentional) */}
                  <button style={{
                    width:        "100%",
                    padding:      "11px",
                    background:   "transparent",
                    color:        "rgba(255,255,255,0.3)",
                    border:       "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    fontSize:     12,
                    cursor:       "pointer",
                    fontFamily:   "var(--font-devanagari)",
                  }}>
                    {wt.confirm_button}
                  </button>
                </div>
              </div>

              {/* Explanation box below the phone */}
              <div style={{
                marginTop:     20,
                padding:       "14px 18px",
                background:    "rgba(251,191,36,0.05)",
                border:        "1px solid rgba(251,191,36,0.15)",
                borderRadius:  "var(--radius-md)",
                fontSize:      12,
                color:         "var(--text-secondary)",
                lineHeight:    1.6,
              }}>
                ↑ This warning appears <strong style={{ color: "#fbbf24" }}>INSTEAD of the OTP screen</strong> —
                in the user's own language — before they confirm payment. The cancel button is large and red.
                The confirm button is small and faded. This design choice is intentional: harder to proceed,
                easier to stop.
              </div>
            </div>
          )}

          {/* MEDIUM tier: soft English warning */}
          {tier === "MEDIUM" && wt && (
            <div className="card" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
              <div className="section-label">SOFT WARNING SHOWN (ENGLISH)</div>
              <div style={{ fontWeight: 700, color: "var(--risk-med)", marginBottom: 8 }}>
                {wt.warning_title}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                {wt.new_payee_warning}
              </p>
            </div>
          )}

          {/* LOW tier: silent monitoring */}
          {tier === "LOW" && (
            <div className="card" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
              <div style={{ color: "var(--risk-low)", fontWeight: 700, marginBottom: 8 }}>
                ✓ SILENT MODE — No Friction Added
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                This user is digitally literate. TRUST OS monitors in the background without
                adding any friction to their experience. Intervention only happens if risk
                signals fire during an actual transaction.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}