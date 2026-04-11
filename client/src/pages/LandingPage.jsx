import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard.jsx';
import '../styles/landing.css';

const ROTATING_PROMPTS = [
  'Build me a portfolio website with dark theme...',
  'Create a weather dashboard with animated cards...',
  'Make a to-do app with drag-and-drop...',
  'Design a landing page for a SaaS product...',
  'Build a simple calculator with glassmorphism...',
];

function LandingPage() {
  const navigate = useNavigate();
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((i) => (i + 1) % ROTATING_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <span className="landing-logo">
          <span className="landing-logo-mark">&lt;/&gt;</span> NxtBuild
        </span>
        <div className="landing-nav-right">
          <button className="landing-nav-login" onClick={() => navigate('/login')}>
            Log In
          </button>
          <button className="landing-nav-cta" onClick={() => navigate('/login')}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">
            <span className="landing-badge-dot" />
            Powered by Gemini AI
          </span>

          <h1 className="landing-hero-title">
            Turn Your Ideas Into<br />
            <span className="landing-hero-accent">Working Web Apps</span>
          </h1>

          <p className="landing-hero-subtitle">
            Describe what you want to build in plain English. NxtBuild generates
            clean, production-ready HTML, CSS, and JavaScript instantly.
          </p>

          <div className="landing-prompt-box">
            <div className="landing-prompt-input">
              {ROTATING_PROMPTS[promptIndex]}
            </div>
            <button className="landing-prompt-btn" onClick={() => navigate('/login')}>
              Start Building →
            </button>
          </div>

          <div className="landing-stats">
            <div className="landing-stat">
              <span className="landing-stat-number">100%</span>
              <span className="landing-stat-label">Free to Start</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-number">HTML</span>
              <span className="landing-stat-label">Clean Output</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-number">Gemini</span>
              <span className="landing-stat-label">AI Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <p className="landing-section-label">How It Works</p>
        <h2 className="landing-section-title">Ship faster with AI</h2>
        <p className="landing-section-subtitle">
          Three simple steps from idea to working web app
        </p>
        <div className="landing-features-grid">
          <FeatureCard
            icon="01"
            title="Describe Your Vision"
            description="Type what you want to build in plain English. Our AI understands layouts, features, design preferences, and more."
          />
          <FeatureCard
            icon="02"
            title="Watch It Build Live"
            description="See your app come to life with a real-time preview. The AI generates clean HTML, CSS, and JavaScript instantly."
          />
          <FeatureCard
            icon="03"
            title="Refine & Export"
            description="Chat to iterate on your design. Edit the code directly, restore past versions, and download the finished product."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2 className="landing-cta-title">
          Ready to build something&nbsp;
          <span className="landing-hero-accent">amazing?</span>
        </h2>
        <p className="landing-cta-subtitle">
          Join NxtBuild and turn your ideas into real web apps in minutes.
        </p>
        <button className="landing-cta-btn" onClick={() => navigate('/login')}>
          Start Building for Free →
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <span className="landing-footer-logo">
            <span className="landing-logo-mark">&lt;/&gt;</span> NxtBuild
          </span>
          <p className="landing-footer-text">Built with AI · Powered by Gemini · © 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;