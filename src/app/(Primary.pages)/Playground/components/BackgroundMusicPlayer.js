'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiUploadCloud } from 'react-icons/fi';
import { LuMusic } from 'react-icons/lu';
import { Dialog } from './ui/Dialog';
import { UI } from '../utils/uiText';

const BUILTIN_AMBIENT_PRESETS = [
  { id: 'lofi_chill', name: 'Lo-fi chill', src: '/audio/ambient/lofi-relax.mp3', description: 'Mellow beats and keys' },
  { id: 'rain_window', name: 'Rain on a window', src: '/audio/ambient/rain.mp3', description: 'Steady rainfall' },
  { id: 'forest_birds', name: 'Forest birds', src: '/audio/ambient/forest-birds.mp3', description: 'Birdsong and breeze' },
  { id: 'cozy_cafe', name: 'Study café', src: '/audio/ambient/cafe.mp3', description: 'Quiet café chatter' },
  { id: 'ocean_waves', name: 'Ocean waves', src: '/audio/ambient/ocean-waves.mp3', description: 'Rolling surf' },
  { id: 'campfire', name: 'Campfire', src: '/audio/ambient/campfire.mp3', description: 'Crackling fire' },
];

const PREFS_KEY = 'netz_playground_music';

/**
 * Focus music: ambient sounds to study with. Opened from the More or Page menu; never on the page
 * by itself. While something plays, a small pause button sits at the top right of the screen.
 * The chosen sound and volume are remembered on this device.
 */
export default function BackgroundMusicPlayer({ open = false, onClose, isMobile = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const [activePreset, setActivePreset] = useState(BUILTIN_AMBIENT_PRESETS[0]);
  const [customAudioUrl, setCustomAudioUrl] = useState(null);
  const [customAudioName, setCustomAudioName] = useState('');

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const effectiveVolume = isMuted ? 0 : volume;
  const currentSrc = customAudioUrl || activePreset.src;
  const currentTitle = customAudioName || activePreset.name;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
      if (saved) {
        const preset = BUILTIN_AMBIENT_PRESETS.find((p) => p.id === saved.presetId);
        if (preset) setActivePreset(preset);
        if (Number.isFinite(saved.volume)) setVolume(Math.min(1, Math.max(0, saved.volume)));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ presetId: activePreset.id, volume }));
    } catch (e) {}
  }, [activePreset, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
      audioRef.current.loop = true;
    }
  }, [effectiveVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) audio.pause();
    };
  }, []);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = effectiveVolume;
    audio.loop = true;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      play();
    }
  };

  const playSource = (src) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = src;
    play();
  };

  const handlePresetSelect = (preset) => {
    setActivePreset(preset);
    setCustomAudioUrl(null);
    setCustomAudioName('');
    playSource(preset.src);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    setCustomAudioUrl(fileUrl);
    setCustomAudioName(file.name.replace(/\.[^/.]+$/, ''));
    playSource(fileUrl);
  };

  const round = 'min-w-[40px] min-h-[40px] [@media(pointer:coarse)]:min-w-[44px] [@media(pointer:coarse)]:min-h-[44px]';

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSrc}
        loop
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* While playing: a small pause button at the top right */}
      {isPlaying && !open && (
        <div className="fixed z-40 right-3 sm:right-4 flex items-center gap-1 p-1 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg" style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}>
          <button type="button" onClick={togglePlay} aria-label={`Pause ${currentTitle}`} title={`Pause ${currentTitle}`} className={`${round} flex items-center justify-center rounded-xl text-blue-600 dark:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
            <FiPause className="w-4 h-4" />
          </button>
        </div>
      )}

      {open && (
        <Dialog title={UI.focusMusic} isMobile={isMobile} onClose={onClose} width="w-[420px]" fullHeight={false}>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <LuMusic className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{currentTitle}</div>
              <div className="text-[12px] text-zinc-500 dark:text-zinc-400">{isPlaying ? 'Playing' : 'Paused'}</div>
            </div>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className={`${round} flex items-center justify-center rounded-xl bg-blue-500 hover:bg-blue-600 text-white`}>
              {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 ml-0.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Unmute' : 'Mute'} className={`${round} flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
              {isMuted || volume === 0 ? <FiVolumeX className="w-4 h-4 text-rose-500" /> : <FiVolume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              aria-label="Volume"
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="flex-1 accent-blue-500"
            />
            <span className="w-10 text-right font-mono text-[12px] text-zinc-500">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {BUILTIN_AMBIENT_PRESETS.map((preset) => {
              const selected = !customAudioUrl && activePreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  aria-pressed={selected}
                  className={`flex flex-col items-start gap-0.5 p-2.5 min-h-[44px] rounded-xl border text-left ${
                    selected ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{preset.name}</span>
                  <span className="text-[12px] text-zinc-500 dark:text-zinc-400">{preset.description}</span>
                </button>
              );
            })}
          </div>

          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <FiUploadCloud className="w-4 h-4" aria-hidden="true" />
            Play your own audio file
          </button>
        </Dialog>
      )}
    </>
  );
}
