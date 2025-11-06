import { useMemo, useState } from 'react';
import './DataTable.css';

const DataTable = ({ columns, data, onRowClick, actions }) => {
  const [sort, setSort] = useState({ key: null, direction: 'asc' });
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }
    const terms = search.toLowerCase().split(' ').filter(Boolean);
    return data.filter((row) =>
      terms.every((term) =>
        columns.some((col) => {
          const value = row[col.accessor];
          return value && value.toString().toLowerCase().includes(term);
        })
      )
    );
  }, [search, data, columns]);

  const sortedData = useMemo(() => {
    if (!sort.key) {
      return filteredData;
    }
    return [...filteredData].sort((a, b) => {
      const valueA = a[sort.key];
      const valueB = b[sort.key];
      if (valueA === valueB) {
        return 0;
      }
      if (valueA == null) {
        return 1;
      }
      if (valueB == null) {
        return -1;
      }
      const result = valueA > valueB ? 1 : -1;
      return sort.direction === 'asc' ? result : -result;
    });
  }, [filteredData, sort]);

  const toggleSort = (accessor) => {
    setSort((prev) => {
      if (prev.key === accessor) {
        const direction = prev.direction === 'asc' ? 'desc' : 'asc';
        return { key: accessor, direction };
      }
      return { key: accessor, direction: 'asc' };
    });
  };

  return (
    <div className="data-table">
      <div className="data-table-toolbar">
        <input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.accessor} onClick={() => toggleSort(column.accessor)}>
                  <span>{column.title}</span>
                  {sort.key === column.accessor && <span className="sort-indicator">{sort.direction === 'asc' ? '▲' : '▼'}</span>}
                </th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.length ? (
              sortedData.map((row) => (
                <tr key={row.id} onClick={() => onRowClick && onRowClick(row)}>
                  {columns.map((column) => (
                    <td key={column.accessor} data-label={column.title}>
                      {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className="row-actions">
                        {actions.map((action) => (
                          <button
                            type="button"
                            key={action.label}
                            className={`action ${action.intent || 'default'}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              action.onClick(row);
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="empty">
                  No records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
