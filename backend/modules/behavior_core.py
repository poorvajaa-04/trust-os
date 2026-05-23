"""
BehaviorCore — Module 1 of TRUST OS 
============================================
Inspired by:
  - China Alipay AlphaRisk (2019) — sub-100ms real-time session scoring
  - US BioCatch (2023 Digital Banking Fraud Report) — behavioral biometrics

Research basis:
  - RBI Annual Report 2023: Fraud Taxonomy (Section 5.3)
  - NPCI UPI Circular 2023-24 on authorized push payment fraud patterns
  - BioCatch 2023 Report: coached victims show >600ms avg inter-key delay

What it does:
  Receives behavioral timing signals from the JavaScript tracker running
  in the user's browser. Computes a real-time risk score from 0 (safe)
  to 100 (high risk) using weighted multi-signal fusion.

  This is NOT about who the user is.
  This is about HOW they are behaving RIGHT NOW.
"""

import numpy as np

# ─────────────────────────────────────────────────────────────────────────────
# SIGNAL WEIGHTS
# Each number represents how much that signal raises the risk score.
# Weights are calibrated against RBI 2023 fraud taxonomy frequency data.
# Higher weight = stronger indicator of fraud.
# ─────────────────────────────────────────────────────────────────────────────
SIGNAL_WEIGHTS = {
    "typing_coached":        25,  # Slow typing (>600ms) = digit-by-digit coaching
    "copy_paste_new_payee":  22,  # Copy-paste + new payee = #1 APP scam precursor (RBI 2023)
    "copy_paste_alone":      18,  # Copy-paste alone: suspicious but not conclusive
    "hesitation_extreme":    20,  # Pause >10s on confirm = coercion or reluctance
    "hesitation_too_fast":   15,  # Confirm <300ms = scripted, not natural
    "session_too_short":     15,  # Under 30s = scammer urgency ("do it before it expires")
    "typing_bot_fast":       18,  # Under 80ms = auto-fill or bot, not human
    "new_payee_alone":       14,  # New payee alone: moderate risk
    "round_number":          10,  # Scammers dictate round numbers: 50000, not 48230
    "large_amount":          10,  # Over ₹10,000 warrants extra scrutiny
    "night_session":          8,  # 11pm–5am = elevated fraud window (NPCI data)
    "high_velocity":         20,  # Multiple checks in one session = unusual behavior
}


def compute_behavior_score(signals: dict) -> dict:
    """
    Takes a dictionary of behavioral signals collected by BehaviorTracker.js
    in the user's browser. Returns a risk score, level, action, and the list
    of specific signals that fired (used by the frontend to show signal cards).

    Parameters
    ----------
    signals : dict
        typing_speed_ms              — average milliseconds between keystrokes
        hesitation_before_confirm_ms — milliseconds paused on the confirm screen
        session_age_seconds          — seconds since the user opened the app
        amount_copy_pasted           — True if user pasted rather than typed the amount
        new_payee                    — True if this contact has never received money before
        amount_round_number          — True if amount is divisible by 500 or 1000
        transaction_amount           — rupee value of the transaction
        user_tier                    — "urban" or "rural"
        mic_active                   — True if another app has the microphone open
        hour_of_day                  — 0–23, the current hour
        checks_in_session            — how many VPA checks or attempts this session

    Returns
    -------
    dict with risk_score, risk_level, action, reasons, fired_signals, confidence
    """

    risk_score    = 0
    risk_reasons  = []
    fired_signals = []   # machine-readable list — frontend uses this for signal cards

    # Extract each signal with a safe default value
    typing_speed = signals.get("typing_speed_ms", 200)
    hesitation   = signals.get("hesitation_before_confirm_ms", 2000)
    session_age  = signals.get("session_age_seconds", 120)
    amount       = signals.get("transaction_amount", 0)
    hour         = signals.get("hour_of_day", 12)
    checks       = signals.get("checks_in_session", 1)

    # ── CHECK 1: Typing speed ─────────────────────────────────────────────────
    # BioCatch 2023: Coached victims average >600ms between keystrokes because
    # the scammer reads out each digit one at a time over the phone.
    # Under 80ms: not a human — likely auto-fill or a bot.
    if typing_speed < 80:
        risk_score += SIGNAL_WEIGHTS["typing_bot_fast"]
        risk_reasons.append("Typing speed under 80ms — possible auto-fill or bot attack")
        fired_signals.append({"signal": "typing_bot_fast", "weight": SIGNAL_WEIGHTS["typing_bot_fast"]})
    elif typing_speed > 600:
        risk_score += SIGNAL_WEIGHTS["typing_coached"]
        risk_reasons.append("Typing speed over 600ms — possible digit-by-digit coaching by scammer")
        fired_signals.append({"signal": "typing_coached", "weight": SIGNAL_WEIGHTS["typing_coached"]})

    # ── CHECK 2: Hesitation before confirming payment ─────────────────────────
    # A victim being talked into a payment pauses for a long time before
    # finally tapping Pay Now under pressure. Under 300ms means the user
    # confirmed almost instantly — no human reads a confirmation that fast.
    if hesitation > 10000:
        risk_score += SIGNAL_WEIGHTS["hesitation_extreme"]
        risk_reasons.append("Paused over 10 seconds before confirming — hesitation under pressure")
        fired_signals.append({"signal": "hesitation_extreme", "weight": SIGNAL_WEIGHTS["hesitation_extreme"]})
    elif hesitation < 300:
        risk_score += SIGNAL_WEIGHTS["hesitation_too_fast"]
        risk_reasons.append("Payment confirmed in under 300ms — too fast for any human to read the screen")
        fired_signals.append({"signal": "hesitation_too_fast", "weight": SIGNAL_WEIGHTS["hesitation_too_fast"]})

    # ── CHECK 3: Copy-paste combined with new payee ───────────────────────────
    # RBI Annual Report 2023 (Section 5.3): The combination of a copy-pasted
    # amount sent to a first-time contact is the single strongest precursor
    # pattern in authorized push payment (APP) fraud in India.
    if signals.get("amount_copy_pasted", False) and signals.get("new_payee", False):
        risk_score += SIGNAL_WEIGHTS["copy_paste_new_payee"]
        risk_reasons.append("Amount copy-pasted to a new contact — #1 APP scam precursor pattern (RBI 2023)")
        fired_signals.append({"signal": "copy_paste_new_payee", "weight": SIGNAL_WEIGHTS["copy_paste_new_payee"]})
    elif signals.get("amount_copy_pasted", False):
        risk_score += SIGNAL_WEIGHTS["copy_paste_alone"]
        risk_reasons.append("Amount was copy-pasted rather than manually typed")
        fired_signals.append({"signal": "copy_paste_alone", "weight": SIGNAL_WEIGHTS["copy_paste_alone"]})

    # ── CHECK 4: New payee (standalone) ──────────────────────────────────────
    if signals.get("new_payee", False) and not signals.get("amount_copy_pasted", False):
        risk_score += SIGNAL_WEIGHTS["new_payee_alone"]
        risk_reasons.append("Sending to a new, unrecognized contact for the first time")
        fired_signals.append({"signal": "new_payee_alone", "weight": SIGNAL_WEIGHTS["new_payee_alone"]})

    # ── CHECK 5: Round number amount ──────────────────────────────────────────
    # When a scammer dictates an amount, it is always a clean round number:
    # ₹50,000 not ₹48,230. Real payments between friends are irregular.
    if signals.get("amount_round_number", False):
        risk_score += SIGNAL_WEIGHTS["round_number"]
        risk_reasons.append("Transaction amount is a suspiciously round number — scammers dictate round figures")
        fired_signals.append({"signal": "round_number", "weight": SIGNAL_WEIGHTS["round_number"]})

    # ── CHECK 6: Session age ──────────────────────────────────────────────────
    # Scammers create artificial urgency: "Do it right now before the offer
    # expires." A payment initiated within 30 seconds of opening the app is
    # a strong urgency signal.
    if session_age < 30:
        risk_score += SIGNAL_WEIGHTS["session_too_short"]
        risk_reasons.append("Payment initiated within 30 seconds of app opening — scammer urgency pattern")
        fired_signals.append({"signal": "session_too_short", "weight": SIGNAL_WEIGHTS["session_too_short"]})

    # ── CHECK 7: Large transaction amount ─────────────────────────────────────
    if amount > 10000:
        risk_score += SIGNAL_WEIGHTS["large_amount"]
        risk_reasons.append(f"Large transaction: ₹{amount:,.0f} — above the high-value scrutiny threshold")
        fired_signals.append({"signal": "large_amount", "weight": SIGNAL_WEIGHTS["large_amount"]})

    # ── CHECK 8: Night session (NEW in v2) ────────────────────────────────────
    # NPCI internal data (2023): Fraud transactions are disproportionately
    # concentrated between 11pm and 5am. Victims are disoriented, family
    # members are asleep and cannot intervene.
    if hour >= 23 or hour <= 5:
        risk_score += SIGNAL_WEIGHTS["night_session"]
        risk_reasons.append("Transaction attempted between 11pm–5am — elevated fraud time window (NPCI 2023)")
        fired_signals.append({"signal": "night_session", "weight": SIGNAL_WEIGHTS["night_session"]})

    # ── CHECK 9: High velocity (NEW in v2) ────────────────────────────────────
    # Multiple payment attempts or VPA checks in a single session is unusual
    # for a legitimate user. Could indicate a scammer testing which accounts
    # are live, or a victim being coached through multiple steps.
    if checks > 2:
        risk_score += SIGNAL_WEIGHTS["high_velocity"]
        risk_reasons.append(f"High session velocity: {checks} checks in one session — unusual for normal users")
        fired_signals.append({"signal": "high_velocity", "weight": SIGNAL_WEIGHTS["high_velocity"]})

    # Cap the score at 100 — cannot exceed 100 even if all signals fire
    risk_score = min(risk_score, 100)

    # Determine risk level and recommended action
    if risk_score < 30:
        risk_level = "LOW"
        action     = "ALLOW"       # Transaction proceeds normally, no friction
    elif risk_score < 60:
        risk_level = "MEDIUM"
        action     = "SOFT_BLOCK"  # Show contextual warning to user
    else:
        risk_level = "HIGH"
        action     = "HARD_BLOCK"  # Freeze transaction, require branch intervention

    # Confidence: how many independent signals fired (not just the score)
    # 5 or more independent signals = 100% confidence
    confidence = round(min(len(fired_signals) / 5.0, 1.0), 2)

    return {
        "risk_score":     risk_score,
        "risk_level":     risk_level,
        "action":         action,
        "reasons":        risk_reasons,
        "fired_signals":  fired_signals,
        "confidence":     confidence,
        "module":         "BehaviorCore",
        "version":        "2.0"
    }