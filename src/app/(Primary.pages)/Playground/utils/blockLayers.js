/**
 * "Draw on it" (PLAYGROUND_HANDOFF.md C2): a block whose switch is on sits under the ink, so the pen
 * writes over it, on screen and in PNG, SVG and PDF exports. Pictures and graphs start with it on.
 */
export const inkGoesOver = (block) => block?.content?.drawOver ?? (block?.type === 'image' || block?.type === 'graph');
