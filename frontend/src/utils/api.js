// api.js — All calls to the TRUST OS backend go through this one file.
//
// How it works:
// BASE_URL reads from your .env file: VITE_API_URL=https://your-render-url.onrender.com
// When running locally (npm run dev), it falls back to http://127.0.0.1:8000
// Every function here is an "async" function — it waits for the backend to respond
// before returning the data.

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = {

  // Module 1 — BehaviorCore
  // Sends behavioral timing signals and gets back a risk score
  analyzeBehavior: async (signals) => {
    const res = await fetch(`${BASE_URL}/api/behavior/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(signals),
    });
    return res.json();
  },

  // Module 2 — ScamRadar
  // Sends the same signals and gets back a scam detection score
  detectScam: async (signals) => {
    const res = await fetch(`${BASE_URL}/api/scam/detect`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(signals),
    });
    return res.json();
  },

  // Module 3 — MuleShield
  // Sends a VPA string and gets back a trust score and verdict
  checkVPA: async (vpa) => {
    const res = await fetch(`${BASE_URL}/api/vpa/check`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ vpa }),
    });
    return res.json();
  },

  // Module 4 — VulnGuard
  // Sends a user profile and gets back vulnerability tier + warning texts
  getUserVulnerability: async (profile) => {
    const res = await fetch(`${BASE_URL}/api/user/vulnerability`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(profile),
    });
    return res.json();
  },

  // Combined — all 4 modules at once
  // This is what the Dashboard demo buttons call
  fullCheck: async (signals) => {
    const res = await fetch(`${BASE_URL}/api/transaction/fullcheck`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(signals),
    });
    return res.json();
  },

  // Keep-alive ping — called every 10 minutes by App.jsx
  // This prevents Render's free tier from sleeping between demo moments.
  // Without this, the first API call after 15 minutes of inactivity takes 60 seconds.
  // The judge thinks the site is broken. You lose.
  ping: async () => {
    try {
      await fetch(`${BASE_URL}/health`);
    } catch (_) {
      // Silent — if the backend is starting up, we just wait for the next ping
    }
  },
};