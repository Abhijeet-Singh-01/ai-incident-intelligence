
import { useEffect, useState } from "react";
import "./App.css";

// FastAPI backend address.
const API_URL = "http://127.0.0.1:8000";

// Displays dashboard summary cards.
function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="summary-card">
      <div>
        <p className="muted">{label}</p>
        <h2>{value}</h2>
      </div>
      <div className={`summary-icon ${color}`}>{icon}</div>
    </div>
  );
}

// Displays severity and status badges.
function StatusBadge({ value }) {
  return <span className={`badge ${value}`}>{value}</span>;
}

function App() {
  // Stores incidents received from the backend.
  const [incidents, setIncidents] = useState([]);

  // Controls loading and error messages.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Controls severity filtering.
  const [severityFilter, setSeverityFilter] = useState("all");

  // Controls the create incident form.
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("low");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Controls incident deletion.
  const [deletingId, setDeletingId] = useState(null);

  // Controls incident editing.
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSeverity, setEditSeverity] = useState("low");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Fetches incidents from FastAPI.
  async function fetchIncidents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/incidents`);

      if (!response.ok) {
        throw new Error("Failed to fetch incidents.");
      }

      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to backend. Make sure FastAPI is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  // Loads incidents when the dashboard opens.
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Creates a new incident.
  async function createIncident(event) {
    event.preventDefault();

    if (!newTitle.trim()) {
      setCreateError("Please enter an incident title.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");

      const response = await fetch(`${API_URL}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          severity: newSeverity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create incident.");
      }

      // Reset form after successful creation.
      setNewTitle("");
      setNewSeverity("low");
      setShowForm(false);

      // Refresh incident list.
      await fetchIncidents();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  // Deletes an incident.
  async function deleteIncident(incidentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this incident?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(incidentId);
      setError("");

      const response = await fetch(
        `${API_URL}/incidents/${incidentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete incident.");
      }

      // Refresh dashboard after deletion.
      await fetchIncidents();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Opens the edit form with existing incident details.
  function startEditing(incident) {
    setEditingId(incident.id);
    setEditTitle(incident.title);
    setEditSeverity(incident.severity);
    setEditError("");
  }

  // Cancels editing.
  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditSeverity("low");
    setEditError("");
  }

  // Updates an existing incident.
  async function updateIncident(event, incidentId) {
    event.preventDefault();

    if (!editTitle.trim()) {
      setEditError("Incident title cannot be empty.");
      return;
    }

    try {
      setUpdating(true);
      setEditError("");

      const response = await fetch(
        `${API_URL}/incidents/${incidentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            severity: editSeverity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update incident.");
      }

      // Close edit form after successful update.
      cancelEditing();

      // Refresh dashboard with updated information.
      await fetchIncidents();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  // Filters incidents by severity.
  const visibleIncidents = incidents.filter((incident) => {
    return (
      severityFilter === "all" ||
      incident.severity === severityFilter
    );
  });

  // Dashboard statistics.
  const openCount = incidents.filter(
    (incident) => incident.status === "open"
  ).length;

  const criticalCount = incidents.filter(
    (incident) => incident.severity === "critical"
  ).length;

  const resolvedCount = incidents.filter(
    (incident) => incident.status === "resolved"
  ).length;

  return (
    <div className="app-layout">

      {/* Sidebar navigation. */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">AI</div>
          <div>
            <h2>IncidentIQ</h2>
            <p>Incident Intelligence</p>
          </div>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="navigation">
          <a className="nav-item active" href="#dashboard">
            <span>▦</span> Dashboard
          </a>

          <a className="nav-item" href="#incidents">
            <span>◈</span> Incidents
          </a>

          <a className="nav-item" href="#analysis">
            <span>⌁</span> Root Cause Analysis
          </a>

          <a className="nav-item" href="#monitoring">
            <span>◉</span> Monitoring
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="online-dot" />
          API-connected dashboard
        </div>
      </aside>

      {/* Main dashboard. */}
      <main className="main-content" id="dashboard">

        {/* Header. */}
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Overview</p>
            <h1>Incident Dashboard</h1>
          </div>

          <div className="environment">
            <span className="online-dot" />
            Development
          </div>
        </header>

        {/* Dashboard heading and buttons. */}
        <section className="welcome-section">
          <div>
            <h2>System overview</h2>
            <p className="muted">
              Monitor incidents and investigate application issues.
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              className="refresh-button"
              onClick={fetchIncidents}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>

            <button
              className="create-button"
              onClick={() => {
                setCreateError("");
                setShowForm(true);
              }}
            >
              + Create Incident
            </button>
          </div>
        </section>

        {/* Create incident form. */}
        {showForm && (
          <section className="panel create-panel">
            <div className="panel-header">
              <div>
                <h2>Create New Incident</h2>
                <p className="muted">
                  Enter the incident details below.
                </p>
              </div>
            </div>

            <form onSubmit={createIncident}>
              <div className="form-field">
                <label htmlFor="incident-title">Incident Title</label>

                <input
                  id="incident-title"
                  type="text"
                  placeholder="Example: Server response time increased"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="incident-severity">Severity</label>

                <select
                  id="incident-severity"
                  value={newSeverity}
                  onChange={(event) => setNewSeverity(event.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {createError && (
                <p className="form-error">{createError}</p>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-button"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Save Incident"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* General error message. */}
        {error && (
          <div className="error-message" role="alert">
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        )}

        {/* Dashboard statistics. */}
        <section className="summary-grid">
          <SummaryCard
            label="Total incidents"
            value={loading ? "—" : incidents.length}
            icon="▤"
            color="blue"
          />

          <SummaryCard
            label="Open incidents"
            value={loading ? "—" : openCount}
            icon="◷"
            color="orange"
          />

          <SummaryCard
            label="Critical incidents"
            value={loading ? "—" : criticalCount}
            icon="!"
            color="red"
          />

          <SummaryCard
            label="Resolved incidents"
            value={loading ? "—" : resolvedCount}
            icon="✓"
            color="green"
          />
        </section>

        {/* Incident table. */}
        <section className="panel" id="incidents">
          <div className="panel-header">
            <div>
              <h2>Incidents</h2>
              <p className="muted">
                Incidents retrieved from your backend.
              </p>
            </div>

            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              aria-label="Filter incidents by severity"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>INCIDENT</th>
                  <th>SEVERITY</th>
                  <th>STATUS</th>
                  <th>ID</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5">Loading incidents...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5">
                      Incidents could not be loaded.
                    </td>
                  </tr>
                ) : visibleIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="5">No incidents found.</td>
                  </tr>
                ) : (
                  visibleIncidents.map((incident) => (
                    <tr key={incident.id}>
                      {editingId === incident.id ? (
                        <td colSpan="5">
                          {/* Inline incident editing form. */}
                          <form
                            className="edit-form"
                            onSubmit={(event) =>
                              updateIncident(event, incident.id)
                            }
                          >
                            <div className="form-field">
                              <label htmlFor={`edit-title-${incident.id}`}>
                                Incident Title
                              </label>

                              <input
                                id={`edit-title-${incident.id}`}
                                type="text"
                                value={editTitle}
                                onChange={(event) =>
                                  setEditTitle(event.target.value)
                                }
                                required
                              />
                            </div>

                            <div className="form-field">
                              <label htmlFor={`edit-severity-${incident.id}`}>
                                Severity
                              </label>

                              <select
                                id={`edit-severity-${incident.id}`}
                                value={editSeverity}
                                onChange={(event) =>
                                  setEditSeverity(event.target.value)
                                }
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                              </select>
                            </div>

                            {editError && (
                              <p className="form-error">{editError}</p>
                            )}

                            <div className="form-actions">
                              <button
                                type="button"
                                className="cancel-button"
                                onClick={cancelEditing}
                                disabled={updating}
                              >
                                Cancel
                              </button>

                              <button
                                type="submit"
                                className="create-button"
                                disabled={updating}
                              >
                                {updating ? "Updating..." : "Save Changes"}
                              </button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td>
                            <strong>{incident.title}</strong>
                          </td>

                          <td>
                            <StatusBadge value={incident.severity} />
                          </td>

                          <td>
                            <StatusBadge value={incident.status} />
                          </td>

                          <td className="muted">
                            INC-{incident.id}
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-button"
                                onClick={() => startEditing(incident)}
                              >
                                Edit
                              </button>

                              <button
                                className="delete-button"
                                onClick={() => deleteIncident(incident.id)}
                                disabled={deletingId === incident.id}
                              >
                                {deletingId === incident.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="panel-footer">
            {loading
              ? "Loading incidents..."
              : `Showing ${visibleIncidents.length} of ${incidents.length} incidents`}
          </div>
        </section>

        {/* Dashboard footer. */}
        <footer className="page-footer">
          AI Incident Intelligence · Connected to FastAPI
        </footer>
      </main>
    </div>
  );
}

export default App;
