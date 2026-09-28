'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiMusic,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiRepeat,
  FiUploadCloud,
  FiChevronDown,
  FiChevronUp,
  FiDisc,
  FiX,
} from 'react-icons/fi';
import { getAmbientEngine } from '../utils/ambientAudioEngine';

const BUILTIN_AMBIENT_PRESETS = [
  {
    id: 'lofi_rain',
    name: 'Lo-Fi Rain & Chill',
    icon: '🌧️',
    description: 'Rain, vinyl & lofi chords',
  },
  {
    id: 'forest_breeze',
    name: 'Forest Birds & Breeze',
    icon: '🌲',
    description: 'Tree wind & sweet chirps',
  },
  {
    id: 'cafe_study',
    name: 'Cafe Study Ambience',
    icon: '☕',
    description: 'Warm chatter & jazz keys',
  },
  {
    id: 'ocean_waves',
    name: 'Deep Focus Ocean Waves',
    icon: '🌊',
    description: 'Rhythmic rolling swells',
  },
];

export default function BackgroundMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35); // Default comfortable 35% ambient level
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [activePreset, setActivePreset] = useState(BUILTIN_AMBIENT_PRESETS[0]);
  const [customAudioUrl, setCustomAudioUrl] = useState(null);
  const [customAudioName, setCustomAudioName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const effectiveVolume = isMuted ? 0 : volume;
  const currentTitle = customAudioName || activePreset.name;

  // Sync volume with both Web Audio engine and HTML5 audio element
  useEffect(() => {
    const engine = getAmbientEngine();
    if (engine) {
      engine.setVolume(effectiveVolume);
    }
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
      audioRef.current.loop = isLooping;
    }
  }, [effectiveVolume, isLooping]);

  // Clean stop when component unmounts
  useEffect(() => {
    return () => {
      const engine = getAmbientEngine();
      if (engine) engine.stop();
    };
  }, []);

  const startPlayback = useCallback(() => {
    if (customAudioUrl) {
      // Custom audio file playback via standard audio element
      const engine = getAmbientEngine();
      if (engine) engine.stop();
      if (audioRef.current) {
        audioRef.current.volume = effectiveVolume;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      // Synthesized continuous generative ambient soundscape
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const engine = getAmbientEngine();
      if (engine) {
        engine.play(activePreset.id, effectiveVolume);
        setIsPlaying(true);
      }
    }
  }, [customAudioUrl, activePreset, effectiveVolume]);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    const engine = getAmbientEngine();
    if (engine) {
      engine.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  const handlePresetSelect = (preset) => {
    setActivePreset(preset);
    setCustomAudioUrl(null);
    setCustomAudioName('');

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const engine = getAmbientEngine();
    if (engine) {
      engine.play(preset.id, effectiveVolume);
      setIsPlaying(true);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Stop procedural engine
    const engine = getAmbientEngine();
    if (engine) engine.stop();

    const fileUrl = URL.createObjectURL(file);
    setCustomAudioUrl(fileUrl);
    setCustomAudioName(file.name.replace(/\.[^/.]+$/, ''));
    setIsPlaying(true);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = effectiveVolume;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }, 100);
  };

  return (
    <div className="fixed bottom-20 right-6 z-50 select-none">
      {/* Fallback audio element for custom uploaded files */}
      {customAudioUrl ? (
        <audio
          ref={audioRef}
          src={customAudioUrl}
          loop={isLooping}
          onEnded={() => {
            if (!isLooping) setIsPlaying(false);
          }}
        />
      ) : null}

      {/* Main Compact Player Pill */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-zinc-900/95 text-white backdrop-blur-xl border border-zinc-700/80 shadow-2xl transition-all">
        {/* Vinyl Disc Spin Animation when playing */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Click to view soundscapes"
        >
          <div
            className={`p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '4s' }}
          >
            <FiDisc className="w-4 h-4 text-white" />
          </div>

          <div className="flex flex-col text-left max-w-[140px]">
            <span className="text-[11px] font-semibold truncate leading-tight text-zinc-100">
              {currentTitle}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-2.5">
                  <span className="w-0.5 h-2.5 bg-blue-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-75" />
                  <span className="w-0.5 h-2 bg-blue-400 rounded-full animate-pulse delay-150" />
                </div>
              ) : null}
              <span className="text-[9px] text-zinc-400 font-mono">
                {isPlaying ? 'Playing Ambient' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Pause Background Music' : 'Play Background Music'}
          className="p-2 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 text-white shadow-md transition-all cursor-pointer"
        >
          {isPlaying ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        {/* Expand Options Arrow */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse' : 'Ambient sound options'}
          className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Controls Popover */}
      {isExpanded && (
        <div className="absolute bottom-14 right-0 w-[345px] p-3.5 rounded-2xl bg-zinc-900/95 text-white backdrop-blur-2xl border border-zinc-700/80 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
              <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                <FiMusic className="w-3.5 h-3.5" />
              </div>
              <span>Background Ambient Music</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsLooping(!isLooping)}
                title={isLooping ? 'Continuous Loop Enabled' : 'Loop Disabled'}
                className={`p-1 rounded-md transition-colors ${
                  isLooping ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FiRepeat className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                title="Close"
                className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors rounded-md"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Volume Control Slider */}
          <div className="flex items-center gap-2.5 px-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <FiVolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <FiVolume2 className="w-4 h-4 text-blue-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[10px] font-mono text-zinc-400 w-8 text-right font-medium">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Preset Options Grid - Wide and comfortable, no truncated text */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Study Ambience Presets
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                100% Offline
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BUILTIN_AMBIENT_PRESETS.map((preset) => {
                const isSelected = !customAudioUrl && activePreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`flex flex-col gap-0.5 p-2 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500/60 text-white shadow-sm ring-1 ring-blue-500/40'
                        : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-zinc-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{preset.icon}</span>
                      <span className="text-[11px] font-semibold leading-tight truncate">
                        {preset.name}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-400 leading-tight truncate pl-5">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom MP3 Upload */}
          <div className="pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/wav,audio/m4a,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-xs font-semibold text-zinc-200 border border-zinc-700/60 transition-all cursor-pointer shadow-sm hover:border-zinc-600"
            >
              <FiUploadCloud className="w-4 h-4 text-blue-400" />
              <span>Upload Custom MP3 Note Music</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
