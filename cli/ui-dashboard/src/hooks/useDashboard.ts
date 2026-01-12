import { useState, useEffect, useCallback } from 'react';
import { Dashboard, DashboardListItem } from '../types/chart';

export function useDashboard() {
    const [dashboards, setDashboards] = useState<DashboardListItem[]>([]);
    const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch list of all dashboards
    const fetchDashboards = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboards');
            if (!response.ok) throw new Error('Failed to fetch dashboards');
            const data = await response.json();
            setDashboards(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch a specific dashboard by ID
    const fetchDashboard = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/dashboards/${id}`);
            if (!response.ok) throw new Error('Failed to fetch dashboard');
            const data = await response.json();
            setCurrentDashboard(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh a specific chart's data
    const refreshChart = useCallback(async (chartId: string) => {
        try {
            const response = await fetch(`/api/charts/${chartId}/refresh`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to refresh chart');
            const updatedChart = await response.json();

            // Update the current dashboard with refreshed chart data
            if (currentDashboard) {
                setCurrentDashboard({
                    ...currentDashboard,
                    charts: currentDashboard.charts.map(chart =>
                        chart.id === chartId ? { ...chart, ...updatedChart } : chart
                    )
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh');
        }
    }, [currentDashboard]);

    // Load dashboards on mount
    useEffect(() => {
        fetchDashboards();
    }, [fetchDashboards]);

    // Auto-select first dashboard if available
    useEffect(() => {
        if (dashboards.length > 0 && !currentDashboard) {
            fetchDashboard(dashboards[0].id);
        }
    }, [dashboards, currentDashboard, fetchDashboard]);

    return {
        dashboards,
        currentDashboard,
        loading,
        error,
        fetchDashboards,
        fetchDashboard,
        refreshChart
    };
}
