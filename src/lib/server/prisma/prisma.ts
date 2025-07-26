import { PrismaClient } from './generated/client';
import { dev } from '$app/environment';

/**
 * Prisma Client instantie configuratie
 * 
 * In development wordt een global variable gebruikt om de PrismaClient
 * instance te bewaren tussen hot reloads. Dit voorkomt database 
 * verbindingsproblemen tijdens ontwikkeling.
 * 
 * In productie wordt altijd een nieuwe instance gemaakt.
 */

// Global type declaration voor development hot-reload support
declare global {
	var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (dev) {
	// Development: hergebruik bestaande client of maak nieuwe aan
	if (!globalThis.__prisma) {
		globalThis.__prisma = new PrismaClient();
	}
	prisma = globalThis.__prisma;
} else {
	// Production: altijd nieuwe client instance
	prisma = new PrismaClient();
}

export { prisma };
