// Dashboard types for the API layer

export interface DashboardMetadata {
    title: string;
    generatedAt: string;
    dataRange?: string;
    recordCount?: number;
}

export interface KPI {
    id: string;
    label: string;
    value: string;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
}

export interface ChartQuery {
    type: 'sql' | 'api';
    connection?: string;
    sql?: string;
}

export interface ChartDataset {
    label: string;
    values: number[];
    color?: string;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface Chart {
    id: string;
    type: string;
    title: string;
    description?: string;
    query?: ChartQuery;
    data: ChartData;
    lastRefreshed?: string;
}

export interface Dashboard {
    metadata: DashboardMetadata;
    kpis: KPI[];
    charts: Chart[];
}

export interface DashboardListItem {
    id: string;
    title: string;
    generatedAt: string;
    chartCount: number;
    kpiCount: number;
}
