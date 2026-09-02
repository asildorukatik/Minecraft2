
(function (root) {
  'use strict';

  // v0.14 adds a world catalogue while retaining the original single-save key as
  // a compatibility mirror of the currently selected world.
  const SAVE_KEY = 'dorukcraft-unengined-save-v01';
  const INDEX_KEY = 'dorukcraft-world-index-v014';
  const ACTIVE_KEY = 'dorukcraft-active-world-v014';
  const WORLD_PREFIX = 'dorukcraft-world-v014-';
  const DATABASE_NAME = 'dorukcraft-unengined-storage';
  const DATABASE_VERSION = 1;
  const STORE_NAME = 'saves';
  const LEGACY_WORLD_RECORD_KEY = 'world-v01';
  const DB_WORLD_PREFIX = 'world-v014-';

  let databasePromise = null;
  let operationQueue = Promise.resolve();
  let readyPromise = null;
  const lastWorldJSON = new Map();
  let nativeReply = null;
  let pendingNativeReply;

  const makeId = () => root.crypto?.randomUUID?.() || `world-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

  function warn(message, error) {
    if (root.console && typeof root.console.warn === 'function') root.console.warn(message, error || '');
  }

  function storage() {
    try { return root.localStorage || null; }
    catch (error) { warn('Persistent browser storage is unavailable.', error); return null; }
  }

  function parseJSON(text, fallback) {
    try { const value = JSON.parse(text); return value == null ? fallback : value; }
    catch { return fallback; }
  }

  function readIndex() {
    const store = storage();
    if (!store) return [];
    const raw = parseJSON(store.getItem(INDEX_KEY) || '[]', []);
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    return raw.filter(row => {
      if (!row || typeof row !== 'object' || typeof row.id !== 'string' || !row.id || seen.has(row.id)) return false;
      seen.add(row.id); return true;
    }).map(row => ({
      id: row.id,
      name: String(row.name || 'My World').slice(0, 32),
      worldType: ['flat', 'infinite'].includes(row.worldType) ? row.worldType : 'classic',
      mode: row.mode === 'survival' ? 'survival' : 'creative',
      difficulty: String(row.difficulty || 'normal'),
      seed: Number(row.seed) || 0,
      createdAt: Math.max(0, Number(row.createdAt) || Number(row.savedAt) || 0),
      savedAt: Math.max(0, Number(row.savedAt) || 0)
    })).sort((a, b) => (b.savedAt - a.savedAt) || (b.createdAt - a.createdAt));
  }

  function writeIndex(index) {
    try { storage()?.setItem(INDEX_KEY, JSON.stringify(index)); return true; }
    catch (error) { warn('The DorukCraft world list could not be written.', error); return false; }
  }

  function activeWorldId() {
    try {
      const requested = storage()?.getItem(ACTIVE_KEY) || '';
      const index = readIndex();
      if (requested && index.some(row => row.id === requested)) return requested;
      return index[0]?.id || null;
    } catch { return null; }
  }

  function setActiveWorldId(id) {
    try {
      if (id) storage()?.setItem(ACTIVE_KEY, String(id));
      else storage()?.removeItem(ACTIVE_KEY);
    } catch (error) { warn('The active-world selection could not be stored.', error); }
  }

  function localKey(id) { return `${WORLD_PREFIX}${id}`; }
  function dbKey(id) { return `${DB_WORLD_PREFIX}${id}`; }

  function readLocalWorld(id) {
    if (!id) return null;
    try { return storage()?.getItem(localKey(id)) || lastWorldJSON.get(id) || null; }
    catch (error) { warn('The local DorukCraft save could not be read.', error); return lastWorldJSON.get(id) || null; }
  }

  function writeLocalWorld(id, json) {
    if (!id) return false;
    try { storage()?.setItem(localKey(id), json); lastWorldJSON.set(id, json); return true; }
    catch (error) { lastWorldJSON.set(id, json); warn('The local DorukCraft save could not be written.', error); return false; }
  }

  function deleteLocalWorld(id) {
    if (!id) return;
    lastWorldJSON.delete(id);
    try { storage()?.removeItem(localKey(id)); }
    catch (error) { warn('The local DorukCraft save could not be removed.', error); }
  }

  function mirrorLegacy(json) {
    try {
      if (typeof json === 'string') storage()?.setItem(SAVE_KEY, json);
      else storage()?.removeItem(SAVE_KEY);
    } catch (error) { warn('The legacy compatibility save could not be updated.', error); }
  }

  function validCandidate(json, source, priority) {
    if (typeof json !== 'string' || json.length < 2) return null;
    try {
      const data = JSON.parse(json);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
      if (!Number.isFinite(Number(data.seed)) || !data.worldType) return null;
      return { json, source, priority, savedAt: Math.max(0, Number(data.savedAt) || 0) };
    } catch (_) { return null; }
  }

  function selectNewest(candidates) {
    return candidates.filter(Boolean).sort((a, b) => (b.savedAt - a.savedAt) || (b.priority - a.priority))[0] || null;
  }

  function metadataFromJSON(json, id, previous = {}) {
    let data = {};
    try { data = JSON.parse(json) || {}; } catch {}
    return {
      id,
      name: String(data.name || previous.name || 'My World').slice(0, 32),
      worldType: ['flat', 'infinite'].includes(data.worldType || previous.worldType) ? (data.worldType || previous.worldType) : 'classic',
      mode: (data.mode || previous.mode) === 'survival' ? 'survival' : 'creative',
      difficulty: String(data.difficulty || previous.difficulty || 'normal'),
      seed: Number(data.seed ?? previous.seed) || 0,
      createdAt: Math.max(0, Number(previous.createdAt) || Number(data.createdAt) || Date.now()),
      savedAt: Math.max(0, Number(data.savedAt) || Date.now())
    };
  }

  function upsertMetadata(meta) {
    const index = readIndex();
    const at = index.findIndex(row => row.id === meta.id);
    if (at >= 0) index[at] = { ...index[at], ...meta };
    else index.push(meta);
    index.sort((a, b) => (b.savedAt - a.savedAt) || (b.createdAt - a.createdAt));
    writeIndex(index);
    return meta;
  }

  function createWorldSlot(meta = {}) {
    const id = String(meta.id || makeId());
    const now = Date.now();
    upsertMetadata({
      id,
      name: String(meta.name || 'My World').slice(0, 32),
      worldType: ['flat', 'infinite'].includes(meta.worldType) ? meta.worldType : 'classic',
      mode: meta.mode === 'survival' ? 'survival' : 'creative',
      difficulty: String(meta.difficulty || 'normal'),
      seed: Number(meta.seed) || 0,
      createdAt: Number(meta.createdAt) || now,
      savedAt: Number(meta.savedAt) || now
    });
    setActiveWorldId(id);
    mirrorLegacy(null);
    return id;
  }

  function listWorldsSync() { return readIndex(); }
  function getActiveWorldId() { return activeWorldId(); }

  function openDatabase() {
    if (databasePromise) return databasePromise;
    if (!root.indexedDB) return Promise.reject(new Error('IndexedDB is unavailable'));
    databasePromise = new Promise((resolve, reject) => {
      const request = root.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
      request.onblocked = () => reject(new Error('IndexedDB upgrade was blocked'));
    });
    return databasePromise;
  }

  async function readIndexedKey(key) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : null);
      request.onerror = () => reject(request.error || new Error('IndexedDB read failed'));
    });
  }

  async function writeIndexedKey(key, json) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(json, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB write failed'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB write was aborted'));
    });
  }

  async function deleteIndexedKey(key) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB delete failed'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB delete was aborted'));
    });
  }

  function enqueue(operation) {
    const next = operationQueue.catch(() => undefined).then(operation);
    operationQueue = next.catch(error => warn('DorukCraft backup storage failed.', error));
    return next;
  }

  function nativePost(type, payload) {
    try { root.DorukCraftNative?.post?.(type, payload || {}); return !!root.DorukCraftNative; }
    catch (error) { warn('The native DorukCraft save bridge failed.', error); return false; }
  }

  function requestNativeWorld() {
    if (!root.DorukCraftNative) return Promise.resolve(null);
    if (pendingNativeReply !== undefined) { const value = pendingNativeReply; pendingNativeReply = undefined; return Promise.resolve(value); }
    return new Promise(resolve => {
      let settled = false;
      const finish = value => { if (settled) return; settled = true; nativeReply = null; resolve(typeof value === 'string' ? value : null); };
      nativeReply = finish;
      nativePost('loadWorldSave');
      root.setTimeout(() => finish(null), 1500);
    });
  }

  function receiveNativeWorld(json) {
    const value = typeof json === 'string' ? json : null;
    if (nativeReply) nativeReply(value); else pendingNativeReply = value;
  }

  function migrateLegacySlot() {
    if (readIndex().length) return activeWorldId();
    let legacy = null;
    try { legacy = storage()?.getItem(SAVE_KEY) || null; } catch {}
    const candidate = validCandidate(legacy, 'legacy-localStorage', 3);
    if (!candidate) return null;
    const id = makeId();
    const meta = metadataFromJSON(candidate.json, id, { createdAt: candidate.savedAt || Date.now() });
    upsertMetadata(meta); setActiveWorldId(id); writeLocalWorld(id, candidate.json); mirrorLegacy(candidate.json);
    return id;
  }

  async function restoreActiveWorld() {
    let id = migrateLegacySlot() || activeWorldId();

    // If only the old IndexedDB record exists, migrate it too.
    if (!id) {
      const oldIndexed = await readIndexedKey(LEGACY_WORLD_RECORD_KEY).catch(() => null);
      const candidate = validCandidate(oldIndexed, 'legacy-indexedDB', 1);
      if (candidate) {
        id = createWorldSlot(metadataFromJSON(candidate.json, makeId(), { createdAt: candidate.savedAt || Date.now() }));
        writeLocalWorld(id, candidate.json);
      }
    }
    if (!id) return false;

    const localJSON = readLocalWorld(id);
    const [indexedJSON, nativeJSON] = await Promise.all([
      readIndexedKey(dbKey(id)).catch(error => { warn('The IndexedDB DorukCraft save could not be read.', error); return null; }),
      requestNativeWorld()
    ]);
    const newest = selectNewest([
      validCandidate(localJSON, 'localStorage', 3),
      validCandidate(nativeJSON, 'native', 2),
      validCandidate(indexedJSON, 'indexedDB', 1)
    ]);
    if (!newest) return false;

    lastWorldJSON.set(id, newest.json);
    if (localJSON !== newest.json) writeLocalWorld(id, newest.json);
    if (root.indexedDB && indexedJSON !== newest.json) enqueue(() => writeIndexedKey(dbKey(id), newest.json));
    upsertMetadata(metadataFromJSON(newest.json, id, readIndex().find(row => row.id === id)));
    setActiveWorldId(id); mirrorLegacy(newest.json);
    if (root.DorukCraftNative && nativeJSON !== newest.json) nativePost('saveWorld', { json: newest.json });
    return true;
  }

  function ready() {
    if (!readyPromise) readyPromise = restoreActiveWorld();
    return readyPromise;
  }

  function selectWorld(id) {
    const row = readIndex().find(item => item.id === id);
    if (!row) return false;
    setActiveWorldId(id);
    const json = readLocalWorld(id);
    mirrorLegacy(json);
    if (json) nativePost('saveWorld', { json });
    return true;
  }

  async function prepareWorld(id) {
    const row = readIndex().find(item => item.id === id);
    if (!row) return false;
    setActiveWorldId(id);
    const localJSON = readLocalWorld(id);
    const indexedJSON = root.indexedDB ? await readIndexedKey(dbKey(id)).catch(error => { warn('The selected IndexedDB world could not be read.', error); return null; }) : null;
    const newest = selectNewest([
      validCandidate(localJSON, 'localStorage', 2),
      validCandidate(indexedJSON, 'indexedDB', 1)
    ]);
    if (!newest) { mirrorLegacy(null); return false; }
    lastWorldJSON.set(id, newest.json);
    if (localJSON !== newest.json) writeLocalWorld(id, newest.json);
    mirrorLegacy(newest.json);
    nativePost('saveWorld', { json: newest.json });
    upsertMetadata(metadataFromJSON(newest.json, id, row));
    return true;
  }

  function writeWorld(json, requestedId) {
    const candidate = validCandidate(json, 'current', 4);
    if (!candidate) { warn('DorukCraft refused to store invalid world data.'); return false; }
    let id = requestedId || activeWorldId();
    if (!id) id = createWorldSlot(metadataFromJSON(json, makeId()));
    const existing = readIndex().find(row => row.id === id) || {};
    upsertMetadata(metadataFromJSON(json, id, existing));
    setActiveWorldId(id);
    const localWritten = writeLocalWorld(id, json);
    mirrorLegacy(json);
    if (root.indexedDB) enqueue(() => writeIndexedKey(dbKey(id), json));
    const nativeWritten = nativePost('saveWorld', { json });
    return localWritten || nativeWritten || !!root.indexedDB;
  }

  function deleteWorld(requestedId) {
    const id = requestedId || activeWorldId();
    if (!id) return;
    deleteLocalWorld(id);
    if (root.indexedDB) enqueue(() => deleteIndexedKey(dbKey(id)));
    const index = readIndex().filter(row => row.id !== id);
    writeIndex(index);
    const next = index[0]?.id || null;
    setActiveWorldId(next);
    const nextJSON = next ? readLocalWorld(next) : null;
    mirrorLegacy(nextJSON);
    if (nextJSON) nativePost('saveWorld', { json: nextJSON }); else nativePost('deleteWorldSave');
  }

  function getWorldSync(requestedId) {
    const id = requestedId || activeWorldId();
    return id ? (readLocalWorld(id) || lastWorldJSON.get(id) || null) : null;
  }

  const api = Object.freeze({
    ready,
    writeWorld,
    deleteWorld,
    getWorldSync,
    receiveNativeWorld,
    createWorldSlot,
    listWorldsSync,
    selectWorld,
    prepareWorld,
    getActiveWorldId,
    flush: () => operationQueue,
    _selectNewest: selectNewest,
    _validCandidate: validCandidate,
    _metadataFromJSON: metadataFromJSON
  });

  root.DorukCraftPersistence = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

