/**
 * Ambient Sound Engine — Generative Web Audio API Synthesizer
 * Provides 100% offline, zero-network, infinite ambient soundscapes.
 * Completely immune to 403 Forbidden errors, buffering, or CORS issues.
 */

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeNodes = [];
    this.intervals = [];
    this.currentPreset = null;
    this.volume = 0.3;
    this.isPlaying = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  stop() {
    this.isPlaying = false;
    this.intervals.forEach((id) => clearInterval(id));
    this.intervals = [];

    if (this.activeNodes.length > 0 && this.masterGain && this.ctx) {
      // Gentle fade out before stopping nodes
      const fadeOutTime = this.ctx.currentTime + 0.15;
      try {
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
      } catch {
        // Ignore
      }
      setTimeout(() => {
        this.activeNodes.forEach((node) => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch {
            // Ignore
          }
        });
        this.activeNodes = [];
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
      }, 160);
    } else {
      this.activeNodes = [];
    }
    this.currentPreset = null;
  }

  play(presetId, volume = 0.3) {
    this.setVolume(volume);
    this.initContext();
    if (!this.ctx) return;

    this.stop();

    setTimeout(() => {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.currentPreset = presetId;
      this.isPlaying = true;

      switch (presetId) {
        case 'lofi_rain':
          this.createLofiRain();
          break;
        case 'forest_breeze':
          this.createForestBreeze();
          break;
        case 'cafe_study':
          this.createCafeStudy();
          break;
        case 'ocean_waves':
          this.createOceanWaves();
          break;
        default:
          this.createLofiRain();
      }
    }, 180);
  }

  // --- Helper: Create Looping Noise Buffer ---
  createNoiseBuffer(type = 'pink', durationSeconds = 5) {
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'pink') {
          // Paul Kellet's filter for pink noise
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        } else if (type === 'brown') {
          // Brownian noise
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else {
          output[i] = white * 0.1;
        }
      }
    }
    return buffer;
  }

  // 1. Lo-Fi Rain & Chill
  createLofiRain() {
    const ctx = this.ctx;

    // A. Rain noise bed
    const rainBuffer = this.createNoiseBuffer('pink', 6);
    const rainSource = ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1400, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.45, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);
    rainSource.start(0);
    this.activeNodes.push(rainSource, rainFilter, rainGain);

    // B. Soft Vinyl Crackle
    const crackleInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'lofi_rain') return;
      if (Math.random() < 0.6) {
        const pop = ctx.createBufferSource();
        const popBuf = ctx.createBuffer(1, 128, ctx.sampleRate);
        const popData = popBuf.getChannelData(0);
        for (let i = 0; i < 128; i++) {
          popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / 16);
        }
        pop.buffer = popBuf;
        const popGain = ctx.createGain();
        popGain.gain.setValueAtTime(Math.random() * 0.04 + 0.01, ctx.currentTime);
        pop.connect(popGain);
        popGain.connect(this.masterGain);
        pop.start();
      }
    }, 120);
    this.intervals.push(crackleInterval);

    // C. Cozy Lo-Fi Rhodes Chords (Slow meditative progressions)
    const chordProgressions = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [110.00, 130.81, 164.81, 196.00], // Am7 (A2, C3, E3, G3)
      [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
      [98.00, 146.83, 174.61, 246.94],  // G7 (G2, D3, F3, B3)
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.isPlaying || this.currentPreset !== 'lofi_rain') return;
      const freqs = chordProgressions[chordIdx % chordProgressions.length];
      chordIdx++;

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(4.5, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        const oscGain = ctx.createGain();
        const now = ctx.currentTime;
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.045 / (i + 1), now + 1.2);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 4.6);
        lfo.stop(now + 4.6);
      });
    };

    playChord();
    const chordTimer = setInterval(playChord, 4200);
    this.intervals.push(chordTimer);
  }

  // 2. Forest Birds & Breeze
  createForestBreeze() {
    const ctx = this.ctx;

    // A. Wind breeze through trees
    const windBuffer = this.createNoiseBuffer('pink', 6);
    const windSource = ctx.createBufferSource();
    windSource.buffer = windBuffer;
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(450, ctx.currentTime);
    windFilter.Q.setValueAtTime(1.8, ctx.currentTime);

    // LFO for slow wind gusts
    const windLFO = ctx.createOscillator();
    windLFO.frequency.setValueAtTime(0.12, ctx.currentTime);
    const windLFOGain = ctx.createGain();
    windLFOGain.gain.setValueAtTime(220, ctx.currentTime);
    windLFO.connect(windFilter.frequency);
    windLFO.start();

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.35, ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);
    windSource.start(0);
    this.activeNodes.push(windSource, windFilter, windGain, windLFO, windLFOGain);

    // B. Procedural Bird Chirps
    const triggerBirdSong = () => {
      if (!this.isPlaying || this.currentPreset !== 'forest_breeze') return;

      const chirpCount = Math.floor(Math.random() * 3) + 1;
      const baseFreq = 2600 + Math.random() * 1200;

      for (let c = 0; c < chirpCount; c++) {
        const chirpDelay = c * 0.14;
        const now = ctx.currentTime + chirpDelay;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.12);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0.0001, now);
        chirpGain.gain.linearRampToValueAtTime(0.06, now + 0.03);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(chirpGain);
        chirpGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.14);
      }
    };

    triggerBirdSong();
    const birdTimer = setInterval(triggerBirdSong, 2800 + Math.random() * 2000);
    this.intervals.push(birdTimer);
  }

  // 3. Cafe Study Ambience
  createCafeStudy() {
    const ctx = this.ctx;

    // A. Warm Room Murmur
    const murmurBuffer = this.createNoiseBuffer('pink', 6);
    const murmurSource = ctx.createBufferSource();
    murmurSource.buffer = murmurBuffer;
    murmurSource.loop = true;

    const murmurFilter1 = ctx.createBiquadFilter();
    murmurFilter1.type = 'bandpass';
    murmurFilter1.frequency.setValueAtTime(450, ctx.currentTime);
    murmurFilter1.Q.setValueAtTime(2.0, ctx.currentTime);

    const murmurFilter2 = ctx.createBiquadFilter();
    murmurFilter2.type = 'lowpass';
    murmurFilter2.frequency.setValueAtTime(900, ctx.currentTime);

    const murmurGain = ctx.createGain();
    murmurGain.gain.setValueAtTime(0.3, ctx.currentTime);

    murmurSource.connect(murmurFilter1);
    murmurFilter1.connect(murmurFilter2);
    murmurFilter2.connect(murmurGain);
    murmurGain.connect(this.masterGain);
    murmurSource.start(0);
    this.activeNodes.push(murmurSource, murmurFilter1, murmurFilter2, murmurGain);

    // B. Occasional Ceramic Cup / Spoon Clink
    const clinkInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'cafe_study') return;
      if (Math.random() < 0.35) {
        const now = ctx.currentTime;
        const clink = ctx.createOscillator();
        clink.type = 'sine';
        clink.frequency.setValueAtTime(3200 + Math.random() * 800, now);

        const clinkGain = ctx.createGain();
        clinkGain.gain.setValueAtTime(0.02, now);
        clinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        clink.connect(clinkGain);
        clinkGain.connect(this.masterGain);
        clink.start(now);
        clink.stop(now + 0.09);
      }
    }, 3500);
    this.intervals.push(clinkInterval);

    // C. Soft Jazz Piano Chords in Background
    const jazzChords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [164.81, 196.00, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
    ];
    let jIdx = 0;
    const playJazz = () => {
      if (!this.isPlaying || this.currentPreset !== 'cafe_study') return;
      const notes = jazzChords[jIdx % jazzChords.length];
      jIdx++;

      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.06;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.025, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 3.3);
      });
    };

    playJazz();
    const jazzTimer = setInterval(playJazz, 4500);
    this.intervals.push(jazzTimer);
  }

  // 4. Deep Focus Ocean Waves
  createOceanWaves() {
    const ctx = this.ctx;

    // Low rumble brownian surf
    const brownBuffer = this.createNoiseBuffer('brown', 7);
    const oceanSource = ctx.createBufferSource();
    oceanSource.buffer = brownBuffer;
    oceanSource.loop = true;

    // Resonant lowpass that swells with tides
    const waveFilter = ctx.createBiquadFilter();
    waveFilter.type = 'lowpass';
    waveFilter.frequency.setValueAtTime(320, ctx.currentTime);
    waveFilter.Q.setValueAtTime(2.2, ctx.currentTime);

    // Filter LFO (Tidal swell)
    const swellLFO = ctx.createOscillator();
    swellLFO.frequency.setValueAtTime(0.09, ctx.currentTime); // ~11 second wave cycle
    const swellLFOGain = ctx.createGain();
    swellLFOGain.gain.setValueAtTime(450, ctx.currentTime);
    swellLFO.connect(waveFilter.frequency);
    swellLFO.start();

    // Amplitude LFO matching the wave swell
    const ampLFO = ctx.createOscillator();
    ampLFO.frequency.setValueAtTime(0.09, ctx.currentTime);
    const ampLFOGain = ctx.createGain();
    ampLFOGain.gain.setValueAtTime(0.2, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.35, ctx.currentTime);
    ampLFO.connect(ampLFOGain);
    ampLFOGain.connect(waveGain.gain);
    ampLFO.start();

    oceanSource.connect(waveFilter);
    waveFilter.connect(waveGain);
    waveGain.connect(this.masterGain);
    oceanSource.start(0);

    this.activeNodes.push(
      oceanSource,
      waveFilter,
      waveGain,
      swellLFO,
      swellLFOGain,
      ampLFO,
      ampLFOGain
    );
  }
}

// Singleton instance for the application
let engineInstance = null;

export function getAmbientEngine() {
  if (typeof window === 'undefined') return null;
  if (!engineInstance) {
    engineInstance = new AmbientSoundEngine();
  }
  return engineInstance;
}
