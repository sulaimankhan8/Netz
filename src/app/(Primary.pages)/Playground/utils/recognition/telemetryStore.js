/**
 * NETZ On-Device Telemetry & Correction Dataset Store
 *
 * Implements Section 75/76/101 of the Master Blueprint:
 * Captures user corrections and stroke data on-device in IndexedDB.
 *
 * Privacy Principle: 100% on-device by default.
 * No user ink is sent to remote servers without explicit opt-in.
 */

const DB_NAME = 'netz_telemetry_db';
const DB_VERSION = 1;
const STORE_NAME = 'corrections';

function openTelemetryDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return resolve(null);
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('assignedType', 'assignedType', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Saves a user recognition correction to local IndexedDB.
 *
 * @param {{
 *   sourceStrokeIds: Array<string>,
 *   strokes: Array<Array<Object>>,
 *   predictedValue: string,
 *   userCorrectedValue: string,
 *   assignedType: 'TEXT'|'NUMBER'|'MATH'|'OBJECT'|'EQUATION',
 *   confidence: Object,
 *   modelVersion?: string
 * }} correctionRecord
 * @returns {Promise<string>} Record ID
 */
export async function recordUserCorrection(correctionRecord) {
  const db = await openTelemetryDB();
  if (!db) return null;

  const id = `corr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const record = {
    id,
    timestamp: Date.now(),
    sourceStrokeIds: correctionRecord.sourceStrokeIds || [],
    strokes: correctionRecord.strokes || [],
    predictedValue: correctionRecord.predictedValue || '',
    userCorrectedValue: correctionRecord.userCorrectedValue || '',
    assignedType: correctionRecord.assignedType || 'MATH',
    confidence: correctionRecord.confidence || {},
    modelVersion: correctionRecord.modelVersion || 'v1.0.0',
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(record);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves all stored user corrections (for dataset export or analytics).
 *
 * @returns {Promise<Array<Object>>}
 */
export async function getAllCorrections() {
  const db = await openTelemetryDB();
  if (!db) return [];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Exports corrections as a JSONL string matching router_data.jsonl format.
 *
 * @returns {Promise<string>}
 */
export async function exportCorrectionsAsJSONL() {
  const list = await getAllCorrections();
  return list
    .map((item) =>
      JSON.stringify({
        strokes: item.strokes,
        label: item.assignedType,
        text: item.userCorrectedValue,
        pred: item.predictedValue,
        timestamp: item.timestamp,
      })
    )
    .join('\n');
}
