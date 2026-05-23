"""
ScamRadar — Module 2 of TRUST OS 
========================================
Inspired by:
  - UK Callsign dynamic friction interventions (2022)
    Callsign's contextual intervention reduced APP fraud by 29% in UK banks.
  - US BioCatch scam-state detection model (2023)
    BioCatch identifies "scam state" — a distinct behavioral signature where
    the user is being coached, not acting freely.

Research:
  - UK Finance 2023 Annual Fraud Report: £485M lost to authorised push payment
  - India CERT-In Advisory 2023 on UPI social engineering patterns
  - RBI Governor's statement (Dec 2023) on phone-based fraud surge

Focus: Is this user being manipulated RIGHT NOW?
  Different from BehaviorCore (identity continuity check).
  ScamRadar detects active coercion during the transaction.
"""


# ─────────────────────────────────────────────────────────────────────────────
# SCAM SIGNAL WEIGHTS
# ─────────────────────────────────────────────────────────────────────────────
SCAM_WEIGHTS = {
    "mic_active":           30,  # Strongest signal — call coaching pattern
    "paste_to_new_payee":   25,  # Classic APP fraud precursor
    "round_new_large":      20,  # Scammer dictated the exact amount
    "extreme_hesitation":   15,  # Victim being talked into it for 15+ seconds
    "urgency_open":         10,  # "Do it now" — payment in first 20 seconds
    "mic_amplifier":        12,  # Extra weight when mic + new payee together
}


# ─────────────────────────────────────────────────────────────────────────────
# INTERVENTION MESSAGES
# These are shown to the user INSTEAD of a generic OTP prompt.
# The message is chosen based on the user's preferred language (from VulnGuard).
# Each message directly addresses the specific scam pattern detected.
# ─────────────────────────────────────────────────────────────────────────────
INTERVENTION_MESSAGES = {
    "english": {
        "title":   "We noticed something unusual",
        "body":    (
            "You are about to send ₹{amount:,.0f} to a new contact while your microphone "
            "appears to be active. This matches a known phone scam pattern. "
            "Banks and government agencies NEVER ask you to transfer money over a phone call. "
            "Are you doing this because someone called you and asked you to?"
        ),
        "cancel":  "Stop — Let Me Check First",
        "confirm": "Yes, I Am Sure — Send"
    },
    "hindi": {
        "title":   "हमें कुछ असामान्य लगा",
        "body":    (
            "आप एक नए संपर्क को ₹{amount:,.0f} भेजने वाले हैं और आपका माइक्रोफोन चालू लग रहा है। "
            "यह एक जाने-माने फोन घोटाले का तरीका है। "
            "बैंक या सरकार कभी भी फोन पर पैसे ट्रांसफर करने के लिए नहीं कहते। "
            "क्या किसी ने आपको कॉल करके यह भुगतान करने के लिए कहा?"
        ),
        "cancel":  "रुकें — पहले जाँचें",
        "confirm": "हाँ, मुझे यकीन है — भेजें"
    },
    "tamil": {
        "title":   "நாங்கள் அசாதாரணமான ஒன்றை கவனித்தோம்",
        "body":    (
            "நீங்கள் ஒரு புதிய தொடர்பிற்கு ₹{amount:,.0f} அனுப்பப் போகிறீர்கள், "
            "உங்கள் மைக்ரோஃபோன் இயங்குவதாக தெரிகிறது. "
            "வங்கிகள் எப்போதும் தொலைபேசியில் பணம் கேட்பதில்லை. "
            "யாரோ உங்களை கொல் பண்ணி இதை செய்யச் சொன்னார்களா?"
        ),
        "cancel":  "நிறுத்து — முதலில் சரிபார்",
        "confirm": "ஆம், நான் உறுதியாக இருக்கிறேன் — அனுப்பு"
    }
}


def compute_scam_score(signals: dict) -> dict:
    """
    Computes a scam likelihood score and, if the score is high enough,
    generates contextual intervention messages in multiple languages.

    Parameters
    ----------
    signals : dict — same shape as BehaviorSignals (sent from main.py)

    Returns
    -------
    dict with scam_risk_score, scam_signals, intervention_required,
         intervention_messages (in all languages), confidence
    """

    scam_score   = 0
    scam_signals = []
    amount       = signals.get("transaction_amount", 0)

    # ── SIGNAL 1: Microphone active during transaction ────────────────────────
    # Callsign (UK, 2022): When a user's microphone is in use by another app
    # during a payment, the fraud rate is 4.3x higher than baseline.
    # The scammer keeps the victim on the call to coach them in real time.
    if signals.get("mic_active", False):
        scam_score += SCAM_WEIGHTS["mic_active"]
        scam_signals.append("Microphone is active — possible concurrent coaching call with scammer")

        # Amplifier: mic + new payee together significantly increases confidence
        if signals.get("new_payee", False):
            scam_score += SCAM_WEIGHTS["mic_amplifier"]
            scam_signals.append("Mic active AND sending to new contact — scam confidence significantly elevated")

    # ── SIGNAL 2: Copy-pasted amount to a new payee ───────────────────────────
    # Scammers send the exact amount via WhatsApp or SMS and instruct the
    # victim to copy and paste it. This avoids any typo errors on their end.
    if signals.get("amount_copy_pasted", False) and signals.get("new_payee", False):
        scam_score += SCAM_WEIGHTS["paste_to_new_payee"]
        scam_signals.append("Amount copy-pasted to a new contact — classic authorised push payment scam precursor")

    # ── SIGNAL 3: Round number + new payee + large amount ─────────────────────
    # Scammers dictate specific round amounts. When a round-number large
    # payment goes to a first-time contact, it strongly suggests dictation.
    if (signals.get("amount_round_number", False)
            and signals.get("new_payee", False)
            and amount > 5000):
        scam_score += SCAM_WEIGHTS["round_new_large"]
        scam_signals.append(
            f"₹{amount:,.0f} round-number amount to a new contact — scammer likely dictated this exact figure"
        )

    # ── SIGNAL 4: Extreme hesitation (victim being talked into it) ────────────
    hesitation = signals.get("hesitation_before_confirm_ms", 2000)
    if hesitation > 15000:
        scam_score += SCAM_WEIGHTS["extreme_hesitation"]
        scam_signals.append("15+ second pause before confirming — victim showing reluctance or being persuaded")

    # ── SIGNAL 5: Payment within 20 seconds of opening app ───────────────────
    # Scammers create artificial urgency: "The offer expires in 30 seconds."
    # "Your account will be blocked if you don't pay right now."
    if signals.get("session_age_seconds", 120) < 20:
        scam_score += SCAM_WEIGHTS["urgency_open"]
        scam_signals.append("Payment attempted within 20 seconds of opening app — urgency is a core scam tactic")

    scam_score = min(scam_score, 100)

    # Build intervention messages if the score is high enough
    intervention_required = scam_score >= 40
    messages = {}
    if intervention_required:
        for lang, template in INTERVENTION_MESSAGES.items():
            messages[lang] = {
                "title":   template["title"],
                "body":    template["body"].format(amount=amount),
                "cancel":  template["cancel"],
                "confirm": template["confirm"],
            }

    return {
        "scam_risk_score":       scam_score,
        "scam_signals":          scam_signals,
        "intervention_required": intervention_required,
        "intervention_messages": messages,
        "confidence":            round(min(len(scam_signals) / 4.0, 1.0), 2),
        "module":                "ScamRadar",
        "version":               "2.0"
    }