'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiUploadCloud } from 'react-icons/fi';
import { LuMusic } from 'react-icons/lu';
import { Dialog, TOUCH_TARGET } from './ui/Dialog';
import { BTN_SECONDARY } from './ui/parts';
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
 * Focus music: ambient sounds to study with. Opened from the page menu; never on the page by
 * itself. While something plays, the Playground shows a pause button (in the top-right bar on
 * laptops and tablets, in the status area on phones): onPlayingChange(playing, title) tells it,
 * and the ref's pause() stops the sound. The chosen sound and volume are remembered on this device.
 */
const BackgroundMusicPlayer = forwardRef(function BackgroundMusicPlayer({ open = false, onClose, isMobile = false, onPlayingChange }, ref) {
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

  useImperativeHandle(ref, () => ({
    pause: () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    },
  }), []);

  const reportRef = useRef(onPlayingChange);
  reportRef.current = onPlayingChange;
  useEffect(() => {
    reportRef.current?.(isPlaying, currentTitle);
  }, [isPlaying, currentTitle]);

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

  const round = `min-w-[40px] min-h-[40px] ${TOUCH_TARGET}`;

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

      {open && (
        <Dialog title={UI.focusMusic} isMobile={isMobile} onClose={onClose} width="w-[420px]" fullHeight={false}>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-pg-tray text-pg-ink flex items-center justify-center shrink-0">
              <LuMusic className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-pg-body font-semibold text-pg-ink truncate">{currentTitle}</div>
              <div className="text-pg-cap text-pg-text2">{isPlaying ? 'Playing' : 'Paused'}</div>
            </div>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className={`${round} flex items-center justify-center rounded-xl bg-pg-accent-fill hover:bg-pg-accent-fill/90 text-white`}>
              {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 ml-0.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Unmute' : 'Mute'} className={`${round} flex items-center justify-center rounded-xl text-pg-text2 hover:bg-pg-tray`}>
              {isMuted || volume === 0 ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
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
              className="flex-1 accent-[rgb(var(--pg-ink))]"
            />
            <span className="w-10 text-right tabular-nums text-pg-cap text-pg-text2">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
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
                    selected ? 'border-pg-ink bg-pg-tray' : 'border-pg-line hover:bg-pg-tray'
                  }`}
                >
                  <span className="text-pg-label font-semibold text-pg-ink">{preset.name}</span>
                  <span className="text-pg-cap text-pg-text2">{preset.description}</span>
                </button>
              );
            })}
          </div>

          <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className={`${BTN_SECONDARY} min-h-[44px]`}>
            <FiUploadCloud className="w-4 h-4" aria-hidden="true" />
            Play your own audio file
          </button>
        </Dialog>
      )}
    </>
  );
});

export default BackgroundMusicPlayer;
