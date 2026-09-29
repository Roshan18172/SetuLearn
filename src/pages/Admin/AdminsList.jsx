import { useEffect, useState } from "react";
import adminService from "../../api/adminService";
import { getErrorMessage } from "../../api/apiErrorHandler";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { Plus } from "../../data/svgs";

const emptyForm = { name: "", email: "", password: "" };

export default function AdminsList() {
  const { admin: currentAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  document.title = "Manage Admins - Admin";

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminService.getAllAdmins();
      setAdmins(data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");
    try {
      await adminService.createContentAdmin({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setForm(emptyForm);
      setShowCreate(false);
      setMessage("Content admin created successfully.");
      await fetchAdmins();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (admin) => {
    if (admin.id === currentAdmin?.id) return;
    try {
      setTogglingId(admin.id);
      setError("");
      await adminService.toggleAdminStatus(admin.id, !admin.isActive);
      await fetchAdmins();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetting(true);
    setError("");
    setMessage("");
    try {
      await adminService.resetAdminPassword(resetTarget.id, newPassword);
      setResetTarget(null);
      setNewPassword("");
      setMessage(`Password reset for ${resetTarget.name}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResetting(false);
    }
  };

  const roleLabel = (role) => {
    if (role === "content_admin") return "Content Admin";
    if (role === "super_admin") return "Super Admin";
    return "Admin";
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Admins</h1>
          <p className="admin-page-sub">Create and manage content admins</p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => {
            setShowCreate(true);
            setError("");
          }}
        >
          <Plus size={15} /> Add content admin
        </button>
      </div>

      {error && <div className="admin-error-box">{error}</div>}
      {message && (
        <div className="admin-error-box" style={{ background: "var(--success-bg)", color: "var(--success-text)" }}>
          {message}
        </div>
      )}

      {showCreate && (
        <div className="admin-modal-overlay" onClick={() => !creating && setShowCreate(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>New content admin</h2>
            <form onSubmit={handleCreate}>
              <div className="admin-form-group">
                <label htmlFor="ca-name">Name</label>
                <input
                  id="ca-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  minLength={2}
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="ca-email">Email</label>
                <input
                  id="ca-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="ca-password">Password</label>
                <input
                  id="ca-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn" onClick={() => setShowCreate(false)} disabled={creating}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="admin-modal-overlay" onClick={() => !resetting && setResetTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reset password</h2>
            <p className="admin-page-sub" style={{ marginBottom: 12 }}>
              Set a new password for {resetTarget.name}
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="admin-form-group">
                <label htmlFor="reset-password">New password</label>
                <input
                  id="reset-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn" onClick={() => setResetTarget(null)} disabled={resetting}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={resetting}>
                  {resetting ? "Saving..." : "Reset password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : admins.length === 0 ? (
        <div className="admin-empty">No admins found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td className="admin-td-bold">{a.name}</td>
                  <td>{a.email}</td>
                  <td>
                    <span className="admin-badge">{roleLabel(a.role)}</span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        a.isActive ? "admin-badge-success" : "admin-badge-secondary"
                      }`}
                    >
                      {a.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="admin-btn"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        disabled={togglingId === a.id || a.id === currentAdmin?.id}
                        onClick={() => toggleStatus(a)}
                      >
                        {a.isActive ? "Disable" : "Enable"}
                      </button>
                      {(a.role === "content_admin" || a.id === currentAdmin?.id) && (
                        <button
                          className="admin-btn"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          onClick={() => {
                            setResetTarget(a);
                            setNewPassword("");
                            setError("");
                          }}
                        >
                          Reset password
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
