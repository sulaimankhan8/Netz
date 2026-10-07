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
    this.activeExecutionProvider = 'unknown'; // 'webgpu' | 'wasm' | 'cpu'
  }

  /**
   * Fetches an asset through the Cache Storage API if available, falling back to direct fetch.
   *
   * @param {string} url
   * @param {'arrayBuffer'|'json'} [responseType='arrayBuffer']
   * @returns {Promise<ArrayBuffer|Object>}
   */
  async fetchWithCache(url, responseType = 'arrayBuffer') {
    let cache = null;
    if (typeof caches !== 'undefined') {
      try {
        cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
          return responseType === 'json' ? cachedResponse.json() : cachedResponse.arrayBuffer();
        }
      } catch (err) {
        console.warn('[ModelManager] Cache API match failed, fetching directly:', err);
      }
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch model asset: ${url} (status: ${res.status})`);
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
   * Creates an ONNX InferenceSession trying WebGPU first, then WASM.
   *
   * @param {ArrayBuffer} modelBuffer
   * @returns {Promise<{ session: ort.InferenceSession, provider: string }>}
   */
  async createSession(modelBuffer) {
    const sessionOptions = {
      graphOptimizationLevel: 'all',
      logSeverityLevel: 3, // 3 = Error only, suppresses EP assignment notices
    };

    // Attempt 1: WebGPU
    if (typeof navigator !== 'undefined' && navigator.gpu) {
      try {
        const session = await ort.InferenceSession.create(modelBuffer, {
          ...sessionOptions,
          executionProviders: ['webgpu'],
        });
        return { session, provider: 'webgpu' };
      } catch (webgpuErr) {
        console.warn('[ModelManager] WebGPU initialization failed, falling back to WASM:', webgpuErr);
      }
    }

    // Attempt 2: WASM with SIMD
    try {
      const session = await ort.InferenceSession.create(modelBuffer, {
        ...sessionOptions,
        executionProviders: ['wasm'],
      });
      return { session, provider: 'wasm' };
    } catch (wasmErr) {
      // Attempt 3: Default CPU provider
      console.warn('[ModelManager] WASM initialization failed, trying default provider:', wasmErr);
      const session = await ort.InferenceSession.create(modelBuffer, sessionOptions);
      return { session, provider: 'cpu' };
    }
  }

  /**
   * Loads the Router model and metadata.
   */
  async loadRouter() {
    if (this.sessions.router) return this.sessions.router;

    const [buffer, meta] = await Promise.all([
      this.fetchWithCache(MODEL_PATHS.ROUTER, 'arrayBuffer'),
      this.fetchWithCache(MODEL_PATHS.ROUTER_META, 'json'),
    ]);

    const { session, provider } = await this.createSession(buffer);
    this.sessions.router = session;
    this.metadata.router = meta;
    this.activeExecutionProvider = provider;
    return session;
  }

  /**
   * Loads the HTR model, metadata, and character vocabulary.
   */
  async loadHTR() {
    if (this.sessions.htr) return this.sessions.htr;

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
    return session;
  }

  /**
   * Loads the HMER model, metadata, and LaTeX token vocabulary.
   */
  async loadHMER() {
    if (this.sessions.hmer) return this.sessions.hmer;

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
    return session;
  }

  /**
   * Preloads all models in the background.
   */
  async preloadAll() {
    await Promise.all([this.loadRouter(), this.loadHTR(), this.loadHMER()]);
  }
}

export const modelManager = new ModelManager();
