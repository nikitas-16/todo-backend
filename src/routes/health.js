import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

/**
 * GET /health-check
 * Health check endpoint that verifies server and database connectivity
 * Returns 200 if healthy, 503 if database is unreachable
 */
router.get('/', async (req, res) => {
  const timestamp = new Date().toISOString();

  try {
    // Ping the database to verify connection
    await pool.query('SELECT 1');

    return res.status(200).json({
      status: 'UP',
      database: 'connected',
      timestamp,
    });
  } catch (error) {
    console.error('❌ Health check failed:', error.message);

    return res.status(503).json({
      status: 'DOWN',
      database: 'disconnected',
      timestamp,
    });
  }
});

export default router;
