import { Server } from 'http';

import app from './app';
import { testBigQueryConnection } from './config/bigquery';
import config from './config/config';
import logger from './config/logger';
import prisma from './config/prisma';

let server: Server;

import alertEmailJob from './schedulers/alertEmailScheduler';

/**
 * Initializes database connections and starts the server
 */
async function initializeServer() {
  try {
    // Connect to SQL Database
    await prisma.$connect();
    logger.info('Successfully connected to SQL Database');

    // Start the server
    server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });

    // Check BigQuery connection
    const bigQueryConnected = await testBigQueryConnection();

    if (bigQueryConnected) {
      logger.info('Successfully connected to BigQuery and verified dataset/table');
    } else {
      logger.error('Failed to connect to BigQuery or verify dataset/table');
    }
  } catch (error) {
    logger.error('Error during server initialization:', error);
    process.exit(1);
  }
}

/**
 * Gracefully shuts down the server
 */
const gracefulShutdown = async () => {
  logger.info('Initiating graceful shutdown');
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      shutdownDatabases();
    });
  } else {
    shutdownDatabases();
  }
};

/**
 * Closes database connections
 */
const shutdownDatabases = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Disconnected from SQL Database');
    process.exit(0);
  } catch (error) {
    logger.error('Error disconnecting from databases:', error);
    process.exit(1);
  }
};

/**
 * Handles unexpected errors
 */
const unexpectedErrorHandler = (error: Error) => {
  logger.error('Unexpected error occurred:', error);
  gracefulShutdown();
};

// Event listeners for application termination
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Initialize the server
initializeServer().catch((error) => {
  logger.error('Failed to initialize server:', error);
  process.exit(1);
});

// Start the alert email scheduler
alertEmailJob.start();

logger.info('Alert email scheduler started');
