import { useEffect, useState } from "react";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import VerifyForm from "./auth/VerifyForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import ResetPasswordForm from "./auth/ResetPasswordForm";

const titles = {
  login: ["Qué bueno verte", "Ingresá a tu cuenta para continuar."],
  register: ["Creá tu cuenta", "Un par de datos y ya estás adentro."],
  verify: ["Un último paso", "Verificá tu correo electrónico."],
  forgot: ["Recuperá tu cuenta", "Te ayudamos a volver a entrar."],
  reset: ["Nueva contraseña", "Elegí una contraseña segura."],
};

export default function AuthModal({ onClose, initialView = "login" }) {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState("");

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function closeOnBackdrop(event) {
    if (event.target === event.currentTarget) onClose();
  }

  const [title, subtitle] = titles[view];

  return (
    <div className="modal-backdrop" onMouseDown={closeOnBackdrop}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="modal-mark">S<span>.</span></div>

        <div className="modal-heading">
          <p className="eyebrow">SECURE ACCESS</p>
          <h2 id="auth-title">{title}</h2>
          <p>{subtitle}</p>
        </div>

        {view === "login" && (
          <LoginForm
            onForgot={() => setView("forgot")}
            onRegister={() => setView("register")}
            onSuccess={onClose}
            onVerificationRequired={(value) => {
              setEmail(value);
              setView("verify");
            }}
          />
        )}

        {view === "register" && (
          <RegisterForm
            onRegistered={(value) => {
              setEmail(value);
              setView("verify");
            }}
            onLogin={() => setView("login")}
          />
        )}

        {view === "verify" && (
          <VerifyForm
            email={email}
            onVerified={() => setView("login")}
            onBack={() => setView("login")}
          />
        )}

        {view === "forgot" && (
          <ForgotPasswordForm
            onSent={(value) => {
              setEmail(value);
              setView("reset");
            }}
            onBack={() => setView("login")}
          />
        )}

        {view === "reset" && (
          <ResetPasswordForm
            email={email}
            onReset={() => setView("login")}
            onBack={() => setView("login")}
          />
        )}

        <p className="modal-security">
          <span className="security-dot" /> Conexión protegida · Autenticación JWT
        </p>
      </section>
    </div>
  );
}
