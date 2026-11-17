import { useState } from "react";
import { authApi, getApiError } from "../../api/api";

export default function ForgotPasswordForm({ onSent, onBack }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      onSent(email.trim());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <p className="muted-copy">Ingresá tu correo y, si existe una cuenta asociada, te enviaremos un código para crear una contraseña nueva.</p>
      <label>Correo electrónico
        <input type="email" autoComplete="email" placeholder="tu@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy}>
        {busy ? "Enviando..." : "Enviar código"}
      </button>
      <div className="form-links single">
        <button type="button" className="text-button" onClick={onBack}>Volver al login</button>
      </div>
    </form>
  );
}
