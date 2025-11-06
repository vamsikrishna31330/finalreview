import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import { useDatabase } from '../../hooks/useDatabase.js';
import DataTable from '../../components/tables/DataTable.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import './QueryConsolePage.css';

const defaultQuery = 'SELECT * FROM users LIMIT 10;';

const QueryConsolePage = () => {
  const { runScript, query, run, exportDatabase, importDatabase, resetDatabase } = useDatabase();
  const [sql, setSql] = useState(defaultQuery);
  const [result, setResult] = useState({ columns: [], values: [] });
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([{ sql: defaultQuery, timestamp: new Date().toISOString() }]);

  const hasRows = result.values?.length > 0;

  const columns = useMemo(() => result.columns.map((column) => ({ title: column, accessor: column })), [result.columns]);
  const rows = useMemo(
    () =>
      result.values.map((rowValues, index) =>
        rowValues.reduce((acc, value, colIndex) => {
          acc[result.columns[colIndex]] = value;
          acc.id = index + 1;
          return acc;
        }, {})
      ),
    [result]
  );

  const executeQuery = () => {
    try {
      const cleaned = sql.trim();
      if (!cleaned) {
        return;
      }
      setError(null);
      if (cleaned.toLowerCase().startsWith('select')) {
        const data = query(cleaned);
        setResult({ columns: data.length ? Object.keys(data[0]) : [], values: data.map((row) => Object.values(row)) });
      } else {
        const response = run(cleaned);
        setResult({ columns: ['lastInsertId', 'changes'], values: [[response.lastInsertId, response.changes]] });
      }
      setHistory((prev) => [{ sql: cleaned, timestamp: new Date().toISOString() }, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = new Uint8Array(reader.result);
      importDatabase(buffer);
      setHistory((prev) => [{ sql: '-- Imported database', timestamp: new Date().toISOString() }, ...prev]);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSqlScript = () => {
    if (!sql.trim()) {
      return;
    }
    try {
      runScript(sql);
      setHistory((prev) => [{ sql: '-- Executed script', timestamp: new Date().toISOString() }, ...prev]);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="query-console">
      <PageHeader
        title="SQL console"
        subtitle="Inspect or manipulate the client-side database with full transparency."
        actions={
          <div className="console-actions">
            <Button variant="ghost" onClick={() => exportDatabase()}>Download DB</Button>
            <label className="upload">
              Import DB
              <input type="file" accept=".sqlite,.db,.bin" onChange={handleFileImport} />
            </label>
            <Button variant="ghost" onClick={() => resetDatabase()}>Reset to seed</Button>
          </div>
        }
      />
      <div className="grid">
        <section className="editor card">
          <header>
            <h3>SQL Editor</h3>
            <div className="editor-actions">
              <Button onClick={executeQuery}>Run query</Button>
              <Button variant="secondary" onClick={handleSqlScript}>Run as script</Button>
            </div>
          </header>
          <textarea value={sql} onChange={(event) => setSql(event.target.value)} rows={12} spellCheck="false" />
          {error && <p className="error">{error}</p>}
        </section>
        <section className="history card">
          <header>
            <h3>Recent statements</h3>
          </header>
          <ul>
            {history.map((item, index) => (
              <li key={`${item.timestamp}-${index}`} onClick={() => setSql(item.sql)}>
                <time>{new Date(item.timestamp).toLocaleString()}</time>
                <pre>{item.sql}</pre>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="result card">
        <header>
          <h3>Result</h3>
        </header>
        {hasRows ? (
          <DataTable columns={columns} data={rows} />
        ) : (
          <EmptyState title="No rows" description="Execute a SELECT query to see tabular results." />
        )}
      </section>
    </div>
  );
};

export default QueryConsolePage;
