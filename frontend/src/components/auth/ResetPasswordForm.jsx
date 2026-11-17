import { useState } from "react";
import { authApi, getApiError } from "../../api/api";

export default function ResetPasswordForm({ email, onReset, onBack }) {
  const [form, setForm] = useState({ token: "", newPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) {
    const value = event.target.name === "token"
      ? event.target.value.replace(/\D/g, "").slice(0, 6)
      : event.target.value;
    setForm({ ...form, [event.target.name]: value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await authApi.resetPassword({
        email,
        token: form.token,
        newPassword: form.newPassword,
      });
      onReset();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="notice-box">Código enviado a <strong>{email}</strong>.</div>
      <label>Código de recuperación
        <input name="token" className="code-input" inputMode="numeric" placeholder="000000"
          value={form.token} onChange={update} required minLength="6" maxLength="6" />
      </label>
      <label>Nueva contraseña
        <input name="newPassword" type="password" autoComplete="new-password"
          placeholder="Mínimo 8 caracteres" value={form.newPassword} onChange={update}
          required minLength="8" maxLength="72" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy || form.token.length !== 6}>
        {busy ? "Actualizando..." : "Cambiar contraseña"}
      </button>
      <div className="form-links single">
        <button type="button" className="text-button" onClick={onBack}>Volver al login</button>
      </div>
    </form>
  );
}
