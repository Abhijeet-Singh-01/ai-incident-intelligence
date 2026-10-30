
import { useEffect, useState } from "react";
import "./App.css";

// FastAPI backend address.
const API_URL = "http://127.0.0.1:8000";

// Displays one dashboard summary card.
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

  // Controls the severity filter.
  const [severityFilter, setSeverityFilter] = useState("all");

  // Controls whether the create incident form is visible.
  const [showForm, setShowForm] = useState(false);

  // Stores the new incident form values.
  const [newTitle, setNewTitle] = useState("");
  const [newSeverity, setNewSeverity] = useState("low");

  // Controls form submission.
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Fetches incidents from the FastAPI backend.
  async function fetchIncidents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/incidents`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch incidents. HTTP status: ${response.status}`
        );
      }

      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure FastAPI is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  // Fetches incidents when the dashboard first loads.
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Sends a new incident to the backend.
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
        throw new Error(
          data.detail || "Failed to create incident."
        );
      }

      // Reset the form after successful creation.
      setNewTitle("");
      setNewSeverity("low");
      setShowForm(false);

      // Refresh the incident list.
      await fetchIncidents();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  // Filters incidents according to the selected severity.
  const visibleIncidents = incidents.filter((incident) => {
    return (
      severityFilter === "all" ||
      incident.severity === severityFilter
    );
  });

  // Calculates dashboard statistics.
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

      {/* Main dashboard content. */}
      <main className="main-content" id="dashboard">

        {/* Top navigation bar. */}
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

        {/* Dashboard heading and action buttons. */}
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
                <label htmlFor="incident-title">
                  Incident Title
                </label>

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
                <label htmlFor="incident-severity">
                  Severity
                </label>

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
                <p className="form-error" role="alert">
                  {createError}
                </p>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    setCreateError("");
                  }}
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

        {/* Backend connection error. */}
        {error && (
          <div className="error-message" role="alert">
            <strong>Connection error</strong>
            <p>{error}</p>
            <p>Check that FastAPI is running at {API_URL}.</p>
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
              onChange={(event) =>
                setSeverityFilter(event.target.value)
              }
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
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4">Loading incidents...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4">
                      Incidents could not be loaded.
                    </td>
                  </tr>
                ) : visibleIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="4">No incidents found.</td>
                  </tr>
                ) : (
                  visibleIncidents.map((incident) => (
                    <tr key={incident.id}>
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
