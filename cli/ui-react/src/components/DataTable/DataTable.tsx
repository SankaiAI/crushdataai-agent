import { TableData } from '../../types';
import './DataTable.css';

interface DataTableProps {
    data: TableData;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export function DataTable({ data, page, limit, onPageChange, onLimitChange }: DataTableProps) {
    const totalPages = Math.ceil(data.total / limit);

    return (
        <div className="data-table-container">
            <div className="table-wrapper">
                <table className="preview-table">
                    <thead>
                        <tr>
                            {data.columns.map((col) => (
                                <th key={col}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((row, i) => (
                            <tr key={i}>
                                {data.columns.map((col) => (
                                    <td key={col}>
                                        {row[col] !== null && row[col] !== undefined
                                            ? String(row[col])
                                            : <span className="null-value">NULL</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <div className="rows-per-page">
                    <span>Rows per page:</span>
                    <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="page-controls">
                    <button
                        className="page-btn"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        ←
                    </button>
                    <span className="page-info">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="page-btn"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        →
                    </button>
                </div>

                <div className="total-rows">
                    {data.total.toLocaleString()} total rows
                </div>
            </div>
        </div>
    );
}
