import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

// Pre-built signal profiles for the two demo scenarios
const URBAN_SIGNALS = {
  typing_speed_ms: 175,
  hesitation_before_confirm_ms: 2100,
  session_age_seconds: 280,
  amount_copy_pasted: false,
  new_payee: false,
  amount_round_number: false,
  transaction_amount: 1350,
  user_tier: "urban",
  mic_active: false,
  hour_of_day: 14,
  checks_in_session: 1,
};

const SCAM_SIGNALS = {
  typing_speed_ms: 660,
  hesitation_before_confirm_ms: 18500,
  session_age_seconds: 11,
  amount_copy_pasted: true,
  new_payee: true,
  amount_round_number: true,
  transaction_amount: 50000,
  user_tier: "rural",
  mic_active: true,
  hour_of_day: 2,
  checks_in_session: 4,
};

// Real statistics from NPCI and RBI public data
const STATS = [
  { number: "131B",     label: "UPI transactions / year" },
  { number: "₹2,145Cr", label: "lost to UPI fraud FY23" },
  { number: "500M+",    label: "Tier-2/3 users at risk" },
  { number: "0",        label: "fraud systems for Bharat" },
];

// The four module cards at the bottom of the page
const MODULES = [
  {
    path: "/behavior", icon: "⌨", name: "BehaviorCore", tag: "MODULE 01",
    desc: "Typing speed · Hesitation · Copy-paste detection",
    color: "#3b6ef8", bg: "rgba(59,110,248,0.06)", border: "rgba(59,110,248,0.2)",
  },
  {
    path: "/scam",     icon: "📞", name: "ScamRadar",    tag: "MODULE 02",
    desc: "Mic detection · Coaching signals · 3-language messages",
    color: "#8b5cf6", bg: "rgba(139,92,246,0.06)", border: "rgba(139,92,246,0.2)",
  },
  {
    path: "/mule",     icon: "🛡", name: "MuleShield",   tag: "MODULE 03",
    desc: "VPA trust scoring · 12-entry fraud database · Typosquat detection",
    color: "#f59e0b", bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.2)",
  },
  {
    path: "/vuln",     icon: "🌏", name: "VulnGuard",    tag: "MODULE 04",
    desc: "6 languages · Phone mockup · World first for rural India",
    color: "#10b981", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)",
  },
];

function riskColor(score) {
  return score < 30 ? "var(--risk-low)" : score < 60 ? "var(--risk-med)" : "var(--risk-high)";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [result,         setResult]   = useState(null);
  const [loading,        setLoading]  = useState(false);
  const [activeScenario, setScenario] = useState(null);
  const [scoreDisplay,   setScore]    = useState(0);

  // Animate the score counting up from 0 to the actual value
  useEffect(() => {
    if (!result) return;
    const target = result.combined_risk_score || 0;
    let current  = 0;
    const step   = target / 30;
    const timer  = setInterval(() => {
      current = Math.min(current + step, target);
      setScore(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [result]);

  const runDemo = async (scenario) => {
    if (loading) return;
    setLoading(true);
    setScenario(scenario);
    setResult(null);
    setScore(0);
    try {
      const signals = scenario === "urban" ? URBAN_SIGNALS : SCAM_SIGNALS;
      const data    = await api.fullCheck(signals);
      setResult(data);
    } catch (_) {
      setResult({ error: true });
    }
    setLoading(false);
  };

  const score       = result?.combined_risk_score || 0;
  const scoreC      = riskColor(score);
  const actionClass = result?.action === "ALLOW" ? "allow"
    : result?.action === "SOFT_BLOCK" ? "warn" : "block";

  return (
    <div className="page-wide">

      {/* ── Hero section ──────────────────────────────────────────────────── */}
      <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 56 }}>

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 99,
          background: "rgba(59,110,248,0.08)",
          border: "1px solid rgba(59,110,248,0.2)",
          marginBottom: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-blue)", boxShadow: "0 0 8px var(--accent-blue)" }}/>
          <span className="mono" style={{ fontSize: 10, color: "var(--accent-blue)", letterSpacing: 2 }}>
            HACKATHON DEMO · LIVE SYSTEM
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 5vw, 44px)",
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: 16,
        }}>
          India's first behavioral fraud OS<br/>
          <span style={{
            background: "linear-gradient(135deg, #3b6ef8, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            built for 700M UPI users
          </span>
        </h1>

        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 28px" }}>
          4 AI modules. Zero added latency. The only fraud detection system
          ever designed for rural India's first-time digital banking users.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => runDemo("urban")}>Run Urban Demo</button>
          <button className="btn btn-ghost"   onClick={() => navigate("/architecture")}>View Architecture →</button>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-1" style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1,
        background: "var(--border-dim)",
        border: "1px solid var(--border-dim)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        marginBottom: 40,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ background: "var(--bg-surface)", padding: "20px 24px" }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 28,
              fontWeight: 700,
              color: i === 3 ? "var(--risk-high)" : "var(--text-primary)",
              lineHeight: 1,
              marginBottom: 6,
              animation: "count-up 0.5s ease forwards",
            }}>
              {s.number}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Live demo area ───────────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-2 card" style={{ marginBottom: 40, padding: 32 }}>
        <div className="section-label">LIVE DEMO — PICK A SCENARIO</div>

        {/* Scenario buttons */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <button
            className={`scenario-btn ${activeScenario === "urban" ? "active-urban" : ""}`}
            onClick={() => runDemo("urban")}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>🏙️</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Urban User</div>
            <div style={{ color: "var(--text-dim)", fontSize: 12 }}>Normal payment · Known payee · ₹1,350</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="chip">✓ Typed manually</span>
              <span className="chip">✓ Known contact</span>
            </div>
          </button>

          <button
            className={`scenario-btn ${activeScenario === "scam" ? "active-scam" : ""}`}
            onClick={() => runDemo("scam")}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>🚨</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Coached Scam Victim</div>
            <div style={{ color: "var(--text-dim)", fontSize: 12 }}>Mic active · Copy-pasted ₹50,000 · New payee</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="chip" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#fca5a5" }}>⚠ Mic active</span>
              <span className="chip" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#fca5a5" }}>⚠ Copy-pasted</span>
            </div>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-dim)", padding: "16px 0" }}>
            <div className="spinner"/>
            <span className="mono" style={{ fontSize: 12 }}>Analyzing behavioral signals...</span>
          </div>
        )}

        {/* Error state */}
        {result?.error && !loading && (
          <div style={{
            padding: "14px 18px",
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-md)",
            color: "#fca5a5",
            fontSize: 13,
          }}>
            ⚠ Backend is starting up — wait 30 seconds and click the button again.
            <span style={{ color: "var(--text-dim)", marginLeft: 8 }}>(Render free tier cold start)</span>
          </div>
        )}

        {/* Results */}
        {result && !result.error && !loading && (
          <div className="animate-fade-in">

            {/* Score display */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
              <span className="section-label" style={{ marginBottom: 0 }}>COMBINED RISK SCORE</span>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 36,
                fontWeight: 700,
                color: scoreC,
                lineHeight: 1,
                transition: "color 0.4s",
              }}>
                {scoreDisplay}<span style={{ fontSize: 18, opacity: 0.5 }}>/100</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="progress-track" style={{ marginBottom: 20 }}>
              <div className="progress-fill" style={{
                width: `${score}%`,
                background: score < 30
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : score < 60
                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                  : "linear-gradient(90deg, #ef4444, #f87171)",
              }}/>
            </div>

            {/* Action banner */}
            <div className={`action-banner ${actionClass}`} style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>
                {result.action === "ALLOW" ? "✓" : result.action === "SOFT_BLOCK" ? "⚠" : "✗"}
              </span>
              <span>DECISION: {result.action?.replace("_", " ")}</span>
              <span style={{ marginLeft: "auto", fontWeight: 400, opacity: 0.6, fontSize: 11 }}>
                {result.action === "ALLOW"      ? "Transaction proceeds normally"
                 : result.action === "SOFT_BLOCK" ? "Contextual warning shown to user"
                 :                                  "Transaction frozen — intervention required"}
              </span>
            </div>

            {/* Individual signal reasons */}
            {result.all_reasons?.length > 0 && (
              <div>
                <div className="section-label">SIGNALS DETECTED ({result.all_reasons.length})</div>
                {result.all_reasons.map((r, i) => (
                  <div key={i} className="reason-item" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                    <span className="reason-icon">▲</span>
                    <span className="reason-text">{r}</span>
                  </div>
                ))}
              </div>
            )}

            {result.all_reasons?.length === 0 && (
              <div style={{
                padding: "12px 16px",
                background: "rgba(16,185,129,0.05)",
                border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                color: "var(--risk-low)",
              }}>
                ✓ No suspicious behavioral signals detected
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Module cards ─────────────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-3">
        <div className="section-label" style={{ marginBottom: 16 }}>THE 4 MODULES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {MODULES.map(m => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              style={{
                background:    m.bg,
                border:        `1px solid ${m.border}`,
                borderRadius:  "var(--radius-lg)",
                padding:       "22px 24px",
                textAlign:     "left",
                cursor:        "pointer",
                transition:    "all 0.2s",
                display:       "block",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform  = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 32px ${m.border}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform  = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 26 }}>{m.icon}</span>
                <span className="mono" style={{ fontSize: 9, color: m.color, letterSpacing: 2 }}>{m.tag}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: m.color, marginBottom: 5 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>{m.desc}</div>
              <div style={{ marginTop: 14, fontSize: 11, color: m.color, opacity: 0.7 }}>Explore →</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="animate-fade-up stagger-4" style={{
        marginTop: 56,
        paddingTop: 24,
        borderTop: "1px solid var(--border-dim)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
          Inspired by: BioCatch (US/AU) · Callsign (UK) · AlphaRisk (CN) · AI Zero Fraud (JP) · COSMIC (SG)
        </span>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-dim)" }}>
          TRUST OS v2.0 · Built with FastAPI · React · Supabase
        </span>
      </div>
    </div>
  );
}