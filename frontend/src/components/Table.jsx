import { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import EmptyState from './EmptyState';
import './Table.css';

export default function Table({
  columns = [],
  data = [],
  pageSize = 10,
  emptyTitle,
  emptyMessage,
  onRowClick,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pageData = sortedData.slice(startIdx, startIdx + pageSize);

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && handleSort(col.key)}
                style={col.width ? { width: col.width } : {}}
              >
                <span className="th-content">
                  {col.label}
                  {col.sortable && (
                    <span className={`sort-icon ${sortConfig.key === col.key ? 'active' : ''}`}>
                      {sortConfig.key === col.key
                        ? sortConfig.direction === 'asc' ? '▲' : '▼'
                        : '⇅'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              style={onRowClick ? { cursor: 'pointer' } : {}}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="table-pagination">
          <span className="table-pagination-info">
            Showing {startIdx + 1}–{Math.min(startIdx + pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="table-pagination-controls">
            <button
              className="table-pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              aria-label="Previous page"
            >
              <HiChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  className={`table-pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              className="table-pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              aria-label="Next page"
            >
              <HiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
