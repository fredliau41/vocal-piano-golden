import * as Tone from 'tone';

class AudioService {
  private sampler: Tone.Sampler | null = null;
  private masterVolume: number = 0.7;
  private isReady: boolean = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    this.preloadSampler();
  }

  private async preloadSampler(): Promise<void> {
    try {
      console.log('Preloading Salamander Piano samples...');
      
      this.sampler = new Tone.Sampler({
        urls: {
          'A0': 'A0.mp3',
          'C1': 'C1.mp3',
          'D#1': 'Ds1.mp3',
          'F#1': 'Fs1.mp3',
          'A1': 'A1.mp3',
          'C2': 'C2.mp3',
          'D#2': 'Ds2.mp3',
          'F#2': 'Fs2.mp3',
          'A2': 'A2.mp3',
          'C3': 'C3.mp3',
          'D#3': 'Ds3.mp3',
          'F#3': 'Fs3.mp3',
          'A3': 'A3.mp3',
          'C4': 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          'A4': 'A4.mp3',
          'C5': 'C5.mp3',
          'D#5': 'Ds5.mp3',
          'F#5': 'Fs5.mp3',
          'A5': 'A5.mp3',
          'C6': 'C6.mp3',
          'D#6': 'Ds6.mp3',
          'F#6': 'Fs6.mp3',
          'A6': 'A6.mp3',
          'C7': 'C7.mp3',
          'D#7': 'Ds7.mp3',
          'F#7': 'Fs7.mp3',
          'A7': 'A7.mp3',
          'C8': 'C8.mp3'
        },
        release: 1.5,
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
        // Force immediate loading
        onload: () => {
          console.log('All samples preloaded successfully');
          this.isReady = true;
        }
      }).toDestination();

      // Wait for all samples to load completely
      this.loadingPromise = Tone.loaded();
      await this.loadingPromise;
      
      // Prime the audio context
      await Tone.start();
      
      // Test a silent note to initialize everything
      this.sampler.triggerAttackRelease('C4', 0.01, undefined, 0);
      
    } catch (error) {
      console.error('Preloading failed:', error);
    }
  }

  setVolume(volume: number) {
    // Scale the volume by 1.5 for louder output while keeping slider at 0-100%
    const scaledVolume = volume * 1.3;
    this.masterVolume = Math.max(0, Math.min(1.3, scaledVolume));
    if (this.sampler) {
      // Convert to decibels (0 to -60 dB range)
      const db = scaledVolume > 0 ? 20 * Math.log10(scaledVolume) : -60;
      this.sampler.volume.value = db;
    }
  }

  async playNote(frequency: number, duration: number = 0.5, volume: number = this.masterVolume): Promise<void> {
    // Wait for sampler to be ready if still loading
    if (!this.isReady && this.loadingPromise) {
      await this.loadingPromise;
    }

    if (!this.sampler || !this.isReady) {
      console.error('Sampler not ready');
      return;
    }

    // Convert frequency to note name
    const noteName = Tone.Frequency(frequency, "hz").toNote();
    
    try {
      // Calculate velocity based on volume
      const velocity = volume * this.masterVolume;
      
      // Trigger attack and release
      this.sampler.triggerAttackRelease(noteName, duration, undefined, velocity);

      // Return promise that resolves after duration
      return new Promise(resolve => {
        setTimeout(() => resolve(), duration * 1000);
      });
    } catch (error) {
      console.error('Error playing note:', error);
    }
  }

  async playSequence(frequencies: number[], bpm: number): Promise<void> {
    const noteDuration = (60 / bpm) * 0.8; // 80% of beat duration
    const totalDuration = 60 / bpm;

    for (const frequency of frequencies) {
      await this.playNote(frequency, noteDuration);
      await this.delay(totalDuration - noteDuration);
    }
  }

  async playChord(frequencies: number[], beats: number, bpm: number, volume: number = this.masterVolume): Promise<void> {
    // Wait until sampler is ready
    if (!this.isReady && this.loadingPromise) {
      await this.loadingPromise;
    }

    if (!this.sampler || !this.isReady) {
      console.error('Sampler not ready');
      return;
    }

    // Calculate durations
    const beatDuration = 60 / bpm; // seconds per beat
    const chordDuration = beatDuration * beats * 0.8; // sustain ~80% of allotted beats

    // Trigger all notes simultaneously
    const noteNames = frequencies.map(freq => Tone.Frequency(freq, 'hz').toNote());
    const velocity = volume * this.masterVolume;

    noteNames.forEach(name => {
      this.sampler!.triggerAttackRelease(name, chordDuration, undefined, velocity);
    });

    // Wait total beats duration before resolving
    await this.delay(beatDuration * beats);
  }

  private delay(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  stopAll() {
    if (this.sampler) {
      // Release all currently playing notes
      this.sampler.releaseAll();
    }
  }

  // Add getter to check if service is ready
  get ready(): boolean {
    return this.isReady;
  }
}

export const audioService = new AudioService();