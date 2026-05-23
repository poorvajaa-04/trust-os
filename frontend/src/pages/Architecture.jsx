import { useNavigate } from "react-router-dom";

// The 6 global systems you studied before building TRUST OS
const GLOBAL_SYSTEMS = [
  { country: "🇺🇸 USA",        system: "BioCatch",                  what: "Behavioral biometrics — typing, swiping, mouse patterns during sessions",        trust_os: "BehaviorCore"   },
  { country: "🇬🇧 UK",         system: "Callsign",                  what: "Dynamic friction — adjusts intervention intensity based on real-time scam state", trust_os: "ScamRadar"      },
  { country: "🇦🇺 Australia",  system: "BioCatch Trust Network",     what: "Receiver-side mule account scoring shared across all participating banks",        trust_os: "MuleShield"     },
  { country: "🇨🇳 China",      system: "Alipay AlphaRisk",          what: "Sub-100ms real-time transaction risk scoring at massive scale",                   trust_os: "BehaviorCore"   },
  { country: "🇯🇵 Japan",      system: "AI Zero Fraud Initiative",  what: "Vulnerability-aware detection designed for elderly and first-time digital users",  trust_os: "VulnGuard"      },
  { country: "🇸🇬 Singapore",  system: "COSMIC Network (MAS)",      what: "Mandatory cross-bank mule intelligence sharing — mule detected = all banks know", trust_os: "TrustMesh ★"   },
  { country: "🇮🇳 INDIA",      system: "TRUST OS",                  what: "First fraud system built for 500M+ Bharat first-time digital banking users",      trust_os: "All 4 Modules", isIndia: true },
];

// The 5 modules (4 built + 1 roadmap)
const MODULES = [
  { id: "01", name: "BehaviorCore", layer: "Browser — client-side JavaScript",     tech: "BehaviorTracker.js + FastAPI",              latency: "<5ms",   color: "#3b6ef8"  },
  { id: "02", name: "ScamRadar",    layer: "Backend — Python rules engine",         tech: "Weighted signal fusion, 3-language messages", latency: "<20ms",  color: "#8b5cf6"  },
  { id: "03", name: "MuleShield",   layer: "Backend — JSON database + pattern engine", tech: "12-entry DB, keyword matching, typosquat detection", latency: "<10ms",  color: "#f59e0b"  },
  { id: "04", name: "VulnGuard",    layer: "Backend + Frontend",                   tech: "Vulnerability scoring, 6-language phone mockup UI", latency: "<30ms",  color: "#10b981"  },
  { id: "05", name: "TrustMesh",    layer: "Cross-bank Network — ROADMAP",         tech: "NPCI partnership required — architecture designed", latency: "Real-time", color: "#64748b", roadmap: true },
];

export default function Architecture() {
  const navigate = useNavigate();

  return (
    <div className="page-wide">

      {/* Page header */}
      <div className="page-header animate-fade-up">
        <div className="eyebrow">SYSTEM DESIGN</div>
        <h1>Architecture</h1>
        <p>
          TRUST OS was designed by studying 6 fraud detection systems across 6 countries,
          then building what each of them missed: a system for India's 500M+ first-time
          digital banking users in Tier-2 and Tier-3 cities.
        </p>
      </div>

      {/* Global inspiration table */}
      <div className="card animate-fade-up stagger-1" style={{ marginBottom: 40 }}>
        <div className="section-label">GLOBAL INSPIRATION — 6 COUNTRIES · 6 SYSTEMS · 1 GAP</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-mid)" }}>
                {["Country", "System", "What We Learned From It", "Our Module"].map(h => (
                  <th key={h} style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: 2,
                    color: "var(--text-dim)",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GLOBAL_SYSTEMS.map((row, i) => (
                <tr key={i} style={{
                  borderBottom: "1px solid var(--border-dim)",
                  background:   row.isIndia ? "rgba(59,110,248,0.06)" : "transparent",
                }}>
                  <td style={{
                    padding:    "12px 14px",
                    fontWeight: row.isIndia ? 700 : 400,
                    color:      row.isIndia ? "var(--accent-blue)" : "var(--text-primary)",
                    whiteSpace: "nowrap",
                  }}>
                    {row.country}
                  </td>
                  <td style={{
                    padding:    "12px 14px",
                    fontFamily: "var(--font-mono)",
                    fontSize:   12,
                    color:      "var(--text-secondary)",
                  }}>
                    {row.system}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {row.what}
                  </td>
                  <td style={{
                    padding:    "12px 14px",
                    fontFamily: "var(--font-mono)",
                    fontSize:   11,
                    fontWeight: 700,
                    color:      row.isIndia ? "var(--accent-blue)" : "var(--risk-low)",
                  }}>
                    {row.trust_os}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module architecture breakdown */}
      <div className="card animate-fade-up stagger-2" style={{ marginBottom: 40 }}>
        <div className="section-label">MODULE ARCHITECTURE — LATENCY BREAKDOWN</div>
        {MODULES.map(m => (
          <div key={m.id} style={{
            display:       "flex",
            alignItems:    "center",
            gap:           16,
            padding:       "14px 0",
            borderBottom:  "1px solid var(--border-dim)",
            opacity:       m.roadmap ? 0.55 : 1,
          }}>
            <span className="mono" style={{ fontSize: 11, color: m.roadmap ? "var(--text-dim)" : m.color, minWidth: 28 }}>
              M{m.id}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: m.roadmap ? "var(--text-dim)" : m.color, fontSize: 14, marginBottom: 2 }}>
                {m.name}{m.roadmap && <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 8 }}>(ROADMAP)</span>}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{m.layer}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>{m.tech}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-dim)" }}>latency: {m.latency}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TrustMesh roadmap box */}
      <div className="animate-fade-up stagger-3" style={{
        border:        "2px dashed var(--border-mid)",
        borderRadius:  "var(--radius-lg)",
        padding:       "28px 32px",
        marginBottom:  40,
      }}>
        <div className="section-label">MODULE 05 — ROADMAP</div>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
          🔗 TrustMesh
          <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-dim)", marginLeft: 12 }}>
            Inspired by Singapore COSMIC Network (MAS-mandated, 2023)
          </span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, maxWidth: 640, marginBottom: 16 }}>
          A cross-bank mule intelligence sharing network — India's version of Singapore's COSMIC.
          When Bank A detects a mule account, all member banks are notified within 200ms. In India,
          this requires an NPCI API framework and RBI mandate. The full architecture is designed.
          The regulatory pathway is mapped. The only missing piece is the data partnership.
        </p>
        <div className="mono" style={{ fontSize: 11, color: "var(--accent-blue)" }}>
          → Regulatory framework mapped · NPCI partnership required · Architecture ready to deploy
        </div>
      </div>

      {/* For-judges note */}
      <div className="animate-fade-up stagger-4" style={{
        padding:       "20px 24px",
        background:    "rgba(59,110,248,0.05)",
        border:        "1px solid rgba(59,110,248,0.15)",
        borderRadius:  "var(--radius-md)",
      }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--accent-blue)", letterSpacing: 2, marginBottom: 8 }}>
          FOR JUDGES — ON THE SCORING MODEL
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7 }}>
          "The risk scoring uses weighted behavioral heuristics — the same architectural pattern used
          in early BioCatch production deployments. The signal weights are calibrated against RBI's 2023
          fraud taxonomy and CERT-In's UPI advisory patterns. Every weight has a citation in the code.
          The ML upgrade path (full neural behavioral model) requires NPCI's real transaction graph to
          train on — that is what TrustMesh enables. The architecture is designed for that upgrade."
        </p>
      </div>
    </div>
  );
}