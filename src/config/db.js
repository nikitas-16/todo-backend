import pg from 'pg';
import config from './index.js';

const { Pool } = pg;

// Create a PostgreSQL connection pool
const poolConfig = {
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  database: config.db.database,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
};

// Only add password if it's not empty
if (config.db.password) {
  poolConfig.password = config.db.password;
}

const pool = new Pool(poolConfig);

// Event listeners for pool
pool.on('connect', () => {
  console.log('✅ New client connected to the database pool');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

export default pool;
