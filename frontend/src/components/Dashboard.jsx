import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <section className="dashboard-card">
      <div className="dashboard-top">
        <div>
          <p className="eyebrow">PANEL PRIVADO</p>
          <h2>¡Hola, {user?.name || "de nuevo"}!</h2>
          <p className="muted-copy">Tu sesión está autenticada mediante JWT.</p>
        </div>
        <span className="status-pill"><i /> Sesión activa</span>
      </div>
      <div className="profile-grid">
        <div><span>Nombre</span><strong>{user?.name} {user?.lastName}</strong></div>
        <div><span>Email</span><strong>{user?.email}</strong></div>
        <div><span>Autenticación</span><strong>Bearer JWT</strong></div>
        <div><span>Refresh token</span><strong>Cookie HttpOnly</strong></div>
      </div>
      <button className="secondary-button" onClick={logout}>Cerrar sesión</button>
    </section>
  );
}
