import { LuSigma, LuType, LuLineChart, LuMic, LuImage, LuPencil } from 'react-icons/lu';

/**
 * A little colour per kind of block (tokens in ../../playground.css): the card's edge, the type
 * badge in the block's bar, and the one main control inside (the play button, the first curve).
 * Selection stays indigo, so a selected block never looks like a type colour.
 *
 * Class names are written out in full so Tailwind keeps them.
 */
const HUES = {
  equation: {
    icon: LuSigma,
    text: 'text-pg-eq',
    tint: 'bg-pg-eq-tint',
    border: 'border-pg-eq/25 hover:border-pg-eq/50',
    fill: 'bg-pg-eq',
  },
  theory: {
    icon: LuType,
    text: 'text-pg-note',
    tint: 'bg-pg-note-tint',
    border: 'border-pg-note/25 hover:border-pg-note/50',
    fill: 'bg-pg-note',
  },
  graph: {
    icon: LuLineChart,
    text: 'text-pg-plot',
    tint: 'bg-pg-plot-tint',
    border: 'border-pg-plot/25 hover:border-pg-plot/50',
    fill: 'bg-pg-plot',
  },
  audio: {
    icon: LuMic,
    text: 'text-pg-voice',
    tint: 'bg-pg-voice-tint',
    border: 'border-pg-voice/25 hover:border-pg-voice/50',
    fill: 'bg-pg-voice',
  },
  image: {
    icon: LuImage,
    text: 'text-pg-text2',
    tint: 'bg-pg-tray',
    border: 'border-pg-line hover:border-pg-text2/30',
    fill: 'bg-pg-ink',
  },
  sketch: {
    icon: LuPencil,
    text: 'text-pg-text2',
    tint: 'bg-pg-tray',
    border: 'border-pg-line hover:border-pg-text2/30',
    fill: 'bg-pg-ink',
  },
};

export function blockHue(type) {
  return HUES[type] || HUES.image;
}

/** The type badge in a block's bar: its icon on its tint. */
export function BlockBadge({ type, className = '' }) {
  const hue = blockHue(type);
  const Icon = hue.icon;
  return (
    <span aria-hidden="true" className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${hue.tint} ${hue.text} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
    </span>
  );
}
