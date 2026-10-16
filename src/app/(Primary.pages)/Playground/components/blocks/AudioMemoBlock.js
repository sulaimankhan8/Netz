'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiMic, FiRotateCcw } from 'react-icons/fi';

const SPEEDS = [1, 1.5, 2];

// Seconds as m:ss (never "Infinity" or "NaN")
function formatTime(secs) {
  if (!secs || !isFinite(secs) || isNaN(secs) || secs <= 0) return '0:00';
  const mins = Math.floor(secs / 60);
  const rest = Math.floor(secs % 60);
  return `${mins}:${rest < 10 ? '0' : ''}${rest}`;
}

const control = 'min-w-[36px] min-h-[36px] [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px] flex items-center justify-center rounded-xl transition-colors';

/**
 * A voice memo: play and pause, go back 10 seconds, move through it, play faster.
 * Its name can be changed while the block is being edited.
 */
export default function AudioMemoBlock({ block, onUpdateContent, isEditing = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => {
    const raw = block.content?.durationSec;
    return raw && isFinite(raw) && !isNaN(raw) ? raw : 0;
  });
  const [speed, setSpeed] = useState(1);

  const audioRef = useRef(null);
  const audioSrc = block.content?.audioUrl || '';
  const title = block.content?.title || 'Voice memo';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnd = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [audioSrc]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = speed;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const seek = (time) => {
    const t = Math.max(0, Math.min(duration || 0, time));
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/95 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-sm select-none gap-2">
      {audioSrc ? <audio ref={audioRef} src={audioSrc} preload="metadata" /> : null}

      <div className="flex items-center gap-2 min-w-0">
        <span className="p-1.5 rounded-lg bg-blue-500 text-white shrink-0">
          <FiMic className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateContent?.(block.blockId, { title: e.target.value })}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Voice memo name"
            maxLength={80}
            className="flex-1 min-w-0 px-2 min-h-[32px] [@media(pointer:coarse)]:min-h-[44px] rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        ) : (
          <span className="flex-1 min-w-0 font-semibold text-xs truncate">{title}</span>
        )}
        <span className="text-[12px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className={`${control} bg-blue-500 hover:bg-blue-600 text-white shrink-0`}>
          {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 ml-0.5" />}
        </button>
        <button type="button" onClick={() => seek(currentTime - 10)} aria-label="Back 10 seconds" title="Back 10 seconds" className={`${control} text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 shrink-0`}>
          <FiRotateCcw className="w-4 h-4" />
        </button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => seek(parseFloat(e.target.value))}
          aria-label="Position in the recording"
          className="flex-1 min-w-0 accent-blue-500 min-h-[32px]"
        />
        <button
          type="button"
          onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
          aria-label={`Playback speed ${speed}x`}
          title="Playback speed"
          className={`${control} px-2 text-[12px] font-mono font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 shrink-0`}
        >
          {speed}×
        </button>
      </div>
    </div>
  );
}
