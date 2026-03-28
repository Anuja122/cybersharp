import { vec3 } from 'gl-matrix';

export class AudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;
  private listener: AudioListener;

  private activeSounds: Map<string, AudioBufferSourceNode> = new Map();

  constructor() {
    this.context = new AudioContext();
    this.listener = this.context.listener;

    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    this.musicGain = this.context.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = 0.5;

    this.sfxGain = this.context.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.value = 0.7;
  }

  update(listenerPosition: vec3) {
    if (this.listener.positionX) {
      this.listener.positionX.value = listenerPosition[0];
      this.listener.positionY.value = listenerPosition[1];
      this.listener.positionZ.value = listenerPosition[2];
    }
  }

  playSound(id: string, position?: vec3, volume = 1.0) {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 440 + Math.random() * 200;

    gainNode.gain.value = volume * 0.1;
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + 0.3
    );

    oscillator.connect(gainNode);

    if (position) {
      const panner = this.context.createPanner();
      panner.positionX.value = position[0];
      panner.positionY.value = position[1];
      panner.positionZ.value = position[2];
      panner.refDistance = 1;
      panner.maxDistance = 100;
      panner.rolloffFactor = 1;

      gainNode.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gainNode.connect(this.sfxGain);
    }

    oscillator.start();
    oscillator.stop(this.context.currentTime + 0.3);

    this.activeSounds.set(id, oscillator);
  }

  stopSound(id: string) {
    const sound = this.activeSounds.get(id);
    if (sound) {
      sound.stop();
      this.activeSounds.delete(id);
    }
  }

  setMasterVolume(volume: number) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number) {
    this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number) {
    this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
  }
}
