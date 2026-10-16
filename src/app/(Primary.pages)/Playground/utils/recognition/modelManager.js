/**
 * NETZ Model Manager
 *
 * Manages ONNX Runtime Web sessions with:
 * - Local Cache Storage caching to avoid multi-MB redownloads.
 * - Hardware acceleration hierarchy: WebGPU (preferred) -> WASM SIMD (fallback).
 * - Lazy model loading (Router on startup, HTR / HMER on demand).
 * - Safe memory cleanup and session reuse.
 */

import * as ort from 'onnxruntime-web';

if (typeof ort !== 'undefined' && ort?.env) {
  ort.env.logLevel = 'error';
  if (ort.env.wasm) {
    ort.env.wasm.numThreads = 1; // Single-threaded WASM avoids SharedArrayBuffer / worker thread hangs on standard HTTP
    if (typeof window !== 'undefined' && window?.location?.origin) {
      ort.env.wasm.wasmPaths = `${window.location.origin}/onnx/`;
    }
  }
}

const CACHE_NAME = 'netz-models-cache-v1';

export const MODEL_PATHS = {
  ROUTER: '/models/netz_router.onnx',
  ROUTER_META: '/models/netz_router_meta.json',
  HTR: '/models/netz_htr.onnx',
  HTR_META: '/models/netz_htr_meta.json',
  HTR_VOCAB: '/models/netz_htr_vocab.json',
  HMER: '/models/netz_hmer.onnx',
  HMER_META: '/models/netz_hmer_meta.json',
  HMER_VOCAB: '/models/netz_hmer_vocab.json',
};

class ModelManager {
  constructor() {
    this.sessions = {
      router: null,
      htr: null,
      hmer: null,
    };
    this.metadata = {
      router: null,
      htr: null,
      hmer: null,
    };
    this.vocabs = {
      htr: null,
      hmer: null,
    };
    this.activeExecutionProvider = 'wasm';
    this.statusListeners = new Set();
    this.currentStatus = {
      isLoading: false,
      state: 'idle', // 'idle' | 'loading' | 'ready' | 'failed' | 'needs-consent'
      modelName: '',
      message: '',
      progress: null, // { loaded, total } in bytes while a model file downloads
    };
    // With the browser's data saver on, the large models wait for a yes (acceptLargeDownloads)
    this.allowLargeDownloads = !(typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData);
    this.lastFailed = null; // the loader Retry runs again
  }

  /** Runs the load that failed (or waited for consent) again; resolves either way. */
  retry() {
    const loader = this.lastFailed;
    this.lastFailed = null;
    if (loader === 'router') return this.loadRouter().catch(() => {});
    if (loader === 'htr') return this.loadHTR().catch(() => {});
    if (loader === 'hmer') return this.loadHMER().catch(() => {});
    return Promise.resolve();
  }

  /** Data saver on: yes to the large downloads, and start the one that was waiting. */
  acceptLargeDownloads() {
    this.allowLargeDownloads = true;
    return this.retry();
  }

  /** Data saver on: not now. The prompt goes away; the next attempt asks again. */
  declineLargeDownloads() {
    this.lastFailed = null;
    this.notifyStatus({ isLoading: false, state: 'idle', message: '', progress: null });
  }

  async isCached(url) {
    if (typeof caches === 'undefined') return false;
    try {
      const cache = await caches.open(CACHE_NAME);
      return Boolean(await cache.match(url));
    } catch {
      return false;
    }
  }

  /** With data saver on, a large model that is not downloaded yet waits for a yes. */
  async checkLargeDownload(loaderName, url) {
    if (this.allowLargeDownloads || (await this.isCached(url))) return;
    this.lastFailed = loaderName;
    this.notifyStatus({ isLoading: false, state: 'needs-consent', modelName: loaderName, message: '', progress: null });
    throw new Error('download-declined');
  }

  /** Download progress for the status pill, at most about four times a second. */
  progressReporter(modelName) {
    let last = 0;
    return (loaded, total) => {
      const now = Date.now();
      if (now - last < 250 && loaded !== total) return;
      last = now;
      this.notifyStatus({ isLoading: true, state: 'loading', modelName, progress: { loaded, total } });
    };
  }

  /**
   * Subscribes to model loading status updates for the UI loader pill.
   *
   * @param {Function} listener
   * @returns {Function} Unsubscribe function
   */
  onStatusChange(listener) {
    this.statusListeners.add(listener);
    try {
      listener(this.currentStatus);
    } catch {}
    return () => this.statusListeners.delete(listener);
  }

  /**
   * Broadcasts status changes to all subscribers.
   */
  notifyStatus(status) {
    this.currentStatus = { ...this.currentStatus, ...status };
    this.statusListeners.forEach((fn) => {
      try {
        fn(this.currentStatus);
      } catch {}
    });
  }

  /**
   * Fetches an asset through the Cache Storage API if available, falling back to direct fetch.
   *
   * @param {string} url
   * @param {'arrayBuffer'|'json'} [responseType='arrayBuffer']
   * @returns {Promise<ArrayBuffer|Object>}
   */
  async fetchWithCache(url, responseType = 'arrayBuffer', onBytes = null) {
    let resolvedUrl = url;
    if (typeof window === 'undefined' && !url.startsWith('http')) {
      resolvedUrl = `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
    }

    let cache = null;
    if (typeof caches !== 'undefined') {
      try {
        cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(resolvedUrl);
        if (cachedResponse) {
          return responseType === 'json' ? cachedResponse.json() : cachedResponse.arrayBuffer();
        }
      } catch (err) {
        console.warn('[ModelManager] Cache API match failed, fetching directly:', err);
      }
    }

    const res = await fetch(resolvedUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch model asset: ${resolvedUrl} (status: ${res.status})`);
    }

    const streaming = Boolean(onBytes && responseType !== 'json' && res.body && typeof res.body.getReader === 'function');
    if (cache) {
      // While streaming, the cache copy fills alongside this read (awaiting it first would
      // download the whole file before any progress could be shown)
      const putting = cache.put(url, res.clone()).catch((err) => {
        console.warn('[ModelManager] Cache put error:', err);
      });
      if (!streaming) await putting;
    }

    if (streaming) {
      const total = Number(res.headers.get('Content-Length')) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        onBytes(loaded, total);
      }
      const out = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return out.buffer;
    }

    return responseType === 'json' ? res.json() : res.arrayBuffer();
  }

  /**
   * Creates an ONNX InferenceSession using WASM SIMD.
   * Uses basic graph optimization to prevent compilation stalls.
   * Uses modelBuffer.slice(0) to avoid detaching source buffer.
   *
   * @param {ArrayBuffer} modelBuffer
   * @returns {Promise<{ session: ort.InferenceSession, provider: string }>}
   */
  async createSession(modelBuffer) {
    const sessionOptions = {
      graphOptimizationLevel: 'basic',
      logSeverityLevel: 4, // 4 = Fatal only
    };

    // Primary: WebAssembly SIMD session (instant startup, sub-100ms inference)
    try {
      const session = await ort.InferenceSession.create(modelBuffer.slice(0), {
        ...sessionOptions,
        executionProviders: ['wasm'],
      });
      return { session, provider: 'wasm' };
    } catch (wasmErr) {
      console.warn('[ModelManager] WASM initialization failed, trying default provider:', wasmErr);
      const session = await ort.InferenceSession.create(modelBuffer.slice(0), sessionOptions);
      return { session, provider: 'cpu' };
    }
  }

  /**
   * Loads the Router model and metadata.
   */
  async loadRouter() {
    if (this.sessions.router) return this.sessions.router;

    this.notifyStatus({
      isLoading: true,
      state: 'loading',
      modelName: 'router',
      message: '',
      progress: null,
    });

    try {
      const [buffer, meta] = await Promise.all([
        this.fetchWithCache(MODEL_PATHS.ROUTER, 'arrayBuffer'),
        this.fetchWithCache(MODEL_PATHS.ROUTER_META, 'json'),
      ]);

      const { session, provider } = await this.createSession(buffer);
      this.sessions.router = session;
      this.metadata.router = meta;
      this.activeExecutionProvider = provider;

      this.notifyStatus({
        isLoading: false,
        state: 'ready',
        modelName: 'router',
        message: '',
        progress: null,
      });

      return session;
    } catch (err) {
      this.lastFailed = 'router';
      this.notifyStatus({
        isLoading: false,
        state: 'failed',
        modelName: 'router',
        message: String((err && err.message) || err),
        progress: null,
      });
      throw err;
    }
  }

  /**
   * Loads the HTR model, metadata, and character vocabulary.
   */
  async loadHTR() {
    if (this.sessions.htr) return this.sessions.htr;
    await this.checkLargeDownload('htr', MODEL_PATHS.HTR);

    this.notifyStatus({
      isLoading: true,
      state: 'loading',
      modelName: 'htr',
      message: '',
      progress: null,
    });

    try {
      const [buffer, meta, vocab] = await Promise.all([
        this.fetchWithCache(MODEL_PATHS.HTR, 'arrayBuffer', this.progressReporter('htr')),
        this.fetchWithCache(MODEL_PATHS.HTR_META, 'json'),
        this.fetchWithCache(MODEL_PATHS.HTR_VOCAB, 'json'),
      ]);

      const { session, provider } = await this.createSession(buffer);
      this.sessions.htr = session;
      this.metadata.htr = meta;
      this.vocabs.htr = vocab;
      this.activeExecutionProvider = provider;

      this.notifyStatus({
        isLoading: false,
        state: 'ready',
        modelName: 'htr',
        message: '',
        progress: null,
      });

      return session;
    } catch (err) {
      this.lastFailed = 'htr';
      this.notifyStatus({
        isLoading: false,
        state: 'failed',
        modelName: 'htr',
        message: String((err && err.message) || err),
        progress: null,
      });
      throw err;
    }
  }

  /**
   * Loads the HMER model, metadata, and LaTeX token vocabulary.
   */
  async loadHMER() {
    if (this.sessions.hmer) return this.sessions.hmer;
    await this.checkLargeDownload('hmer', MODEL_PATHS.HMER);

    this.notifyStatus({
      isLoading: true,
      state: 'loading',
      modelName: 'hmer',
      message: '',
      progress: null,
    });

    try {
      const [buffer, meta, vocab] = await Promise.all([
        this.fetchWithCache(MODEL_PATHS.HMER, 'arrayBuffer', this.progressReporter('hmer')),
        this.fetchWithCache(MODEL_PATHS.HMER_META, 'json'),
        this.fetchWithCache(MODEL_PATHS.HMER_VOCAB, 'json'),
      ]);

      const { session, provider } = await this.createSession(buffer);
      this.sessions.hmer = session;
      this.metadata.hmer = meta;
      this.vocabs.hmer = vocab;
      this.activeExecutionProvider = provider;

      this.notifyStatus({
        isLoading: false,
        state: 'ready',
        modelName: 'hmer',
        message: '',
        progress: null,
      });

      return session;
    } catch (err) {
      this.lastFailed = 'hmer';
      this.notifyStatus({
        isLoading: false,
        state: 'failed',
        modelName: 'hmer',
        message: String((err && err.message) || err),
        progress: null,
      });
      throw err;
    }
  }

  /**
   * Preloads all models in the background without blocking the UI thread.
   */
  async preloadAll() {
    try {
      await this.loadRouter();
      // Lazy background load secondary models
      setTimeout(async () => {
        try {
          await this.loadHMER();
          await this.loadHTR();
        } catch {}
      }, 500);
    } catch {}
  }
}

export const modelManager = new ModelManager();
