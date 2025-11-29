import express from 'express';
import cors from 'cors';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'farming_platform',
  user: 'postgres',
  password: '31330',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize database
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    try {
      // Check if users table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'users'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.log('Creating tables and seeding data...');
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'src', 'data', 'schema-postgresql.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
          if (statement.trim()) {
            await client.query(statement.trim());
          }
        }
        
        // Read and execute seed data
        const seedPath = path.join(__dirname, 'src', 'data', 'seed-postgresql.sql');
        const seed = fs.readFileSync(seedPath, 'utf8');
        
        const seedStatements = seed.split(';').filter(stmt => stmt.trim());
        for (const statement of seedStatements) {
          if (statement.trim()) {
            await client.query(statement.trim());
          }
        }
        
        console.log('✅ Database initialized with schema and seed data');
      } else {
        console.log('✅ Database tables already exist');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// API Routes

// Query endpoint
app.post('/api/query', async (req, res) => {
  try {
    const { sql, params = [] } = req.body;
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      res.json({ success: true, data: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Run endpoint (INSERT, UPDATE, DELETE)
app.post('/api/run', async (req, res) => {
  try {
    const { sql, params = [] } = req.body;
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      res.json({ 
        success: true, 
        lastInsertId: result.rows[0]?.id || null,
        changes: result.rowCount || 0
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Run error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute endpoint (multiple queries)
app.post('/api/execute', async (req, res) => {
  try {
    const { sql, params = [] } = req.body;
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      res.json({ success: true, data: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Execute error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test connection endpoint
app.get('/api/test', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      res.json({ success: true, message: 'Database connected successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Database initialization skipped - assuming tables already exist');
  console.log('💡 If tables don\'t exist, create them manually in PostgreSQL');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
