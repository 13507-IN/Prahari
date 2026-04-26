import 'dotenv/config';
import { initConfig } from './config/index.js';
import { initDatabase, closeDatabase } from './db/index.js';
import app from './app.js';

async function main() {
  try {
    initConfig();
    
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized');

    const PORT = process.env.PORT || 3000;
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await closeDatabase();
          console.log('Database connections closed');
        } catch (error) {
          console.error('Error closing database:', error);
        }
        
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();