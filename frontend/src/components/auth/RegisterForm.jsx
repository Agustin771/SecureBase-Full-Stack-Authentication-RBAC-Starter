import { useState } from "react";
import { authApi, getApiError } from "../../api/api";

export default function RegisterForm({ onRegistered, onLogin }) {
  const [form, setForm] = useState({ name: "", lastName: "", email: "", password: "" });
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
      await authApi.register({
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      onRegistered(form.email.trim());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="field-grid">
        <label>Nombre
          <input name="name" autoComplete="given-name" value={form.name} onChange={update} required maxLength="80" />
        </label>
        <label>Apellido
          <input name="lastName" autoComplete="family-name" value={form.lastName} onChange={update} required maxLength="80" />
        </label>
      </div>
      <label>Correo electrónico
        <input name="email" type="email" autoComplete="email" placeholder="tu@email.com"
          value={form.email} onChange={update} required />
      </label>
      <label>Contraseña
        <input name="password" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres"
          value={form.password} onChange={update} required minLength="8" maxLength="72" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy}>
        {busy ? "Creando cuenta..." : "Crear cuenta"}
      </button>
      <p className="form-footnote">Te enviaremos un código para verificar tu correo.</p>
      <div className="form-links single">
        <span>¿Ya tenés cuenta? <button type="button" className="text-button" onClick={onLogin}>Iniciá sesión</button></span>
      </div>
    </form>
  );
}
