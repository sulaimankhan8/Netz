'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  FiPlay,
  FiPause,
  FiMic,
  FiVolume2,
  FiRepeat,
  FiShuffle,
  FiSkipForward,
  FiSkipBack,
  FiList,
} from 'react-icons/fi';

const FIFTEEN_MIN_SEC = 15 * 60; // 900 seconds per chunk track

/**
 * AudioMemoBlock — Embedded Voice Memo Player
 * Auto-splits long recordings into 15-minute tracks with Auto-Play Next, Loop, & Shuffle support.
 */
export default function AudioMemoBlock({ block, onUpdateContent, onDeleteBlock }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => {
    const rawSec = block.content?.durationSec;
    return rawSec && isFinite(rawSec) && !isNaN(rawSec) ? rawSec : 0;
  });

  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [loopMode, setLoopMode] = useState('none'); // 'none' | 'track' | 'playlist'
  const [isShuffle, setIsShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef(null);
  const audioSrc = block.content?.audioUrl || '';
  const title = block.content?.title || 'Voice Memo Recording';

  // Format seconds safely preventing Infinity/NaN from ever appearing
  const formatTime = (secs) => {
    if (!secs || !isFinite(secs) || isNaN(secs) || secs <= 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Generate 15-minute tracks if total duration exceeds 15 minutes (900 seconds)
  const tracks = useMemo(() => {
    const totalSec = Math.max(duration, block.content?.durationSec || 0);
    if (totalSec <= FIFTEEN_MIN_SEC) {
      return [
        {
          id: 0,
          name: 'Track 1 (Full Recording)',
          startSec: 0,
          endSec: totalSec || FIFTEEN_MIN_SEC,
          durationSec: totalSec,
        },
      ];
    }

    const chunkCount = Math.ceil(totalSec / FIFTEEN_MIN_SEC);
    const result = [];
    for (let i = 0; i < chunkCount; i++) {
      const start = i * FIFTEEN_MIN_SEC;
      const end = Math.min((i + 1) * FIFTEEN_MIN_SEC, totalSec);
      result.push({
        id: i,
        name: `Track ${i + 1} (${formatTime(start)} - ${formatTime(end)})`,
        startSec: start,
        endSec: end,
        durationSec: end - start,
      });
    }
    return result;
  }, [duration, block.content?.durationSec]);

  const activeTrack = tracks[activeTrackIndex] || tracks[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Check if current time reached end of 15-min track chunk
      if (activeTrack && cur >= activeTrack.endSec && isPlaying) {
        handleTrackEnd();
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      } else if (block.content?.durationSec) {
        setDuration(block.content.durationSec);
      }
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc, activeTrackIndex, isPlaying, activeTrack]);

  const handleTrackEnd = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (loopMode === 'track') {
      audio.currentTime = activeTrack.startSec;
      audio.play();
      return;
    }

    if (isShuffle && tracks.length > 1) {
      const randomIdx = Math.floor(Math.random() * tracks.length);
      selectTrack(randomIdx, true);
      return;
    }

    if (activeTrackIndex < tracks.length - 1) {
      // Auto-play Next 15-min Track
      selectTrack(activeTrackIndex + 1, autoPlayNext);
    } else if (loopMode === 'playlist') {
      // Loop back to Track 1
      selectTrack(0, true);
    } else {
      setIsPlaying(false);
      audio.pause();
    }
  };

  const selectTrack = (trackIdx, shouldPlay = false) => {
    const targetTrack = tracks[trackIdx];
    if (!targetTrack) return;
    setActiveTrackIndex(trackIdx);

    if (audioRef.current) {
      audioRef.current.currentTime = targetTrack.startSec;
      setCurrentTime(targetTrack.startSec);
      if (shouldPlay) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // If current time is out of track bounds, reset to track start
      if (currentTime < activeTrack.startSec || currentTime >= activeTrack.endSec) {
        audio.currentTime = activeTrack.startSec;
        setCurrentTime(activeTrack.startSec);
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/95 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 shadow-sm select-none gap-2">
      {audioSrc ? <audio ref={audioRef} src={audioSrc} preload="metadata" /> : null}

      {/* Top Header & Duration Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-500 text-white shadow-sm shrink-0">
            <FiMic className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">{title}</span>
            {tracks.length > 1 && (
              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-mono">
                Auto 15m Chunks ({tracks.length} Tracks)
              </span>
            )}
          </div>
        </div>

        {/* Safe Duration Display (No Infinity/NaN) */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0 font-medium">
          <FiVolume2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls & Progress Scrubber */}
      <div className="flex items-center gap-2 pt-0.5">
        {/* Track Skip Prev */}
        {tracks.length > 1 && (
          <button
            onClick={() => selectTrack(Math.max(0, activeTrackIndex - 1), isPlaying)}
            disabled={activeTrackIndex === 0}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <FiSkipBack className="w-4 h-4" />
          </button>
        )}

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-md transition-all cursor-pointer flex-shrink-0"
        >
          {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Track Skip Next */}
        {tracks.length > 1 && (
          <button
            onClick={() => selectTrack(Math.min(tracks.length - 1, activeTrackIndex + 1), isPlaying)}
            disabled={activeTrackIndex === tracks.length - 1}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <FiSkipForward className="w-4 h-4" />
          </button>
        )}

        {/* Progress Scrubber Bar */}
        <div className="flex-1 relative flex items-center px-1">
          <input
            type="range"
            min={activeTrack.startSec}
            max={activeTrack.endSec || duration || 100}
            value={currentTime}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value);
              setCurrentTime(newTime);
              if (audioRef.current) audioRef.current.currentTime = newTime;
            }}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Playlist / Loop Toggle Button */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (loopMode === 'none') setLoopMode('track');
              else if (loopMode === 'track') setLoopMode('playlist');
              else setLoopMode('none');
            }}
            title={`Loop Mode: ${loopMode}`}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              loopMode !== 'none' ? 'bg-blue-500/20 text-blue-500 dark:text-blue-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <FiRepeat className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            title={isShuffle ? 'Shuffle Enabled' : 'Shuffle Disabled'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isShuffle ? 'bg-purple-500/20 text-purple-500 dark:text-purple-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <FiShuffle className="w-3.5 h-3.5" />
          </button>
          {tracks.length > 1 && (
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              title="Toggle Track Playlist"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showPlaylist ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <FiList className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 15-Min Chunk Tracks Playlist Dropdown */}
      {(showPlaylist || tracks.length > 1) && (
        <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
            <span>Playlist ({tracks.length} Tracks)</span>
            <button
              onClick={() => setAutoPlayNext(!autoPlayNext)}
              className={`hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer ${
                autoPlayNext ? 'text-blue-500 dark:text-blue-400 font-semibold' : 'text-zinc-400'
              }`}
            >
              {autoPlayNext ? '✓ Auto-Play Next ON' : 'Auto-Play Next OFF'}
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
            {tracks.map((track, idx) => (
              <button
                key={track.id}
                onClick={() => selectTrack(idx, true)}
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-mono transition-colors text-left cursor-pointer ${
                  activeTrackIndex === idx
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/40'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{activeTrackIndex === idx && isPlaying ? '▶' : `#${idx + 1}`}</span>
                  <span className="truncate">{track.name}</span>
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{formatTime(track.durationSec)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
