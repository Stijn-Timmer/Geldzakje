import pino from 'pino';

/**
 * Geconfigureerde Pino logger instance voor server-side logging
 * 
 * Gebruikt voor het loggen van server events, errors en debugging informatie.
 * Level is standaard ingesteld op 'info' voor productie gebruik.
 */
const logger = pino({
	level: 'info'
});

export default logger;
