'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { LuPlay, LuPause, LuRotateCcw } from 'react-icons/lu';
import { TOUCH_TARGET } from '../ui/Dialog';

const SPEEDS = [1, 1.5, 2];

// Seconds as m:ss (never "Infinity" or "NaN")
function formatTime(secs) {
  if (!secs || !isFinite(secs) || isNaN(secs) || secs <= 0) return '0:00';
  const mins = Math.floor(secs / 60);
  const rest = Math.floor(secs % 60);
  return `${mins}:${rest < 10 ? '0' : ''}${rest}`;
}

/**
 * A voice memo, as one compact row: a round play button in the memo's rose, the name over a
 * progress track, the time, back 10 s and the speed. Its name can be changed while editing.
 *
 * The recording loads only its length until it is played (preload="metadata"), the progress
 * moves with the browser's own ~4 updates a second, and the block is memoized, so panning the
 * page does not draw it again.
 */
function AudioMemoBlock({ block, onUpdateContent, isEditing = false }) {
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

  const progress = duration ? Math.min(1, currentTime / duration) : 0;
  // Presses on the controls stay with them (the rest of the block selects and drags it)
  const stop = (e) => e.stopPropagation();
  const small = `h-9 min-w-[36px] ${TOUCH_TARGET} flex items-center justify-center rounded-[10px] text-pg-text2 hover:text-pg-ink hover:bg-pg-tray transition-colors shrink-0`;

  return (
    <div className="w-full h-full flex items-center gap-3 px-3 py-2.5 select-none">
      {audioSrc ? <audio ref={audioRef} src={audioSrc} preload="metadata" /> : null}

      <button
        type="button"
        onPointerDown={stop}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-pg-voice text-pg-surface hover:brightness-110 active:scale-95 transition"
      >
        {isPlaying ? <LuPause className="w-5 h-5" fill="currentColor" /> : <LuPlay className="w-5 h-5 ml-0.5" fill="currentColor" />}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onUpdateContent?.(block.blockId, { title: e.target.value })}
              onPointerDown={stop}
              aria-label="Voice memo name"
              maxLength={80}
              className="flex-1 min-w-0 h-8 [@media(pointer:coarse)]:h-11 px-2 -mx-2 rounded-lg bg-pg-paper border border-pg-line text-pg-label font-semibold text-pg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-pg-accent"
            />
          ) : (
            <span className="flex-1 min-w-0 truncate text-pg-label font-semibold text-pg-ink">{title}</span>
          )}
          <span className="shrink-0 text-pg-cap tabular-nums text-pg-text2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        {/* The track: drawn as a bar, with an invisible range on top that takes the press */}
        <div className="relative h-5 flex items-center" onPointerDown={stop}>
          <div className="w-full h-1.5 rounded-full bg-pg-voice-tint overflow-hidden">
            <div className="h-full rounded-full bg-pg-voice" style={{ width: `${progress * 100}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seek(parseFloat(e.target.value))}
            aria-label="Position in the recording"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0" onPointerDown={stop}>
        <button type="button" onClick={() => seek(currentTime - 10)} aria-label="Back 10 seconds" title="Back 10 seconds" className={small}>
          <LuRotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
          aria-label={`Playback speed ${speed}x`}
          title="Playback speed"
          className={`${small} px-2 text-pg-cap font-semibold tabular-nums ${speed !== 1 ? '!text-pg-voice' : ''}`}
        >
          {speed}×
        </button>
      </div>
    </div>
  );
}

export default memo(AudioMemoBlock);
