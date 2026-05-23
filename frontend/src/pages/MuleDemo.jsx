import { useState } from "react";
import { api } from "../utils/api";

// Sample VPAs for the judge to click and test
// Each has a label showing what verdict to expect
const SAMPLE_VPAS = [
  { vpa: "9876543210@paytm",       label: "✓ Trusted",      hint: "3-year old account, clean history" },
  { vpa: "quickmoney99@ybl",       label: "⚠ Mule",         hint: "3-day account, rapid outflow pattern" },
  { vpa: "sbi.customer.care@paytm",label: "✗ Blocked",      hint: "Bank impersonation — 47 reports" },
  { vpa: "rahul.sharma.2023@upi",  label: "✓ Trusted",      hint: "Regular account, 15 months history" },
  { vpa: "refund.process@okaxis",  label: "✗ High risk",    hint: "Official-sounding, 1-day old" },
  { vpa: "npci.help@ybl",          label: "✗ Blocked",      hint: "NPCI impersonation — always blocked" },
  { vpa: "kyc.verify.now@paytm",   label: "✗ High risk",    hint: "KYC scam — banks never charge for KYC" },
  { vpa: "pm.kisan.fund@ybl",      label: "✗ Blocked",      hint: "Govt scheme scam targeting farmers" },
];

const COLOR_MAP = {
  green: "var(--risk-low)",
  amber: "var(--risk-med)",
  red:   "var(--risk-high)",
};

export default function MuleDemo() {
  const [vpa,     setVpa]     = useState("");
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const checkVPA = async () => {
    if (!vpa.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.checkVPA(vpa);
      setResult(data);
    } catch (_) {
      setResult({ error: true });
    }
    setLoading(false);
  };

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header animate-fade-up">
        <div className="eyebrow">MODULE 03</div>
        <h1>🛡 MuleShield</h1>
        <p>
          Receiver-side VPA trust scoring — inspired by Australia's BioCatch Trust Network,
          which uncovered AUD $60M in mule-account fraud in Q1 2023 by scoring the recipient,
          not just the sender. No Indian bank currently does this. Enter any UPI VPA below.
        </p>
      </div>

      {/* VPA input */}
      <div className="card animate-fade-up stagger-1" style={{ marginBottom: 24 }}>
        <div className="section-label">VPA LOOKUP — 3-LAYER ANALYSIS</div>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            className="input"
            value={vpa}
            onChange={e => setVpa(e.target.value)}
            onKeyDown={e => e.key === "Enter" && checkVPA()}
            placeholder="Enter UPI VPA e.g. quickmoney99@ybl"
          />
          <button
            className="btn btn-primary"
            onClick={checkVPA}
            disabled={loading}
            style={{ whiteSpace: "nowrap" }}
          >
            {loading ? <><div className="spinner"/> Checking...</> : "Check VPA"}
          </button>
        </div>
      </div>

      {/* Sample VPA chips */}
      <div className="animate-fade-up stagger-2" style={{ marginBottom: 32 }}>
        <div className="section-label">TRY THESE SAMPLE VPAs</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SAMPLE_VPAS.map(s => (
            <button
              key={s.vpa}
              onClick={() => setVpa(s.vpa)}
              className="chip"
              title={s.hint}
            >
              <span>{s.label}</span> {s.vpa}
            </button>
          ))}
        </div>
      </div>

      {/* Result card */}
      {result && !result.error && (
        <div className="card animate-fade-in" style={{
          border: `2px solid ${COLOR_MAP[result.color] || "var(--border-mid)"}`,
        }}>
          {/* Header row: VPA + verdict badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="mono" style={{ color: "var(--text-primary)", fontSize: 14 }}>
              {result.vpa}
            </span>
            <span style={{
              background:   COLOR_MAP[result.color],
              color:        "white",
              padding:      "4px 12px",
              borderRadius: 99,
              fontWeight:   700,
              fontSize:     12,
            }}>
              {result.verdict}
            </span>
          </div>

          {/* Trust score bar */}
          <div className="section-label">TRUST SCORE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div className="progress-track" style={{ flex: 1 }}>
              <div className="progress-fill" style={{
                width:      `${result.trust_score}%`,
                background: COLOR_MAP[result.color],
              }}/>
            </div>
            <span className="mono" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              {result.trust_score}/100
            </span>
          </div>

          {/* Reason text */}
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
            {result.reason}
          </p>

          {/* Risk flags */}
          {result.risk_flags?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="section-label">RISK FLAGS DETECTED</div>
              {result.risk_flags.map(f => (
                <span key={f} className="tag-red">{f.replace(/_/g, " ")}</span>
              ))}
            </div>
          )}

          {/* Technical summary */}
          <div style={{
            padding:       "10px 14px",
            background:    "var(--bg-deep)",
            borderRadius:  "var(--radius-sm)",
            fontSize:      12,
            color:         "var(--text-dim)",
          }}>
            Decision: <strong style={{ color: COLOR_MAP[result.color] }}>{result.action}</strong>
            {"  ·  "}Account age: {result.account_age_days} days
            {"  ·  "}Lookup layer: {result.lookup_layer}
          </div>
        </div>
      )}

      {result?.error && (
        <div style={{
          padding: "14px 18px",
          background: "rgba(239,68,68,0.07)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-md)",
          color: "#fca5a5",
          fontSize: 13,
        }}>
          ⚠ Backend not connected. Make sure the backend is running or wait for Render to start up.
        </div>
      )}
    </div>
  );
}