/**
 * NETZ HTR CTC Greedy & Confidence Decoder
 *
 * Decodes the output logits of netz_htr.onnx:
 *   - Input tensor to model: 'strokes' [1, T, 8]
 *   - Output tensor: 'logits' [1, T, 78]
 *   - Character Vocabulary: 77 characters in netz_htr_vocab.json
 *   - Index mapping: 0 = CTC Blank, 1..77 -> vocab[i - 1]
 */

/**
 * Computes softmax over a float slice.
 *
 * @param {Float32Array|Array<number>} arr
 * @param {number} start
 * @param {number} length
 * @returns {Array<number>}
 */
function softmax(arr, start, length) {
  let maxVal = -Infinity;
  for (let i = 0; i < length; i++) {
    const v = arr[start + i];
    if (v > maxVal) maxVal = v;
  }

  let sum = 0;
  const probs = new Array(length);
  for (let i = 0; i < length; i++) {
    const exp = Math.exp(arr[start + i] - maxVal);
    probs[i] = exp;
    sum += exp;
  }

  const invSum = sum > 0 ? 1 / sum : 1;
  for (let i = 0; i < length; i++) {
    probs[i] *= invSum;
  }

  return probs;
}

/**
 * Decodes HTR output logits using CTC greedy decoding.
 *
 * @param {Float32Array} logitsData - Flattened logits [1, T, numClasses]
 * @param {number} timeSteps - T
 * @param {number} numClasses - Usually 78 (1 blank + 77 chars)
 * @param {Array<string>} vocab - Character vocabulary (length 77)
 * @returns {{ text: string, confidence: number, charConfidences: Array<{ char: string, conf: number }> }}
 */
export function decodeHTRGreedy(logitsData, timeSteps, numClasses, vocab) {
  let prevIdx = -1;
  const decodedChars = [];
  const charConfidences = [];
  let logProbSum = 0;

  for (let t = 0; t < timeSteps; t++) {
    const offset = t * numClasses;

    // Find argmax for current timestep
    let bestIdx = 0;
    let maxLogit = -Infinity;
    for (let c = 0; c < numClasses; c++) {
      const val = logitsData[offset + c];
      if (val > maxLogit) {
        maxLogit = val;
        bestIdx = c;
      }
    }

    // CTC Rule: collapse consecutive duplicate indices
    if (bestIdx !== prevIdx) {
      // Index 0 is CTC Blank
      if (bestIdx > 0 && bestIdx <= vocab.length) {
        const char = vocab[bestIdx - 1];
        const probs = softmax(logitsData, offset, numClasses);
        const conf = probs[bestIdx] || 0.5;

        decodedChars.push(char);
        charConfidences.push({ char, conf });
        logProbSum += Math.log(Math.max(conf, 1e-6));
      }
    }

    prevIdx = bestIdx;
  }

  const text = decodedChars.join('');
  const confidence = decodedChars.length > 0
    ? Math.exp(logProbSum / decodedChars.length)
    : 0.0;

  return {
    text,
    confidence: Math.min(1.0, Math.max(0.0, confidence)),
    charConfidences,
  };
}
