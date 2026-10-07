/**
 * NETZ Continuous Candidate Engine
 *
 * Ranks multi-hypothesis interpretation candidates using continuous joint scoring:
 *   Score_total = Score_recog * Score_struct * Score_semantic
 *
 * Exposes top hypotheses to the user whenever geometric or model uncertainty justifies it,
 * without fabricating alternatives when confident.
 */

import { evaluateSemanticCoherence } from './semanticValidator.js';

/**
 * Generates ranked candidate interpretations for an ink recognition event.
 *
 * @param {{
 *   primaryValue: string,
 *   primaryType: string,
 *   confidence: { recognition: number, structure: number, semantic: number },
 *   alternatives?: Array<{ value: string, type: string, confidence: number }>,
 *   scriptAffinities?: { inline: number, superscript: number, subscript: number }
 * }} recognitionPayload
 * @returns {Array<{ value: string, type: string, score: number, description: string }>}
 */
export function generateRankedCandidates(recognitionPayload) {
  const candidates = [];
  const {
    primaryValue,
    primaryType,
    confidence = { recognition: 0.8, structure: 0.8, semantic: 0.8 },
    alternatives = [],
    scriptAffinities,
  } = recognitionPayload;

  // 1. Primary candidate
  const semScore1 = evaluateSemanticCoherence(primaryValue, primaryType);
  const totalScore1 =
    (confidence.recognition || 0.5) *
    (confidence.structure || 0.8) *
    semScore1;

  candidates.push({
    value: primaryValue,
    type: primaryType,
    score: totalScore1,
    description: `Primary (${primaryType.toLowerCase()})`,
  });

  // 2. Add structural alternatives if script affinities show geometric ambiguity
  if (scriptAffinities && primaryValue && primaryValue.length >= 2) {
    const lastChar = primaryValue.slice(-1);
    const baseChars = primaryValue.slice(0, -1);

    // If superscript affinity is significant but inline was chosen, offer power alternative
    if (scriptAffinities.superscript > 0.25) {
      const powVal = `${baseChars}^{${lastChar}}`;
      const semPow = evaluateSemanticCoherence(powVal, 'MATH');
      candidates.push({
        value: powVal,
        type: 'MATH',
        score: (confidence.recognition || 0.5) * scriptAffinities.superscript * semPow,
        description: 'Superscript Power',
      });
    }

    // If subscript affinity is significant
    if (scriptAffinities.subscript > 0.25) {
      const subVal = `${baseChars}_{${lastChar}}`;
      const semSub = evaluateSemanticCoherence(subVal, 'MATH');
      candidates.push({
        value: subVal,
        type: 'MATH',
        score: (confidence.recognition || 0.5) * scriptAffinities.subscript * semSub,
        description: 'Subscript Index',
      });
    }
  }

  // 3. Include any model-provided alternatives
  for (let i = 0; i < alternatives.length; i++) {
    const alt = alternatives[i];
    if (alt.value !== primaryValue) {
      const altSem = evaluateSemanticCoherence(alt.value, alt.type);
      candidates.push({
        value: alt.value,
        type: alt.type,
        score: (alt.confidence || 0.4) * altSem,
        description: `Alternative (${alt.type.toLowerCase()})`,
      });
    }
  }

  // Deduplicate by value
  const seen = new Set();
  const deduped = [];
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    if (!seen.has(c.value)) {
      seen.add(c.value);
      deduped.push(c);
    }
  }

  // Sort by continuous score descending
  deduped.sort((a, b) => b.score - a.score);

  return deduped;
}
