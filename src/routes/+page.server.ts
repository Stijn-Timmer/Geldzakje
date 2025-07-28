import { prisma } from '$lib/server/prisma/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import logger from '$lib/server/logger';
import { superValidate } from 'sveltekit-superforms';
import { transactionSchema } from './components/form/schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { randomUUID } from 'node:crypto';
import storage from '$lib/server/s3';

/**
 * Server-side data loading voor de hoofdpagina
 * Haalt alle transacties op en initialiseert het transaction form
 */
export const load: PageServerLoad = async () => {
	try {
		// Haal alle transacties op, gesorteerd op datum (nieuwste eerst)
		const transactions = await prisma.transaction.findMany({
			orderBy: { createdAt: 'desc' }
		});

		return {
			// Superforms: validatie schema voor nieuwe transacties
			form: await superValidate(zod4(transactionSchema)),
			transactions
		};
	} catch (err) {
		logger.error(err);
		throw error(500, 'Kan transactiegegevens niet laden. Probeer het later opnieuw.');
	}
};

export const actions = {
	default: async ({ request }) => {
		try {
			// Verwerk het formulier met de transactie data
			const form = await superValidate(request, zod4(transactionSchema));

			if (!form.valid) {
				return { form };
			}

			let invoiceId: string | undefined = undefined;

			// Sla de factuur op in Google Cloud Storage als er een bestand is geüpload
            if (form.data.invoiceFile) {
                invoiceId = randomUUID();
                const fileName = `invoices/${invoiceId}.pdf`;
                const file = form.data.invoiceFile;
                const bucket = storage.bucket('geldzakje');
                const blob = bucket.file(fileName);
                const stream = blob.createWriteStream({
                    contentType: file.type,
                    resumable: false
                });

                stream.on('error', (err) => {
                    logger.error('Error uploading invoice file:', err);
                    throw new Error('Fout bij uploaden van factuurbestand', { cause: err });
                });
                stream.on('finish', () => {
                    logger.info(`Factuur bestand succesvol geüpload: ${fileName}`);
                });

                // Read the file as an ArrayBuffer and then convert to a Buffer
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                stream.end(buffer); // Pass the Buffer to the stream
            }

			// Sla de nieuwe transactie op in de database
			await prisma.transaction.create({
				data: {
					type: form.data.type,
					amount: form.data.amount,
					description: form.data.description,
					createdAt: form.data.date,
					invoiceId
				}
			});

			return { success: true }
		} catch(err) {
			logger.error(err);
			return {
				form: await superValidate(request, zod4(transactionSchema)),
				error: 'Er is een fout opgetreden bij het opslaan van de transactie. Probeer het opnieuw.'
			};
	}
}
}