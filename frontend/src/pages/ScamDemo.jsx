import { useState } from "react";
import { api } from "../utils/api";

// PRESETS is now a function that receives micSimulated as a parameter.
// This means mic_active is never hardcoded — it always reflects the
// current state of the checkbox toggle on screen.
const getPresets = (micSimulated) => [
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
      user_tier: "rural", mic_active: micSimulated, hour_of_day: 14, checks_in_session: 1,
    }
  },
];

export default function ScamDemo() {
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [active,       setActive]       = useState(null);
  const [micSimulated, setMicSimulated] = useState(false);

  const runPreset = async (preset, i) => {
    setLoading(true);
    setActive(i);
    setResult(null);
    const freshPresets = getPresets(micSimulated);
    try { setResult(await api.detectScam(freshPresets[i].signals)); }
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

        {/* ── Mic toggle ───────────────────────────────────────────────── */}
        <div
          onClick={() => setMicSimulated(v => !v)}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          12,
            padding:      "12px 16px",
            marginBottom: 16,
            borderRadius: "var(--radius-sm)",
            border:       micSimulated
              ? "1px solid rgba(239,68,68,0.45)"
              : "1px solid var(--border-dim)",
            background:   micSimulated
              ? "rgba(239,68,68,0.06)"
              : "var(--bg-deep)",
            cursor:       "pointer",
            transition:   "all 0.2s",
            userSelect:   "none",
          }}
        >
          <input
            type="checkbox"
            checked={micSimulated}
            onChange={e => setMicSimulated(e.target.checked)}
            onClick={e => e.stopPropagation()}
            style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--risk-high)" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize:   13,
              fontWeight: 600,
              color:      micSimulated ? "#fca5a5" : "var(--text-secondary)",
              marginBottom: 2,
            }}>
              🎙️ Simulate concurrent phone call (microphone active)
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>
              {micSimulated
                ? "Signal: mic_active = true → ScamRadar weight +30 points"
                : "Browser cannot detect OS-level mic usage — toggle to simulate production behaviour"}
            </div>
          </div>
          {micSimulated && (
            <span style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      10,
              fontWeight:    700,
              color:         "var(--risk-high)",
              letterSpacing: 1,
              padding:       "3px 8px",
              background:    "rgba(239,68,68,0.1)",
              borderRadius:  99,
              border:        "1px solid rgba(239,68,68,0.3)",
              flexShrink:    0,
            }}>
              ACTIVE
            </span>
          )}
        </div>

        {/* ── Scenario buttons ─────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 12 }}>
          {getPresets(micSimulated).map((p, i) => (
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