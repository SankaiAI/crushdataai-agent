
import {
    LineChart, Line,
    BarChart, Bar,
    PieChart, Pie, Cell,
    AreaChart, Area,
    ScatterChart, Scatter,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Plot from 'react-plotly.js';
import { Chart } from '../../types/chart';

interface ChartRendererProps {
    chart: Chart;
}

// Color palette for charts
const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

// Plotly layout defaults for dark theme
const PLOTLY_LAYOUT = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#64748b' },
    margin: { t: 30, r: 30, b: 50, l: 50 },
    showlegend: true,
    legend: { font: { color: '#64748b' } }
};

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
            // ============ RECHARTS (Tier 1) ============
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={transformedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
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
            case 'grouped_bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={transformedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            {chart.data.datasets.map((dataset, i) => (
                                <Bar
                                    key={dataset.label}
                                    dataKey={dataset.label}
                                    fill={typeof dataset.backgroundColor === 'string' ? dataset.backgroundColor : (dataset.color || COLORS[i % COLORS.length])}
                                    stackId={chart.type === 'stacked_bar' ? 'stack' : undefined}
                                    radius={[4, 4, 0, 0]}
                                >
                                    {Array.isArray(dataset.backgroundColor) && transformedData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={dataset.backgroundColor![index % dataset.backgroundColor!.length]}
                                        />
                                    ))}
                                </Bar>
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
                                    backgroundColor: '#ffffff',
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
                                    backgroundColor: '#ffffff',
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
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'scatter':
            case 'bubble':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="x" type="number" stroke="#9ca3af" name="X" />
                            <YAxis dataKey="y" type="number" stroke="#9ca3af" name="Y" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Scatter name={chart.title} data={transformedData} fill={COLORS[0]} />
                        </ScatterChart>
                    </ResponsiveContainer>
                );

            case 'radar':
            case 'spider':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={transformedData}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis dataKey="name" stroke="#9ca3af" />
                            <PolarRadiusAxis stroke="#9ca3af" />
                            {chart.data.datasets.map((dataset, i) => (
                                <Radar
                                    key={dataset.label}
                                    name={dataset.label}
                                    dataKey={dataset.label}
                                    stroke={dataset.color || COLORS[i % COLORS.length]}
                                    fill={dataset.color || COLORS[i % COLORS.length]}
                                    fillOpacity={0.3}
                                />
                            ))}
                            <Legend />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                );

            // ============ PLOTLY (Tier 2 - Advanced) ============
            case 'funnel':
                return (
                    <Plot
                        data={[{
                            type: 'funnel',
                            y: chart.data.labels,
                            x: chart.data.datasets[0]?.values || [],
                            textinfo: 'value+percent initial',
                            marker: {
                                color: COLORS.slice(0, chart.data.labels.length)
                            }
                        }]}
                        layout={{
                            ...PLOTLY_LAYOUT,
                            width: undefined,
                            height: 300,
                            title: undefined
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '300px' }}
                    />
                );

            case 'gauge':
                const gaugeValue = chart.data.datasets[0]?.values[0] || 0;
                const gaugeMax = chart.data.datasets[0]?.values[1] || 100;
                return (
                    <Plot
                        data={[{
                            type: 'indicator',
                            mode: 'gauge+number+delta',
                            value: gaugeValue,
                            delta: { reference: gaugeMax * 0.8 },
                            gauge: {
                                axis: { range: [0, gaugeMax], tickcolor: '#64748b' },
                                bar: { color: COLORS[0] },
                                bgcolor: '#ffffff',
                                bordercolor: '#e2e8f0',
                                steps: [
                                    { range: [0, gaugeMax * 0.5], color: '#e2e8f0' },
                                    { range: [gaugeMax * 0.5, gaugeMax * 0.8], color: '#4b5563' },
                                    { range: [gaugeMax * 0.8, gaugeMax], color: '#6b7280' }
                                ],
                                threshold: {
                                    line: { color: '#22c55e', width: 4 },
                                    thickness: 0.75,
                                    value: gaugeMax * 0.9
                                }
                            }
                        }]}
                        layout={{
                            ...PLOTLY_LAYOUT,
                            width: undefined,
                            height: 300
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '300px' }}
                    />
                );

            case 'treemap':
                // Treemap expects labels and parent structure
                const treemapLabels = chart.data.labels;
                const treemapValues = chart.data.datasets[0]?.values || [];
                const treemapParents = chart.data.datasets[1]?.values?.map(String) || treemapLabels.map(() => '');

                return (
                    <Plot
                        data={[{
                            type: 'treemap',
                            labels: treemapLabels,
                            parents: treemapParents,
                            values: treemapValues,
                            textinfo: 'label+value+percent parent',
                            marker: {
                                colors: COLORS.slice(0, treemapLabels.length)
                            }
                        }]}
                        layout={{
                            ...PLOTLY_LAYOUT,
                            width: undefined,
                            height: 300
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '300px' }}
                    />
                );

            case 'heatmap':
                // Heatmap expects a 2D matrix
                const heatmapZ = chart.data.datasets.map(ds => ds.values);
                const heatmapX = chart.data.labels;
                const heatmapY = chart.data.datasets.map(ds => ds.label);

                return (
                    <Plot
                        data={[{
                            type: 'heatmap',
                            z: heatmapZ,
                            x: heatmapX,
                            y: heatmapY,
                            colorscale: 'Viridis',
                            showscale: true
                        }]}
                        layout={{
                            ...PLOTLY_LAYOUT,
                            width: undefined,
                            height: 300
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '300px' }}
                    />
                );

            case 'sankey':
                // Sankey expects source, target, value arrays
                // data format: labels = node names, datasets[0] = source indices, 
                // datasets[1] = target indices, datasets[2] = values
                const sankeyNodes = chart.data.labels;
                const sankeySource = chart.data.datasets[0]?.values || [];
                const sankeyTarget = chart.data.datasets[1]?.values || [];
                const sankeyValues = chart.data.datasets[2]?.values || [];

                return (
                    <Plot
                        data={[{
                            type: 'sankey',
                            orientation: 'h',
                            node: {
                                pad: 15,
                                thickness: 20,
                                line: { color: '#e2e8f0', width: 0.5 },
                                label: sankeyNodes,
                                color: COLORS.slice(0, sankeyNodes.length)
                            },
                            link: {
                                source: sankeySource,
                                target: sankeyTarget,
                                value: sankeyValues,
                                color: 'rgba(99, 102, 241, 0.3)'
                            }
                        }]}
                        layout={{
                            ...PLOTLY_LAYOUT,
                            width: undefined,
                            height: 350
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '350px' }}
                    />
                );

            case 'waterfall':
                const waterfallValues = chart.data.datasets[0]?.values || [];
                return (
                    <Plot
                        data={[{
                            type: 'waterfall',
                            orientation: 'v',
                            x: chart.data.labels,
                            y: waterfallValues,
                            connector: { line: { color: '#6b7280' } },
                            increasing: { marker: { color: '#22c55e' } },
                            decreasing: { marker: { color: '#ef4444' } },
                            totals: { marker: { color: '#6366f1' } }
                        }]}
                        layout={{
                            ...PLOTLY_LAYOUT,
                            width: undefined,
                            height: 300,
                            waterfallgap: 0.3
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '300px' }}
                    />
                );

            // ============ TABLE (Tier 3 - Fallback) ============
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
