import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import Button from '../../components/Button.jsx';
import { api } from '../../utils/api.js';
import DataTable from '../../components/tables/DataTable.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import './QueryConsolePage.css';

const defaultQuery = 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 10;';

const QueryConsolePage = () => {
  const [sql, setSql] = useState(defaultQuery);
  const [result, setResult] = useState({ columns: [], values: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const executeQuery = async () => {
    try {
      const cleaned = sql.trim();
      if (!cleaned) {
        return;
      }
      setLoading(true);
      setError(null);

      // Determine if it's a SELECT query or other query
      const isSelect = cleaned.toLowerCase().startsWith('select');
      
      if (isSelect) {
        // Use query endpoint for SELECT statements
        const data = await api.query(cleaned, []);
        console.log('SQL Console - SELECT query result:', data);
        
        if (data && Array.isArray(data)) {
          setResult({ 
            columns: data.length ? Object.keys(data[0]) : [], 
            values: data.map((row) => Object.values(row)) 
          });
        } else {
          setResult({ columns: [], values: [] });
          setError('No data returned from query');
        }
      } else {
        // Use run endpoint for INSERT, UPDATE, DELETE statements
        const response = await api.run(cleaned, []);
        console.log('SQL Console - RUN query result:', response);
        
        setResult({ 
          columns: ['success', 'lastInsertId', 'changes'], 
          values: [[true, response.lastInsertId || null, response.changes || 0]] 
        });
      }
      
      setHistory((prev) => [{ sql: cleaned, timestamp: new Date().toISOString() }, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error('SQL Console Error:', err);
      setError(err.message || 'Failed to execute query');
      setResult({ columns: [], values: [] });
    } finally {
      setLoading(false);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check database connection and basic info
      const data = await api.query('SELECT current_database() as database, current_user as user, version() as version', []);
      console.log('SQL Console - Database status:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        const status = data[0];
        setResult({ 
          columns: ['Database Status', 'Value'], 
          values: [
            ['Database', status.database],
            ['User', status.user],
            ['Version', status.version.substring(0, 50) + '...']
          ] 
        });
        setSql('-- Database connected successfully!');
      } else {
        setError('Database status check failed - no data returned');
      }
    } catch (err) {
      console.error('SQL Console - Database status error:', err);
      setError(`Database connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult({ columns: [], values: [] });
    setError(null);
  };

  const loadSampleQueries = () => {
    const sampleQueries = [
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;',
      'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'users\' LIMIT 5;',
      'SELECT COUNT(*) as total_records FROM users;',
      'SELECT name, role FROM users WHERE role = \'admin\' LIMIT 5;',
      'SELECT current_database(), current_user, version();'
    ];
    setHistory(prev => [...sampleQueries.map(sql => ({ sql, timestamp: new Date().toISOString() })), ...prev]);
  };

  return (
    <div className="query-console">
      <PageHeader
        title="SQL Console"
        subtitle="Execute SQL queries against the PostgreSQL database with full transparency."
        actions={
          <div className="console-actions">
            <Button variant="ghost" onClick={checkDatabaseStatus} disabled={loading}>
              {loading ? 'Checking...' : 'Check Database'}
            </Button>
            <Button variant="ghost" onClick={loadSampleQueries}>Load Sample Queries</Button>
            <Button variant="ghost" onClick={clearResults}>Clear Results</Button>
          </div>
        }
      />
      <div className="grid">
        <section className="editor card">
          <header>
            <h3>SQL Editor</h3>
            <div className="editor-actions">
              <Button onClick={executeQuery} disabled={loading}>
                {loading ? 'Running...' : 'Run Query'}
              </Button>
            </div>
          </header>
          <textarea 
            value={sql} 
            onChange={(event) => setSql(event.target.value)} 
            rows={12} 
            spellCheck={false}
            placeholder="Enter your SQL query here..."
            disabled={loading}
          />
          {error && <p className="error">{error}</p>}
        </section>
        <section className="history card">
          <header>
            <h3>Query History</h3>
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
          <h3>Results {loading && <span className="loading-indicator">(Loading...)</span>}</h3>
        </header>
        {hasRows ? (
          <DataTable columns={columns} data={rows} />
        ) : (
          <EmptyState title="No results" description="Execute a SELECT query to see tabular results." />
        )}
      </section>
    </div>
  );
};

export default QueryConsolePage;
