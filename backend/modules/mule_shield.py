"""
MuleShield — Module 3 of TRUST OS  
=========================================
Inspired by:
  - Australia BioCatch Trust Network (2023)
    Receiver-side scoring across all participating banks.
    Uncovered AUD $60M in mule fraud in Q1 2023 alone.
  - Singapore COSMIC Network (2023)
    MAS-mandated cross-bank information sharing on mule accounts.
    Banks share mule account data in near real-time.

What it does:
  Before any UPI payment is sent, this module scores the RECEIVING VPA.
  In production: NPCI would maintain this database, updated in real-time
  as new mule accounts are detected across all member banks.
  For the hackathon: pre-populated JSON database with 12 sample entries.

3-Layer Lookup:
  Layer 1 — Direct database match (known good/bad accounts)
  Layer 2 — Keyword pattern matching (suspicious naming conventions)
  Layer 3 — Typosquatting detection (misspelled official names like sb1, hdtc)
"""

import json
import os
import re


# ─────────────────────────────────────────────────────────────────────────────
# SUSPICIOUS KEYWORDS
# If a VPA contains any of these strings, it is flagged as suspicious.
# These patterns cover the most common fraud VPA naming conventions in India.
# ─────────────────────────────────────────────────────────────────────────────
SUSPICIOUS_KEYWORDS = [
    "refund", "prize", "lottery", "win", "winning",
    "customer.care", "customercare", "bank.help", "bankhelp",
    "kyc", "kycverify", "kyc.update", "kycupdate",
    "block", "unblock", "verify", "official",
    "sbi.", "hdfc.", "rbi.", "npci.", "uidai.",
    "paytm.care", "google.pay", "phonepe.help",
    "cashback", "cashback.return",
    "aadhar", "aadhaar", "pm.kisan", "pmkisan",
    "loan.approve", "loanapproval",
    "income.tax", "gst.refund", "taxrefund",
]

# ─────────────────────────────────────────────────────────────────────────────
# TYPOSQUAT PATTERNS
# Scammers use VPAs like "sb1.help@paytm" (using digit 1 instead of letter i)
# or "hdtc.care@ybl" (swapping f for t) to fool victims.
# These regex patterns detect those substitutions.
# ─────────────────────────────────────────────────────────────────────────────
TYPOSQUAT_PATTERNS = [
    r"sb[0-9]\.",      # sb1, sb2 mimicking sbi
    r"rb[0-9]\.",      # rb1 mimicking rbi
    r"hdtc\.",         # hdtc mimicking hdfc
    r"icic[0-9]\.",    # icic1 mimicking icici
    r"ax[i1]s\.",      # ax1s mimicking axis
]


def load_vpa_database() -> dict:
    """Load the VPA database from the JSON file."""
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'vpa_scores.json')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def lookup_vpa_score(vpa: str) -> dict:
    """
    Scores a receiving VPA using 3 layers of analysis.

    Parameters
    ----------
    vpa : str — the UPI Virtual Payment Address to check

    Returns
    -------
    dict with trust_score, verdict, reason, risk_flags, action, color
    """
    vpa_lower = vpa.lower().strip()
    database  = load_vpa_database()
    vpa_db    = database["vpa_database"]
    default   = database["default_unknown_vpa"]

    # ── LAYER 1: Direct database lookup ──────────────────────────────────────
    # Check if this exact VPA is in our pre-scored database.
    if vpa_lower in vpa_db:
        entry       = vpa_db[vpa_lower]
        trust_score = entry["trust_score"]

        # Map the trust score to an action and display color
        if trust_score >= 70:
            action, color = "ALLOW", "green"
        elif trust_score >= 40:
            action, color = "WARN",  "amber"
        else:
            action, color = "BLOCK", "red"

        return {
            "vpa":              vpa,
            "trust_score":      trust_score,
            "verdict":          entry["verdict"],
            "reason":           entry["reason"],
            "risk_flags":       entry.get("risk_flags", []),
            "account_age_days": entry.get("account_age_days", 0),
            "action":           action,
            "color":            color,
            "lookup_layer":     "database",
            "module":           "MuleShield",
            "version":          "2.0"
        }

    # ── LAYER 2: Keyword pattern matching ─────────────────────────────────────
    # VPA is not in our database. Check if it contains suspicious keywords.
    risk_flags    = []
    pattern_score = 45  # default score for unknown VPAs

    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in vpa_lower:
            risk_flags.append(f"keyword:{keyword}")
            pattern_score -= 15  # each suspicious keyword lowers the trust score

    # ── LAYER 3: Typosquatting detection ──────────────────────────────────────
    # Check if the VPA tries to impersonate official names with subtle typos.
    for pattern in TYPOSQUAT_PATTERNS:
        if re.search(pattern, vpa_lower):
            risk_flags.append("typosquat_detected")
            pattern_score -= 30  # typosquatting is very high confidence fraud
            break

    pattern_score = max(pattern_score, 5)  # never let it go below 5

    if risk_flags:
        action, color = "WARN",  "amber"
        verdict = "PATTERN_FLAGGED"
        reason  = f"VPA matches {len(risk_flags)} suspicious pattern(s) — manual review recommended"
    else:
        action, color = "ALLOW", "green"
        verdict = default["verdict"]
        reason  = default["reason"]

    return {
        "vpa":              vpa,
        "trust_score":      pattern_score,
        "verdict":          verdict,
        "reason":           reason,
        "risk_flags":       risk_flags,
        "account_age_days": "unknown",
        "action":           action,
        "color":            color,
        "lookup_layer":     "pattern_engine",
        "module":           "MuleShield",
        "version":          "2.0"
    }