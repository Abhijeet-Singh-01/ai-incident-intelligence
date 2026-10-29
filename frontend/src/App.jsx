
import { useEffect, useState } from "react";
import "./App.css";

// The URL of our FastAPI backend.
const API_URL = "http://127.0.0.1:8000";

// Creates a reusable summary card.
function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="summary-card">
      <div>
        <p className="muted">{label}</p>
        <h2>{value}</h2>
      </div>

      <div className={`summary-icon ${color}`}>
        {icon}
      </div>
    </div>
  );
}

// Displays a colored severity or status label.
function StatusBadge({ value }) {
  return (
    <span className={`badge ${value}`}>
      {value}
    </span>
  );
}

// Main dashboard component.
function App() {
  // Stores incidents received from the backend.
  const [incidents, setIncidents] = useState([]);

  // Tracks whether the API request is in progress.
  const [loading, setLoading] = useState(true);

  // Stores an error message if the request fails.
  const [error, setError] = useState("");

  // Stores the selected severity filter.
  const [severityFilter, setSeverityFilter] = useState("all");

  // Fetches incidents from FastAPI.
  async function fetchIncidents() {
    try {
      // Shows the loading state and clears previous errors.
      setLoading(true);
      setError("");

      // Requests the incidents from the backend.
      const response = await fetch(`${API_URL}/incidents`);

      // Handles unsuccessful HTTP responses.
      if (!response.ok) {
        throw new Error(
          `Failed to fetch incidents. HTTP status: ${response.status}`
        );
      }

      // Converts the JSON response into JavaScript data.
      const data = await response.json();

      // Saves the received incidents in React state.
      setIncidents(data);
    } catch (err) {
      // Displays a helpful message if the request fails.
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure FastAPI is running."
          : err.message
      );
    } finally {
      // Stops the loading indicator.
      setLoading(false);
    }
  }

  // Fetches incidents when the dashboard first loads.
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Filters incidents by severity.
  const visibleIncidents = incidents.filter((incident) => {
    return (
      severityFilter === "all" ||
      incident.severity === severityFilter
    );
  });

  // Calculates the number of open incidents.
  const openCount = incidents.filter(
    (incident) => incident.status === "open"
  ).length;

  // Calculates the number of critical incidents.
  const criticalCount = incidents.filter(
    (incident) => incident.severity === "critical"
  ).length;

  // Calculates the number of resolved incidents.
  const resolvedCount = incidents.filter(
    (incident) => incident.status === "resolved"
  ).length;

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
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

      {/* Main dashboard */}
      <main className="main-content" id="dashboard">
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

        <section className="welcome-section">
          <div>
            <h2>System overview</h2>
            <p className="muted">
              Monitor incidents and investigate application issues.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchIncidents}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </section>

        {/* Shows an error if the backend request fails. */}
        {error && (
          <div className="error-message" role="alert">
            <strong>Connection error</strong>
            <p>{error}</p>
            <p>
              Check that FastAPI is running at {API_URL}.
            </p>
          </div>
        )}

        {/* Summary cards display counts from real API data. */}
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

        {/* Incident table */}
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
                    <td colSpan="4">
                      No incidents found.
                    </td>
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

        <footer className="page-footer">
          AI Incident Intelligence · Connected to FastAPI
        </footer>
      </main>
    </div>
  );
}

export default App;
