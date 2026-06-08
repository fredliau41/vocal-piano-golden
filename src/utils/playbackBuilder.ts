import type { KeyType, ScaleType, NoteRange, PlaybackProgression, ProgressionEntry, ScaleNote } from '../types';
import { generatePianoKeys, getScale, getChord, getScaleName } from './musicTheory';

export interface PlaybackBuilderConfig {
  keyType: KeyType;
  scaleType: ScaleType;
  noteRange: NoteRange;
  startKey: number;
  endKey: number;
  includeChords: boolean;
  reverseSelection?: boolean;
}

export class PlaybackBuilder {
  private readonly keyType: KeyType;
  private readonly scaleType: ScaleType;
  private readonly noteRange: NoteRange;
  private readonly startKey: number;
  private readonly endKey: number;
  private readonly includeChords: boolean;
  private readonly reverseSelection: boolean;
  private readonly pianoKeys = generatePianoKeys();

  constructor(config: PlaybackBuilderConfig) {
    this.keyType = config.keyType;
    this.scaleType = config.scaleType;
    this.noteRange = config.noteRange;
    this.startKey = config.startKey;
    this.endKey = config.endKey;
    this.includeChords = config.includeChords;
    this.reverseSelection = Boolean(config.reverseSelection);
  }

  build(): PlaybackProgression {
    const naturalAscending = this.startKey <= this.endKey;
    const keyRange = Math.abs(this.endKey - this.startKey) + 1;
    const entries: ProgressionEntry[] = [];

    // Build the forward pass (from start toward end, respecting start/end ordering)
    for (let i = 0; i < keyRange; i++) {
      const keyNum = naturalAscending ? this.startKey + i : this.startKey - i;
      const key = this.pianoKeys.find(k => k.keyNumber === keyNum);
      if (!key) continue;

      const displayName = this.scaleType === 'chromatic'
        ? `${key.note} Chromatic`
        : `${getScaleName(key.note, this.keyType)} ${this.scaleType === 'scales' ? 'Scale' : 'Arpeggio'}`;

      const notes: ScaleNote[] = getScale(this.keyType, this.scaleType, key.note, key.octave, this.noteRange);
      const noteFrequencies: number[] = notes
        .map(n => this.pianoKeys.find(pk => pk.keyNumber === n.keyNumber)?.frequency)
        .filter((f): f is number => typeof f === 'number');

      let currentChord: ScaleNote[] | undefined;
      let nextChord: ScaleNote[] | undefined;
      let currentChordFreqs: number[] | undefined;
      let nextChordFreqs: number[] | undefined;

      if (this.includeChords) {
        currentChord = getChord(this.keyType, key.note, key.octave);
        currentChordFreqs = this.chordToFrequencies(currentChord);

        // Pre-compute the next chord if there is a next key
        if (i + 1 < keyRange) {
          const nextKeyNum = naturalAscending ? keyNum + 1 : keyNum - 1;
          const nextKey = this.pianoKeys.find(k => k.keyNumber === nextKeyNum);
          if (nextKey) {
            nextChord = getChord(this.keyType, nextKey.note, nextKey.octave);
            nextChordFreqs = this.chordToFrequencies(nextChord);
          }
        }
      }

      const entry: ProgressionEntry = {
        rootKeyNumber: key.keyNumber,
        rootNote: key.note,
        octave: key.octave,
        displayName,
        notes,
        noteFrequencies,
        currentChord,
        nextChord,
        currentChordFreqs,
        nextChordFreqs,
      };

      entries.push(entry);
    }

    // If reverseSelection is enabled, append the reverse pass (excluding the last key to avoid duplication)
    if (this.reverseSelection && entries.length > 1) {
      const reverseEntries: ProgressionEntry[] = [];
      for (let i = entries.length - 2; i >= 0; i--) {
        reverseEntries.push(entries[i]);
      }
      entries.push(...reverseEntries);
    }

    return { entries, isAscending: naturalAscending };
  }

  private chordToFrequencies(chord: ScaleNote[] | undefined): number[] {
    if (!chord || chord.length === 0) return [];
    return chord
      .map(n => this.pianoKeys.find(pk => pk.keyNumber === n.keyNumber)?.frequency)
      .filter((f): f is number => typeof f === 'number');
  }
}


