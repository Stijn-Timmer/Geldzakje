import storage from "$lib/server/s3";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
    const { invoice_id } = params;

	const fileName = `invoices/${invoice_id}.pdf`;

    const file = storage.bucket('geldzakje').file(fileName);

    const [exists] = await file.exists();

    if (exists) {
        // Genereer tijdelijke signed URL (vervalt na 5 minuten)
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 1000 * 60 * 5 // 5 minuten
        });

        return {
            url
        };
    } else {
        throw error(404, 'Factuur niet gevonden');
    }

};