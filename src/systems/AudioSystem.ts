export type SoundType =
  | 'capture_throw'
  | 'capture_shake'
  | 'capture_success'
  | 'capture_fail'
  | 'attack_hit'
  | 'attack_pet'
  | 'player_hurt'
  | 'shop_buy'
  | 'shop_fail'
  | 'chest_open'
  | 'pet_deploy'
  | 'pet_recall'
  | 'lava_damage'
  | 'trap_damage';

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;

  init(): void {
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
      console.log('[Audio] AudioSystem initialized');
    } catch (e) {
      console.warn('[Audio] Web Audio API not available:', e);
    }
  }

  private ensureContext(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.initialized) {
      this.init();
    }
  }

  play(sound: SoundType): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    switch (sound) {
      case 'capture_throw':
        this.playTone(600, 0.1, 'sine', 0.3, 800);
        break;
      case 'capture_shake':
        this.playTone(300, 0.08, 'square', 0.15);
        setTimeout(() => this.playTone(350, 0.08, 'square', 0.15), 100);
        break;
      case 'capture_success':
        this.playTone(523, 0.12, 'sine', 0.3);
        setTimeout(() => this.playTone(659, 0.12, 'sine', 0.3), 120);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.35), 240);
        break;
      case 'capture_fail':
        this.playTone(400, 0.15, 'sawtooth', 0.2);
        setTimeout(() => this.playTone(300, 0.2, 'sawtooth', 0.2), 150);
        break;
      case 'attack_hit':
        this.playNoise(0.06, 0.4);
        this.playTone(200, 0.05, 'square', 0.2);
        break;
      case 'attack_pet':
        this.playNoise(0.05, 0.3);
        this.playTone(350, 0.05, 'square', 0.15);
        break;
      case 'player_hurt':
        this.playTone(180, 0.1, 'sawtooth', 0.3, 100);
        break;
      case 'shop_buy':
        this.playTone(800, 0.08, 'sine', 0.25);
        setTimeout(() => this.playTone(1000, 0.1, 'sine', 0.25), 80);
        break;
      case 'shop_fail':
        this.playTone(200, 0.15, 'square', 0.2);
        break;
      case 'chest_open':
        this.playTone(440, 0.1, 'sine', 0.25);
        setTimeout(() => this.playTone(554, 0.1, 'sine', 0.25), 100);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 200);
        break;
      case 'pet_deploy':
        this.playTone(500, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(700, 0.12, 'sine', 0.25), 100);
        break;
      case 'pet_recall':
        this.playTone(700, 0.1, 'sine', 0.2);
        setTimeout(() => this.playTone(500, 0.12, 'sine', 0.2), 100);
        break;
      case 'lava_damage':
        this.playTone(120, 0.15, 'sawtooth', 0.15);
        break;
      case 'trap_damage':
        this.playNoise(0.08, 0.35);
        this.playTone(250, 0.06, 'square', 0.25);
        break;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    freqEnd?: number,
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (freqEnd !== undefined) {
      osc.frequency.linearRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + 0.01);
  }

  private playNoise(duration: number, volume: number): void {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(this.ctx.currentTime);
  }
}
