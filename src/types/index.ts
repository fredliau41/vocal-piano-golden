export interface PianoKey {
  note: string;
  octave: number;
  keyNumber: number;
  isBlack: boolean;
  frequency: number;
}

export interface ScaleNote {
  note: string;
  octave: number;
  keyNumber: number;
}

export type KeyType = 'major' | 'minor';
export type ScaleType = 'scales' | 'arpeggios' | 'chromatic';
export type NoteRange = 3 | 5 | 8;
export type KeyState = 'default' | 'start' | 'end' | 'playing';

export interface AppState {
  startKey: number | null;
  endKey: number | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentPlayingKey: number | null;
  keyType: KeyType;
  scaleType: ScaleType;
  noteRange: NoteRange;
  playChords: boolean;
  repeatCurrent: boolean;
  reverseSelection: boolean;
  bpm: number;
  volume: number;
  currentScale: string;
  // Pause/resume state
  pausedKeyIndex: number | null;
  pausedNoteIndex: number | null;
  currentPlayingKeys: number[];
}

// Builder/progression types
export interface ProgressionEntry {
  rootKeyNumber: number;
  rootNote: string;
  octave: number;
  displayName: string; // e.g., "C Major Scale" or "A Chromatic"
  notes: ScaleNote[];
  noteFrequencies: number[];
  currentChord?: ScaleNote[];
  nextChord?: ScaleNote[];
  currentChordFreqs?: number[];
  nextChordFreqs?: number[];
}

export interface PlaybackProgression {
  entries: ProgressionEntry[];
  isAscending: boolean;
}