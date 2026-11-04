import 'dotenv/config';
console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);
console.log("Gemini model:", process.env.GEMINI_MODEL);
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import helmet from 'helmet'
import pool from './config/database.js';
import { initDatabase } from './config/database-init.js';
import dreamsRouter from './routes/dreams.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();


if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}
// Needed for security headers! Do not delete!
// app.use(helmet());

const PORT = process.env.PORT || 3001;
 
// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Application and Database Health Check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'UP',
      application: 'Dream Catcher',
      database: 'CONNECTED',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check failed:', error.message);

    res.status(503).json({
      status: 'DOWN',
      application: 'Dream Catcher',
      database: 'DISCONNECTED',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/shutdown', (req, res) => {
  console.log('=== MANUAL SHUTDOWN TRIGGERED ===');
  res.send('Shutting down...');
  
  setTimeout(() => {
    process.kill(process.pid, 'SIGTERM');
  }, 100);
});



// API Routes
app.use('/api/dreams', dreamsRouter);

process.on('SIGINT', ()=> {
  console.log('Starting graceful shutdown')
})


// Initialize database then start server
try {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

process.on('SIGTERM', gracefulShutdown);

async function gracefulShutdown() {
 console.log('SIGTERM received, shutting down gracefully');
  // Close the server first (stop accepting new connections)
 server.close(() => {
   console.log('HTTP server closed');
 });
  // Then close database pool
 try {
   await pool.end();
   console.log('Database pool closed');
   process.exit(0)
 } catch (error) {
   console.error('Error closing database pool:', error);
   process.exit(1)
 }
}
