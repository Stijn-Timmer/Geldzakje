import storage from '$lib/server/s3';
import { json } from '@sveltejs/kit';

/**
 * API endpoint voor het ophalen van factuur documenten uit Google Cloud Storage
 * 
 * Genereert een tijdelijke signed URL voor het downloaden van facturen.
 * De URL vervalt na 5 minuten voor beveiliging.
 * 
 * @param params.invoice_id - Het ID van de factuur
 * @returns JSON met download URL of 404/500 error
 */
export const GET = async ({ params }) => {
	const { invoice_id } = params;

	const fileName = `${invoice_id}.pdf`;

	try {
		const file = storage.bucket('geldzakje_invoices').file(fileName);

		const [exists] = await file.exists();

		if (exists) {
			// Genereer tijdelijke signed URL (vervalt na 5 minuten)
			const [url] = await file.getSignedUrl({
				action: 'read',
				expires: Date.now() + 1000 * 60 * 5 // 5 minuten
			});

			return json({
				url
			});
		} else {
			return new Response(null, { status: 404 });
		}
	} catch (err) {
		console.log(err);
		return new Response('Error communicating with Google Cloud Storage', { status: 500 });
	}
};
