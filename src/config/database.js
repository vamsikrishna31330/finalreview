import pg from 'pg';

const { Pool } = pg;

// PostgreSQL connection configuration
export const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'farming_platform',
  user: 'postgres',
  password: '31330',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL connected successfully');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
};
