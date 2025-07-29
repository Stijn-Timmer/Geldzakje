import { Storage } from '@google-cloud/storage';

/**
 * Google Cloud Storage client configuratie
 * 
 * Gebruikt voor het uploaden en ophalen van factuur bestanden.
 * Credentials worden geladen vanuit een lokaal JSON bestand.
 * 
 * WAARSCHUWING: In productie zouden credentials via environment variables
 * of service account keys moeten worden geladen voor beveiliging.
 */
const storage = new Storage();

export default storage;
