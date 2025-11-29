import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'farming_platform',
  user: 'postgres',
  password: '31330',
});

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log('✅ Connection successful:', result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
