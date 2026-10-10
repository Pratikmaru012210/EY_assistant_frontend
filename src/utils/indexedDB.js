/**
 * IndexedDB helper for storing and retrieving:
 * 1. The raw Excel file (Blob / File)
 * 2. The parsed JSON data
 * 3. File metadata (fileName, rowCount, columns, uploadedAt)
 */

const DB_NAME = 'RetailAnalyticsDB';
const DB_VERSION = 1;
const STORE_NAME = 'sheetStorage';
const DATA_KEY = 'activeSheet';

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported by this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

/**
 * Save active spreadsheet, json, and metadata into browser IndexedDB
 */
export const saveSheetToIndexedDB = async ({ fileBlob, jsonData, fileName, rowCount, columns }) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        fileBlob, // Raw Excel binary File or Blob
        jsonData, // Array of parsed row objects
        fileName,
        rowCount,
        columns,
        savedAt: new Date().toISOString()
      };

      const putRequest = store.put(record, DATA_KEY);

      putRequest.onsuccess = () => resolve(true);
      putRequest.onerror = (err) => reject(err);
    });
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error);
    throw error;
  }
};

/**
 * Get active spreadsheet and metadata from browser IndexedDB
 */
export const getSheetFromIndexedDB = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(DATA_KEY);

      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      getRequest.onerror = (err) => reject(err);
    });
  } catch (error) {
    console.error('Failed to get from IndexedDB:', error);
    return null;
  }
};

/**
 * Clear spreadsheet and json data from browser IndexedDB
 */
export const clearSheetFromIndexedDB = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delRequest = store.delete(DATA_KEY);

      delRequest.onsuccess = () => resolve(true);
      delRequest.onerror = (err) => reject(err);
    });
  } catch (error) {
    console.error('Failed to clear IndexedDB:', error);
    throw error;
  }
};
