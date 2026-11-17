import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getApiError } from "../../api/api";

export default function LoginForm({ onForgot, onRegister, onSuccess, onVerificationRequired }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      onSuccess?.();
    }
    catch (err) {
      const code = err?.response?.data?.code;

      if (code === "ACCOUNT_NOT_VERIFIED") {
        onVerificationRequired(form.email.trim());
        return;
      }
      setError(getApiError(err));
    }   
    finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>Correo electrónico
        <input name="email" type="email" autoComplete="email" placeholder="tu@email.com"
          value={form.email} onChange={update} required />
      </label>
      <label>Contraseña
        <input name="password" type="password" autoComplete="current-password"
          placeholder="Tu contraseña" value={form.password} onChange={update} required />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy}>
        {busy ? "Ingresando..." : "Iniciar sesión"}
      </button>
      <div className="form-links">
        <button type="button" className="text-button" onClick={onForgot}>¿Olvidaste tu contraseña?</button>
        <span>¿No tenés cuenta? <button type="button" className="text-button" onClick={onRegister}>Registrate</button></span>
      </div>
    </form>
  );
}
