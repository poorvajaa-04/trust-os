import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar       from "./components/NavBar";
import Dashboard    from "./pages/Dashboard";
import BehaviorDemo from "./pages/BehaviorDemo";
import ScamDemo     from "./pages/ScamDemo";
import MuleDemo     from "./pages/MuleDemo";
import VulnDemo     from "./pages/VulnDemo";
import Architecture from "./pages/Architecture";
import { api }      from "./utils/api";
import "./App.css";

function App() {

  // ── Keep-Alive Ping ────────────────────────────────────────────────────────
  // Why this matters: Render's free tier shuts down your backend after 15 minutes
  // of no traffic. When a judge opens your site after 20 minutes of inactivity,
  // the first API call takes 60 seconds. The judge thinks the site is broken.
  //
  // This useEffect runs once when the page first loads:
  //   1. Pings the backend immediately (wakes it up right when the judge arrives)
  //   2. Sets up a timer to ping every 10 minutes to keep it awake
  //   3. Cleans up the timer when the page closes
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    api.ping();  // immediate ping when page loads

    const keepAliveInterval = setInterval(() => {
      api.ping();
    }, 10 * 60 * 1000);  // ping every 10 minutes

    return () => clearInterval(keepAliveInterval);  // cleanup on unmount
  }, []);

  return (
    <Router>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/"             element={<Dashboard />}    />
            <Route path="/behavior"     element={<BehaviorDemo />} />
            <Route path="/scam"         element={<ScamDemo />}     />
            <Route path="/mule"         element={<MuleDemo />}     />
            <Route path="/vuln"         element={<VulnDemo />}     />
            <Route path="/architecture" element={<Architecture />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;