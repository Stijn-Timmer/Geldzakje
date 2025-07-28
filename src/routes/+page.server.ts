import { prisma } from '$lib/server/prisma/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import logger from '$lib/server/logger';
import { superValidate } from 'sveltekit-superforms';
import { transactionSchema } from './components/form/schema';
import { zod4 } from 'sveltekit-superforms/adapters';

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
