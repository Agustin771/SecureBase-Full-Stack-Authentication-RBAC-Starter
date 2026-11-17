import { useEffect, useState } from "react";
import { authApi, getApiError } from "../../api/api";

export default function VerifyForm({ email, onVerified, onBack }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loadingCooldown, setLoadingCooldown] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCooldown() {
      setLoadingCooldown(true);

      try {
        const response = await authApi.verificationStatus(email);

        if (active) {
          setRemainingSeconds(
            response.data?.remainingSeconds ?? 0
          );
        }
      } catch {
        if (active) {
          setError("No se pudo consultar el tiempo de espera.");
        }
      } finally {
        if (active) {
          setLoadingCooldown(false);
        }
      }
    }

    loadCooldown();

    return () => {
      active = false;
    };
  }, [email]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((previous) =>
        Math.max(previous - 1, 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const formattedTime = `${String(
    Math.floor(remainingSeconds / 60)
  ).padStart(2, "0")}:${String(
    remainingSeconds % 60
  ).padStart(2, "0")}`;

  async function submit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setBusy(true);

    try {
      const response = await authApi.verify({ email, code });

      setMessage(
        response.data?.message || "¡Cuenta verificada!"
      );

      onVerified();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (busy || loadingCooldown || remainingSeconds > 0) return;

    setError("");
    setMessage("");
    setBusy(true);

    try {
      const response = await authApi.resendVerification({ email });

      setMessage(
        response.data?.message ||
        "Se envió un nuevo código a tu correo."
      );

      // El backend establece un cooldown de 60 segundos.
      setRemainingSeconds(60);

    } catch (err) {
      const remaining = err?.response?.data?.remainingSeconds;

      if (err?.response?.data?.code === "RESEND_COOLDOWN") {
        setRemainingSeconds(remaining ?? 0);
      }

      setError(getApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="notice-box">
        Enviamos un código de 6 dígitos a{" "}
        <strong>{email}</strong>. Revisá también la carpeta de spam.
      </div>

      <label>
        Código de verificación
        <input
          className="code-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          required
          minLength="6"
          maxLength="6"
        />
      </label>

      {message && (
        <p className="form-success">{message}</p>
      )}

      {error && (
        <p className="form-error" role="alert">{error}</p>
      )}

      <button
        className="primary-button"
        disabled={busy || code.length !== 6}
      >
        {busy ? "Verificando..." : "Verificar cuenta"}
      </button>

      <div className="form-links">
        <div>
          <button
            type="button"
            className="text-button"
            onClick={resend}
            disabled={
              busy ||
              loadingCooldown ||
              remainingSeconds > 0
            }
          >
            {loadingCooldown
              ? "Consultando..."
              : remainingSeconds > 0
                ? `Reenviar código (${formattedTime})`
                : "Reenviar código"}
          </button>

          {remainingSeconds > 0 && (
            <p className="form-footnote">
              Podrás solicitar otro código en {formattedTime}.
            </p>
          )}
        </div>

        <button
          type="button"
          className="text-button"
          onClick={onBack}
        >
          Volver al login
        </button>
      </div>
    </form>
  );
}
