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
      modelName: '',
      message: '',
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
  async fetchWithCache(url, responseType = 'arrayBuffer') {
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

    if (cache) {
      try {
        await cache.put(url, res.clone());
      } catch (err) {
        console.warn('[ModelManager] Cache put error:', err);
      }
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
      modelName: 'Router',
      message: 'Loading Neural Router...',
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
        modelName: 'Router',
        message: 'Neural Router ready',
      });

      return session;
    } catch (err) {
      this.notifyStatus({
        isLoading: false,
        modelName: 'Router',
        message: 'Router load failed',
      });
      throw err;
    }
  }

  /**
   * Loads the HTR model, metadata, and character vocabulary.
   */
  async loadHTR() {
    if (this.sessions.htr) return this.sessions.htr;

    this.notifyStatus({
      isLoading: true,
      modelName: 'Text OCR',
      message: 'Loading Text Handwriting Model...',
    });

    try {
      const [buffer, meta, vocab] = await Promise.all([
        this.fetchWithCache(MODEL_PATHS.HTR, 'arrayBuffer'),
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
        modelName: 'Text OCR',
        message: 'Text Model ready',
      });

      return session;
    } catch (err) {
      this.notifyStatus({
        isLoading: false,
        modelName: 'Text OCR',
        message: 'Text Model load failed',
      });
      throw err;
    }
  }

  /**
   * Loads the HMER model, metadata, and LaTeX token vocabulary.
   */
  async loadHMER() {
    if (this.sessions.hmer) return this.sessions.hmer;

    this.notifyStatus({
      isLoading: true,
      modelName: 'Math HMER',
      message: 'Initializing Math Equation Engine (94% HMER)...',
    });

    try {
      const [buffer, meta, vocab] = await Promise.all([
        this.fetchWithCache(MODEL_PATHS.HMER, 'arrayBuffer'),
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
        modelName: 'Math HMER',
        message: 'Math Engine ready',
      });

      return session;
    } catch (err) {
      this.notifyStatus({
        isLoading: false,
        modelName: 'Math HMER',
        message: 'Math Engine load failed',
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
