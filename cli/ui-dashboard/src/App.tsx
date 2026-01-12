
import { useDashboard } from './hooks/useDashboard';
import { Sidebar } from './components/Sidebar/Sidebar';
import { KPICard } from './components/KPICard/KPICard';
import { ChartCard } from './components/ChartCard/ChartCard';
import { EmptyState } from './components/EmptyState/EmptyState';
import { FiRefreshCw, FiClock } from 'react-icons/fi';
import './App.css';

function App() {
    const {
        dashboards,
        currentDashboard,
        loading,
        error,
        fetchDashboard,
        refreshChart,
        refreshDashboard,
        usesScriptRefresh
    } = useDashboard();

    if (loading && !currentDashboard) {
        return (
            <div className="app">
                <div className="loading-state">
                    <FiRefreshCw className="loading-spinner" />
                    <p>Loading dashboards...</p>
                </div>
            </div>
        );
    }

    if (error && !currentDashboard) {
        return (
            <div className="app">
                <div className="error-state">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    // Show empty state if no dashboards
    if (dashboards.length === 0) {
        return (
            <div className="app app-centered">
                <EmptyState />
            </div>
        );
    }

    return (
        <div className="app">
            <Sidebar
                dashboards={dashboards}
                currentId={currentDashboard?.metadata.title}
                onSelect={fetchDashboard}
            />
            <main className="main-content">
                {currentDashboard && (
                    <>
                        {loading && (
                            <div className="refresh-overlay">
                                <FiRefreshCw className="loading-spinner" />
                                <p>Refreshing data...</p>
                            </div>
                        )}
                        <header className="dashboard-header">
                            <div className="header-info">
                                <h1 className="dashboard-title">{currentDashboard.metadata.title}</h1>
                                <div className="dashboard-meta">
                                    {currentDashboard.metadata.dataRange && (
                                        <span className="meta-item">
                                            <FiClock />
                                            {currentDashboard.metadata.dataRange}
                                        </span>
                                    )}
                                    {currentDashboard.metadata.generatedAt && (
                                        <span className="meta-item">
                                            Last updated: {new Date(currentDashboard.metadata.generatedAt).toLocaleString()}
                                        </span>
                                    )}
                                    {currentDashboard.metadata.recordCount && (
                                        <span className="meta-item">
                                            {currentDashboard.metadata.recordCount.toLocaleString()} records
                                        </span>
                                    )}
                                </div>
                            </div>
                            {usesScriptRefresh && (
                                <button
                                    className="dashboard-refresh-btn"
                                    onClick={refreshDashboard}
                                    disabled={loading}
                                    title="Refresh all data"
                                >
                                    <FiRefreshCw className={loading ? 'spinning' : ''} />
                                    <span>Refresh Data</span>
                                </button>
                            )}
                        </header>

                        {/* KPI Section */}
                        {currentDashboard.kpis.length > 0 && (
                            <section className="kpi-section">
                                <div className="kpi-grid">
                                    {currentDashboard.kpis.map(kpi => (
                                        <KPICard key={kpi.id} kpi={kpi} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Charts Section */}
                        {currentDashboard.charts.length > 0 && (
                            <section className="charts-section">
                                <div className="charts-grid">
                                    {currentDashboard.charts.map(chart => (
                                        <ChartCard
                                            key={chart.id}
                                            chart={chart}
                                            onRefresh={usesScriptRefresh ? undefined : refreshChart}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
