import { date, z } from 'zod';

/**
 * Zod validatie schema voor transactie formulieren
 * 
 * Definieert de validatieregels voor nieuwe transacties:
 * - Type: INCOMING of OUTGOING
 * - Bedrag: Minimaal 0
 * - Beschrijving: Maximaal 255 karakters
 * - Datum: Moet in verleden of heden liggen
 * - Factuur: Optioneel PDF bestand
 */
export const transactionSchema = z.object({
	type: z.enum(['INCOMING', 'OUTGOING']),
	amount: z.number().min(0, 'Bedrag moet groter dan of gelijk aan 0 zijn'),
	description: z.string().max(255, 'Omschrijving mag maximaal 255 tekens bevatten'),
	date: date().refine((date) => date <= new Date(), {
		message: 'Datum moet in het verleden liggen of vandaag zijn'
	}),
	invoiceFile: z.file('application/pdf').optional()
});

export type TransactionSchema = typeof transactionSchema;
