import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/",             label: "Dashboard"    },
  { path: "/behavior",     label: "BehaviorCore" },
  { path: "/scam",         label: "ScamRadar"    },
  { path: "/mule",         label: "MuleShield"   },
  { path: "/vuln",         label: "VulnGuard"    },
  { path: "/architecture", label: "Architecture" },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav style={{
      position:      "fixed",
      top: 0, left: 0, right: 0,
      zIndex:        100,
      height:        "var(--nav-h)",
      background:    "rgba(8,12,20,0.88)",
      backdropFilter: "blur(16px)",
      borderBottom:  "1px solid var(--border-dim)",
      display:       "flex",
      alignItems:    "center",
      padding:       "0 28px",
      gap:           "4px",
    }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", marginRight: 28, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28,
          background:   "var(--accent-blue)",
          borderRadius: 6,
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          boxShadow:    "0 0 16px var(--accent-blue-glow)",
          flexShrink:   0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4.5V9.5L7 13L1 9.5V4.5L7 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <circle cx="7" cy="7" r="2" fill="white"/>
          </svg>
        </div>
        <span style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      13,
          fontWeight:    700,
          color:         "var(--text-primary)",
          letterSpacing: "0.5px",
        }}>
          TRUST<span style={{ color: "var(--accent-blue)" }}>_OS</span>
        </span>
      </Link>

      {/* Navigation links */}
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: "none",
              padding:        "6px 14px",
              borderRadius:   "var(--radius-sm)",
              fontSize:       12,
              fontWeight:     600,
              fontFamily:     "var(--font-display)",
              color:          active ? "var(--text-primary)" : "var(--text-dim)",
              background:     active ? "var(--bg-raised)"    : "transparent",
              border:         active ? "1px solid var(--border-mid)" : "1px solid transparent",
              transition:     "all 0.15s",
              whiteSpace:     "nowrap",
            }}
          >
            {item.label}
          </Link>
        );
      })}

      {/* Live indicator — the green dot in the top right */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width:     7,
          height:    7,
          borderRadius: "50%",
          background: "var(--risk-low)",
          boxShadow:  "0 0 8px var(--risk-low)",
        }}/>
        <span style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      10,
          color:         "var(--risk-low)",
          letterSpacing: 1,
        }}>LIVE</span>
      </div>
    </nav>
  );
}