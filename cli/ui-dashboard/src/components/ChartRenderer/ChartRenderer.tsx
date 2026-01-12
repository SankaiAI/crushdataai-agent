
import {
    LineChart, Line,
    BarChart, Bar,
    PieChart, Pie, Cell,
    AreaChart, Area,
    ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Chart } from '../../types/chart';

interface ChartRendererProps {
    chart: Chart;
}

// Color palette for charts
const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

export function ChartRenderer({ chart }: ChartRendererProps) {
    // Transform data for Recharts format
    const transformedData = chart.data.labels.map((label, index) => {
        const point: Record<string, string | number> = { name: label };
        chart.data.datasets.forEach(dataset => {
            point[dataset.label] = dataset.values[index];
        });
        return point;
    });

    const renderChart = () => {
        switch (chart.type) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={transformedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            {chart.data.datasets.map((dataset, i) => (
                                <Line
                                    key={dataset.label}
                                    type="monotone"
                                    dataKey={dataset.label}
                                    stroke={dataset.color || COLORS[i % COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ fill: dataset.color || COLORS[i % COLORS.length] }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'bar':
            case 'stacked_bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={transformedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            {chart.data.datasets.map((dataset, i) => (
                                <Bar
                                    key={dataset.label}
                                    dataKey={dataset.label}
                                    fill={dataset.color || COLORS[i % COLORS.length]}
                                    stackId={chart.type === 'stacked_bar' ? 'stack' : undefined}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'horizontal_bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={transformedData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9ca3af" />
                            <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            {chart.data.datasets.map((dataset, i) => (
                                <Bar
                                    key={dataset.label}
                                    dataKey={dataset.label}
                                    fill={dataset.color || COLORS[i % COLORS.length]}
                                    radius={[0, 4, 4, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'area':
            case 'stacked_area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={transformedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            {chart.data.datasets.map((dataset, i) => (
                                <Area
                                    key={dataset.label}
                                    type="monotone"
                                    dataKey={dataset.label}
                                    fill={dataset.color || COLORS[i % COLORS.length]}
                                    stroke={dataset.color || COLORS[i % COLORS.length]}
                                    fillOpacity={0.3}
                                    stackId={chart.type === 'stacked_area' ? 'stack' : undefined}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'pie':
            case 'donut':
                const pieData = chart.data.labels.map((label, index) => ({
                    name: label,
                    value: chart.data.datasets[0]?.values[index] || 0
                }));
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={chart.type === 'donut' ? 60 : 0}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'scatter':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="x" type="number" stroke="#9ca3af" />
                            <YAxis dataKey="y" type="number" stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Scatter name={chart.title} data={transformedData} fill={COLORS[0]} />
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            case 'table':
                return (
                    <div className="chart-table">
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    {chart.data.datasets.map(ds => (
                                        <th key={ds.label}>{ds.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {chart.data.labels.map((label, i) => (
                                    <tr key={label}>
                                        <td>{label}</td>
                                        {chart.data.datasets.map(ds => (
                                            <td key={ds.label}>{ds.values[i]?.toLocaleString()}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            default:
                // Fallback to table for unknown types
                return (
                    <div className="chart-fallback">
                        <p className="fallback-warning">
                            ⚠️ Unknown chart type: "{chart.type}". Displaying as table.
                        </p>
                        <div className="chart-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th></th>
                                        {chart.data.datasets.map(ds => (
                                            <th key={ds.label}>{ds.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {chart.data.labels.map((label, i) => (
                                        <tr key={label}>
                                            <td>{label}</td>
                                            {chart.data.datasets.map(ds => (
                                                <td key={ds.label}>{ds.values[i]?.toLocaleString()}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    };

    return <div className="chart-renderer">{renderChart()}</div>;
}
