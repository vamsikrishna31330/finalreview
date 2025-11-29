// Fallback database configuration
// Uses SQLite if PostgreSQL is not available

let dbProvider = null;

export const initializeDatabase = async () => {
  try {
    // Try PostgreSQL first
    const pg = await import('pg');
    const pool = new pg.Pool({
      host: 'localhost',
      port: 5432,
      database: 'farming_platform',
      user: 'postgres',
      password: '31330',
    });

    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ Using PostgreSQL');
    dbProvider = 'postgresql';
    return { provider: 'postgresql', pool };
  } catch (error) {
    console.log('❌ PostgreSQL not available, falling back to SQLite');
    
    // Fallback to SQLite
    const { default: initSqlJs } = await import('sql.js');
    const SQL = await initSqlJs();
    
    dbProvider = 'sqlite';
    return { provider: 'sqlite', SQL };
  }
};

export const getDatabaseProvider = () => dbProvider;
