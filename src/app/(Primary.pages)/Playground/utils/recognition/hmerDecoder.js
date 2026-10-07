/**
 * NETZ HMER Autoregressive Sequence Decoder
 *
 * Implements autoregressive greedy decoding for netz_hmer.onnx:
 *   - Input tensors:
 *       1. 'strokes': Float32 [1, stroke_seq_len, 8]
 *       2. 'tgt_tokens': Int64 [1, tgt_seq_len]
 *   - Output tensor: 'logits' [1, tgt_seq_len, 232]
 *   - Special tokens:
 *       pad = 0, sos = 1, eos = 2, unk = 3
 *   - Maximum target sequence length: 160 tokens
 */

import * as ort from 'onnxruntime-web';

const SPECIAL_TOKENS = {
  PAD: 0,
  SOS: 1,
  EOS: 2,
  UNK: 3,
};

/**
 * Converts array of token IDs into clean, formatted LaTeX.
 *
 * @param {Array<number>} tokenIds
 * @param {Array<string>} vocab
 * @returns {string}
 */
export function tokensToLatex(tokenIds, vocab) {
  const parts = [];

  for (let i = 0; i < tokenIds.length; i++) {
    const id = tokenIds[i];
    // Skip SOS, EOS, PAD
    if (id === SPECIAL_TOKENS.SOS || id === SPECIAL_TOKENS.EOS || id === SPECIAL_TOKENS.PAD) {
      continue;
    }
    if (id >= 0 && id < vocab.length) {
      const tok = vocab[id];
      if (tok && tok !== '<unk>') {
        parts.push(tok);
      }
    }
  }

  // Join tokens into cohesive LaTeX
  let latex = '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i > 0) {
      const prev = parts[i - 1];
      // Add space if both are alphanumeric words or command requiring separation
      if (/^[a-zA-Z0-9]+$/.test(prev) && /^[a-zA-Z0-9]+$/.test(p)) {
        latex += ' ';
      } else if (prev.startsWith('\\') && /^[a-zA-Z0-9]/.test(p)) {
        latex += ' ';
      }
    }
    latex += p;
  }

  return latex.trim();
}

/**
 * Runs autoregressive greedy decoding on netz_hmer.onnx.
 *
 * @param {ort.InferenceSession} session - Active HMER session
 * @param {Float32Array} strokeFeatures - Flattened 8D features [N * 8]
 * @param {number} strokeSeqLen - N
 * @param {Array<string>} vocab - Token vocabulary (length 232)
 * @param {number} [maxTgtLen=120] - Maximum tokens to generate
 * @returns {Promise<{ latex: string, tokenIds: Array<number>, confidence: number }>}
 */
export function decodeHMERAutoregressive(session, strokeFeatures, strokeSeqLen, vocab, maxTgtLen = 120) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Prepare strokes tensor: [1, strokeSeqLen, 8]
      const strokesTensor = new ort.Tensor('float32', strokeFeatures, [1, strokeSeqLen, 8]);

      // 2. Initial target tokens: [[SOS]] with BigInt64Array
      let currentTokens = [BigInt(SPECIAL_TOKENS.SOS)];
      const tokenIds = [SPECIAL_TOKENS.SOS];
      let sumLogProb = 0;

      for (let step = 0; step < maxTgtLen; step++) {
        const tgtLen = currentTokens.length;
        const tgtBuffer = new BigInt64Array(currentTokens);
        const tgtTensor = new ort.Tensor('int64', tgtBuffer, [1, tgtLen]);

        const feeds = {
          strokes: strokesTensor,
          tgt_tokens: tgtTensor,
        };

        const results = await session.run(feeds);
        const logitsTensor = results.logits; // shape [1, tgtLen, vocabSize]
        const vocabSize = logitsTensor.dims[2];
        const logitsData = logitsTensor.data;

        // Get logits for the last token position: index (tgtLen - 1)
        const lastStepOffset = (tgtLen - 1) * vocabSize;

        let bestToken = 0;
        let maxLogit = -Infinity;
        for (let v = 0; v < vocabSize; v++) {
          const val = logitsData[lastStepOffset + v];
          if (val > maxLogit) {
            maxLogit = val;
            bestToken = v;
          }
        }

        // Softmax probability for confidence estimation
        let sumExp = 0;
        for (let v = 0; v < vocabSize; v++) {
          sumExp += Math.exp(logitsData[lastStepOffset + v] - maxLogit);
        }
        const prob = 1 / sumExp;
        sumLogProb += Math.log(Math.max(prob, 1e-6));

        tokenIds.push(bestToken);
        currentTokens.push(BigInt(bestToken));

        // Stop if EOS is generated
        if (bestToken === SPECIAL_TOKENS.EOS) {
          break;
        }
      }

      const latex = tokensToLatex(tokenIds, vocab);
      const avgConfidence = tokenIds.length > 1
        ? Math.exp(sumLogProb / (tokenIds.length - 1))
        : 0.5;

      console.log(
        `%c[HMER Decoder] Decoded LaTeX: "${latex}" (Confidence: ${Math.round(avgConfidence * 100)}%, Tokens: ${tokenIds.length - 1})`,
        'color: #06b6d4; font-weight: bold;'
      );

      resolve({
        latex,
        tokenIds,
        confidence: Math.min(1.0, Math.max(0.0, avgConfidence)),
      });
    } catch (err) {
      reject(err);
    }
  });
}
