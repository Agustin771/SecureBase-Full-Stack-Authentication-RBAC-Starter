import { useState } from "react";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading, isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [initialView, setInitialView] = useState("login");

  function openModal(view) {
    setInitialView(view);
    setModalOpen(true);
  }

  return (
    <main className="app-shell">
      <nav className="topbar">
        <a className="brand" href="/" aria-label="Secure Base inicio">
          <span className="brand-icon">S</span>
          <span>secure<span className="brand-light">base</span></span>
        </a>
        <div className="nav-actions">
          {isAuthenticated
            ? <span className="nav-user">{user?.name}</span>
            : <button className="nav-login" onClick={() => openModal("login")}>Iniciar sesión</button>}
          {!isAuthenticated && <button className="nav-cta" onClick={() => openModal("register")}>Crear cuenta <span>↗</span></button>}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="hero-tag"><span /> SPRING SECURITY · JWT</div>
          <h1>Tu acceso.<br /><em>Tu seguridad.</em><br />Tu espacio.</h1>
          <p className="hero-description">
            Una base de autenticación completa para probar registro, verificación de email,
            inicio de sesión y recuperación de contraseña.
          </p>
          <div className="hero-actions">
            {isAuthenticated
              ? <a className="primary-link" href="#panel">Ver mi panel <span>→</span></a>
              : <>
                  <button className="primary-link" onClick={() => openModal("register")}>Empezar ahora <span>→</span></button>
                  <button className="hero-secondary" onClick={() => openModal("login")}>Ya tengo cuenta</button>
                </>}
          </div>
          <div className="hero-trust">
            <span className="trust-icon">⌁</span>
            <span>Access token JWT</span><b>·</b>
            <span>Refresh HttpOnly</span><b>·</b>
            <span>Protección CSRF</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="visual-glow" />
          <div className="security-card">
            <div className="security-card-top"><span>AUTHENTICATION</span><span className="live-label">● LIVE</span></div>
            <div className="shield-wrap">
              <svg viewBox="0 0 120 136" role="img">
                <path d="M60 5 108 23v38c0 31-20 54-48 69C32 115 12 92 12 61V23L60 5Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                <path d="m39 66 14 14 29-31" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="verified-label"><span /> Identity verified</div>
            <div className="card-divider" />
            <div className="security-row"><span>Access token</span><strong>JWT <i>ACTIVE</i></strong></div>
            <div className="security-row"><span>Refresh token</span><strong>HTTP ONLY</strong></div>
            <div className="security-row"><span>CSRF protection</span><strong className="enabled">ENABLED</strong></div>
          </div>
          <div className="floating-chip chip-top"><span>✳</span> Secure by design</div>
          <div className="floating-chip chip-bottom"><span className="chip-check">✓</span> Session protected</div>
          <div className="visual-caption">01 <span>IDENTITY & ACCESS MANAGEMENT</span></div>
        </div>
      </section>

      <section className="feature-strip">
        <article><span className="feature-number">01</span><div><h3>Registro seguro</h3><p>Creá una cuenta y verificá tu correo.</p></div></article>
        <article><span className="feature-number">02</span><div><h3>Sesiones protegidas</h3><p>Access JWT y refresh token HttpOnly.</p></div></article>
        <article><span className="feature-number">03</span><div><h3>Recuperación</h3><p>Restablecé tu contraseña por email.</p></div></article>
      </section>

      {isAuthenticated && <div id="panel" className="dashboard-wrap"><Dashboard /></div>}
      {loading && <div className="loading-note">Comprobando sesión...</div>}

      <footer className="footer"><span>SECUREBASE <b>© 2026</b></span><span>BUILT WITH SPRING SECURITY + REACT</span></footer>

      {modalOpen && <AuthModal initialView={initialView} onClose={() => setModalOpen(false)} />}
    </main>
  );
}
