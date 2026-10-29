import { AmbientSoundType } from '../types';

let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioNode | null = null;
let gainNode: GainNode | null = null;
let currentSound: AmbientSoundType = 'none';
let currentVolume: number = 0.5;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAmbientVolume(vol: number): void {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (gainNode && audioCtx) {
    gainNode.gain.setTargetAtTime(currentVolume * 0.15, audioCtx.currentTime, 0.05);
  }
}

export function getCurrentAmbientSound(): AmbientSoundType {
  return currentSound;
}

export function stopAmbientSound(): void {
  if (currentSourceNode) {
    try {
      (currentSourceNode as any).stop?.();
      currentSourceNode.disconnect();
    } catch (e) {}
    currentSourceNode = null;
  }
  currentSound = 'none';
}

export function playAmbientSound(type: AmbientSoundType, volume: number = currentVolume): void {
  stopAmbientSound();
  if (type === 'none') return;

  const ctx = getAudioContext();
  currentVolume = volume;

  gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
  gainNode.connect(ctx.destination);

  if (type === 'binaural') {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(216, ctx.currentTime);
    osc2.frequency.setValueAtTime(222, ctx.currentTime);

    const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    if (panner1 && panner2) {
      panner1.pan.setValueAtTime(-0.8, ctx.currentTime);
      panner2.pan.setValueAtTime(0.8, ctx.currentTime);
      osc1.connect(panner1);
      osc2.connect(panner2);
      panner1.connect(gainNode);
      panner2.connect(gainNode);
    } else {
      osc1.connect(gainNode);
      osc2.connect(gainNode);
    }

    osc1.start();
    osc2.start();
    currentSourceNode = osc1;
    currentSound = 'binaural';
    return;
  }

  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;

    if (type === 'rain') {
      lastOut = (lastOut * 0.94) + (white * 0.06);
      data[i] = lastOut * 1.5;
    } else if (type === 'fire') {
      const isPop = Math.random() < 0.003;
      data[i] = isPop ? (Math.random() * 2 - 1) * 2.2 : (white * 0.15);
    } else {
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      data[i] = lastOut * 3.0;
    }
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const filter = ctx.createBiquadFilter();
  if (type === 'rain') {
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
  } else if (type === 'fire') {
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);
  } else {
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, ctx.currentTime);
  }

  noiseSource.connect(filter);
  filter.connect(gainNode);
  noiseSource.start();

  currentSourceNode = noiseSource;
  currentSound = type;
}
