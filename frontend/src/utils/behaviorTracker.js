// behaviorTracker.js
// This class runs silently in the user's browser, collecting behavioral signals.
//
// PRIVACY NOTE: This tracker never accesses the camera, microphone content,
// or any personal data. It only measures TIMING — how many milliseconds pass
// between interactions. Timing metadata is classified as non-personal data
// under India's Digital Personal Data Protection Act (DPDP) 2023.

export class BehaviorTracker {
  constructor() {
    this.sessionStart     = Date.now();    // When this tracker was created
    this.keystrokeTimes   = [];            // Array of ms between each keystroke
    this.lastKeyTime      = null;          // Timestamp of the last keystroke
    this.amountCopyPasted = false;         // Did the user paste instead of type?
    this.hesitationStart  = null;          // When did the confirm screen appear?
    this.hesitationMs     = 0;             // How long did they pause?
    this.checksInSession  = 0;             // How many checks have they done?
  }

  // Call this every time the user presses a key in the amount or VPA field
  recordKeystroke() {
    const now = Date.now();
    if (this.lastKeyTime) {
      this.keystrokeTimes.push(now - this.lastKeyTime);
    }
    this.lastKeyTime = now;
  }

  // Call this when the user pastes content into the amount or VPA field
  recordPaste() {
    this.amountCopyPasted = true;
  }

  // Call this whenever the user makes any check or attempt
  recordCheck() {
    this.checksInSession += 1;
  }

  // Call this when the confirmation screen first appears
  startHesitationTimer() {
    this.hesitationStart = Date.now();
  }

  // Call this when the user taps Pay Now
  stopHesitationTimer() {
    if (this.hesitationStart) {
      this.hesitationMs = Date.now() - this.hesitationStart;
    }
  }

  // Returns the average time between keystrokes
  getAverageTypingSpeed() {
    if (!this.keystrokeTimes.length) return 200; // safe default
    return this.keystrokeTimes.reduce((a, b) => a + b, 0) / this.keystrokeTimes.length;
  }

  // Returns how many seconds have passed since this tracker was created
  getSessionAge() {
    return (Date.now() - this.sessionStart) / 1000;
  }

  // Returns the current hour (0-23) — used for night session detection
  getHourOfDay() {
    return new Date().getHours();
  }

  // Assembles all signals into a single object ready to send to the backend
  getSignals(transactionAmount, isNewPayee) {
    const isRoundNumber =
      transactionAmount % 1000 === 0 || transactionAmount % 500 === 0;

    return {
      typing_speed_ms:              this.getAverageTypingSpeed(),
      hesitation_before_confirm_ms: this.hesitationMs || 2000,
      session_age_seconds:          this.getSessionAge(),
      amount_copy_pasted:           this.amountCopyPasted,
      new_payee:                    isNewPayee,
      amount_round_number:          isRoundNumber,
      transaction_amount:           transactionAmount,
      mic_active:                   false,  // Production: query OS microphone API
      hour_of_day:                  this.getHourOfDay(),
      checks_in_session:            this.checksInSession,
    };
  }
}