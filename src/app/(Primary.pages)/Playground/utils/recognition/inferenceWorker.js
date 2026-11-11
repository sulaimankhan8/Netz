/**
 * Runs the recognition models off the main thread (handoff C11), so reading ink never freezes drawing.
 * Infrastructure only: the same ONNX files, the same WebAssembly settings as modelManager.js, and the
 * same input tensors, so the outputs are the same numbers. The page talks to it through
 * WorkerSession in modelManager.js.
 *
 * Messages in:  { id, kind: 'create', key, buffer, options }  |  { id, kind: 'run', key, feeds }
 *               feeds: { inputName: { type, data, dims } }
 * Messages out: { id, ok: true, result? }  |  { id, ok: false, error }
 */
import * as ort from 'onnxruntime-web';

ort.env.logLevel = 'error';
if (ort.env.wasm) {
  // As on the page: one thread (no SharedArrayBuffer needed), runtime files from /onnx/
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.wasmPaths = `${self.location.origin}/onnx/`;
}

const sessions = new Map();

self.onmessage = async (event) => {
  const { id, kind, key } = event.data || {};
  try {
    if (kind === 'create') {
      const session = await ort.InferenceSession.create(event.data.buffer, event.data.options);
      sessions.set(key, session);
      self.postMessage({ id, ok: true });
      return;
    }
    if (kind === 'run') {
      const session = sessions.get(key);
      if (!session) throw new Error(`No model session "${key}" in the worker`);
      const feeds = {};
      for (const [name, t] of Object.entries(event.data.feeds)) feeds[name] = new ort.Tensor(t.type, t.data, t.dims);
      const outputs = await session.run(feeds);
      const result = {};
      const transfer = [];
      for (const [name, t] of Object.entries(outputs)) {
        // A copy the worker owns, so it can be handed over without copying again
        const data = t.data.slice();
        result[name] = { type: t.type, data, dims: [...t.dims] };
        transfer.push(data.buffer);
      }
      self.postMessage({ id, ok: true, result }, transfer);
      return;
    }
    throw new Error(`Unknown request "${kind}"`);
  } catch (err) {
    self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
  }
};
