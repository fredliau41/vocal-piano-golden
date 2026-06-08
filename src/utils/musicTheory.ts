import type { PianoKey, ScaleNote, KeyType, ScaleType, NoteRange } from '../types';

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Extract constants for scale patterns
const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  majorArpeggio: [0, 4, 7, 12],
  minorArpeggio: [0, 3, 7, 12],
  majorArpeggio5: [0, 4, 7, 4, 0],
  minorArpeggio5: [0, 3, 7, 3, 0],
  majorArpeggio3: [0, 4, 7],
  minorArpeggio3: [0, 3, 7],
  major3: [0, 2, 4],
  minor3: [0, 2, 3],
} as const;

const CHORD_PATTERNS: Record<KeyType, number[]> = {
  major: [0, 4, 7], // Root, Major Third, Perfect Fifth
  minor: [0, 3, 7], // Root, Minor Third, Perfect Fifth
};

// Cache piano keys to avoid regenerating them repeatedly
let cachedPianoKeys: PianoKey[] | null = null;

function getCachedPianoKeys(): PianoKey[] {
  if (!cachedPianoKeys) {
    cachedPianoKeys = generatePianoKeys();
  }
  return cachedPianoKeys;
}

export function generatePianoKeys(): PianoKey[] {
  const keys: PianoKey[] = [];
  let keyNumber = 1;
  
  // Start from E1 (76 keys total)
  for (let octave = 1; octave <= 7; octave++) {
    const startNote = octave === 1 ? 4 : 0; // Start from E in octave 1
    const endNote = octave === 7 ? 7 : 11; // End at G in octave 7
    
    for (let noteIndex = startNote; noteIndex <= endNote && keyNumber <= 76; noteIndex++) {
      const note = noteNames[noteIndex];
      const isBlack = note.includes('#');
      const frequency = calculateFrequency(note.replace('#', ''), octave, isBlack);
      
      keys.push({
        note: note.replace('#', '♯'),
        octave,
        keyNumber,
        isBlack,
        frequency
      });
      
      keyNumber++;
    }
  }
  
  return keys;
}

function calculateFrequency(note: string, octave: number, isSharp: boolean): number {
  const A4 = 440;
  const noteMap: { [key: string]: number } = {
    'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2
  };
  
  let semitones = noteMap[note] + (octave - 4) * 12;
  if (isSharp) semitones += 1;
  
  return A4 * Math.pow(2, semitones / 12);
}

// Helper function to convert note index and interval to ScaleNote
function createScaleNote(noteIndex: number, interval: number, baseOctave: number): ScaleNote | null {
  const targetNoteIndex = (noteIndex + interval) % 12;
  const targetOctave = baseOctave + Math.floor((noteIndex + interval) / 12);
  const keyNumber = findKeyNumber(noteNames[targetNoteIndex], targetOctave);
  
  if (keyNumber) {
    return {
      note: noteNames[targetNoteIndex].replace('#', '♯'),
      octave: targetOctave,
      keyNumber
    };
  }
  return null;
}

// Extract common scale generation logic
function generateScaleFromPattern(
  rootNote: string, 
  octave: number, 
  pattern: readonly number[], 
  noteRange: NoteRange,
  includeDescending: boolean = true
): ScaleNote[] {
  const noteIndex = noteNames.findIndex(n => n.replace('#', '♯') === rootNote);
  if (noteIndex === -1) return [];
  
  const patternToUse = pattern.slice(0, noteRange);
  const scale: ScaleNote[] = [];
  
  // Ascending
  patternToUse.forEach(interval => {
    const scaleNote = createScaleNote(noteIndex, interval, octave);
    if (scaleNote) scale.push(scaleNote);
  });
  
  // Descending (skip the highest note to avoid duplication)
  if (includeDescending) {
    for (let i = patternToUse.length - 2; i >= 0; i--) {
      const interval = patternToUse[i];
      const scaleNote = createScaleNote(noteIndex, interval, octave);
      if (scaleNote) scale.push(scaleNote);
    }
  }
  
  return scale;
}

export function getMajorScale(rootNote: string, octave: number, noteRange: NoteRange = 8): ScaleNote[] {
  const pattern = noteRange === 3 ? SCALE_PATTERNS.major3 : SCALE_PATTERNS.major;
  return generateScaleFromPattern(rootNote, octave, pattern, noteRange);
}

export function getMinorScale(rootNote: string, octave: number, noteRange: NoteRange = 8): ScaleNote[] {
  const pattern = noteRange === 3 ? SCALE_PATTERNS.minor3 : SCALE_PATTERNS.minor;
  return generateScaleFromPattern(rootNote, octave, pattern, noteRange);
}

export function getChromaticScale(rootNote: string, octave: number, noteRange: NoteRange = 8): ScaleNote[] {
    const noteIndex = noteNames.findIndex(n => n.replace('#', '♯') === rootNote);
    const scale: ScaleNote[] = [];
  
    if (noteIndex === -1) return scale;
  
    const majorIntervals = [2, 2, 1, 2, 2, 2, 1];

    // Calculate semitone steps based on number of notes
    let stepsUp: number;
    
    if (noteRange === 3) {
      stepsUp = 2; // For 3 notes, just go up 2 semitones (root, +1, +2)
    } else {
      stepsUp = majorIntervals.slice(0, noteRange - 1).reduce((sum, val) => sum + val, 0);
    }
  
    // Ascending
    for (let i = 0; i <= stepsUp; i++) {
      const scaleNote = createScaleNote(noteIndex, i, octave);
      if (scaleNote) scale.push(scaleNote);
    }
  
    // Descending (skip the top note to avoid duplication)
    for (let i = stepsUp - 1; i >= 0; i--) {
      const scaleNote = createScaleNote(noteIndex, i, octave);
      if (scaleNote) scale.push(scaleNote);
    }
  
    return scale;
  }
  

// Extract common arpeggio logic
function generateArpeggioFromPattern(
  rootNote: string,
  octave: number,
  pattern: readonly number[],
  fiveNotePattern: readonly number[],
  threeNotePattern: readonly number[],
  noteRange: NoteRange
): ScaleNote[] {
  const noteIndex = noteNames.findIndex(n => n.replace('#', '♯') === rootNote);
  if (noteIndex === -1) return [];
  
  const arpeggio: ScaleNote[] = [];
  
  if (noteRange === 3) {
    // For 3-note range, just use the triad
    threeNotePattern.forEach(interval => {
      const scaleNote = createScaleNote(noteIndex, interval, octave);
      if (scaleNote) arpeggio.push(scaleNote);
    });
  } else if (noteRange === 5) {
    // For 5-note range, use the specific pattern
    fiveNotePattern.forEach(interval => {
      const scaleNote = createScaleNote(noteIndex, interval, octave);
      if (scaleNote) arpeggio.push(scaleNote);
    });
  } else {
    // For 8-note range: ascending then descending
    pattern.forEach(interval => {
      const scaleNote = createScaleNote(noteIndex, interval, octave);
      if (scaleNote) arpeggio.push(scaleNote);
    });
    
    // Descending (skip the octave note)
    for (let i = pattern.length - 2; i >= 0; i--) {
      const interval = pattern[i];
      const scaleNote = createScaleNote(noteIndex, interval, octave);
      if (scaleNote) arpeggio.push(scaleNote);
    }
  }
  
  return arpeggio;
}

export function getMajorArpeggio(rootNote: string, octave: number, noteRange: NoteRange = 8): ScaleNote[] {
  return generateArpeggioFromPattern(
    rootNote, 
    octave, 
    SCALE_PATTERNS.majorArpeggio, 
    SCALE_PATTERNS.majorArpeggio5, 
    SCALE_PATTERNS.majorArpeggio3,
    noteRange
  );
}

export function getMinorArpeggio(rootNote: string, octave: number, noteRange: NoteRange = 8): ScaleNote[] {
  return generateArpeggioFromPattern(
    rootNote, 
    octave, 
    SCALE_PATTERNS.minorArpeggio, 
    SCALE_PATTERNS.minorArpeggio5, 
    SCALE_PATTERNS.minorArpeggio3,
    noteRange
  );
}

// Helper function to get the appropriate scale/arpeggio based on parameters
export function getScale(
  keyType: KeyType, 
  scaleType: ScaleType, 
  rootNote: string, 
  octave: number, 
  noteRange: NoteRange = 8
): ScaleNote[] {
  if (scaleType === 'chromatic') {
    return getChromaticScale(rootNote, octave, noteRange);
  }
  
  if (scaleType === 'arpeggios') {
    return keyType === 'major' 
      ? getMajorArpeggio(rootNote, octave, noteRange)
      : getMinorArpeggio(rootNote, octave, noteRange);
  }
  
  // scales
  return keyType === 'major' 
    ? getMajorScale(rootNote, octave, noteRange)
    : getMinorScale(rootNote, octave, noteRange);
}

// Simplified chord generation using the extracted pattern approach
export function getChord(keyType: KeyType, rootNote: string, octave: number): ScaleNote[] {
  const noteIndex = noteNames.findIndex(n => n.replace('#', '♯') === rootNote);
  if (noteIndex === -1) return [];

  const chord: ScaleNote[] = [];
  const pattern = CHORD_PATTERNS[keyType];

  pattern.forEach(interval => {
    const scaleNote = createScaleNote(noteIndex, interval, octave);
    if (scaleNote) chord.push(scaleNote);
  });

  return chord;
}

function findKeyNumber(note: string, octave: number): number | null {
  const keys = getCachedPianoKeys();
  const found = keys.find(key => 
    key.note.replace('♯', '#') === note && key.octave === octave
  );
  return found ? found.keyNumber : null;
}

export function getScaleName(rootNote: string, keyType: KeyType): string {
  return `${rootNote} ${keyType === 'major' ? 'Major' : 'Minor'}`;
}

export function chromaticProgression(startKey: number, endKey: number): string[] {
  const keys = getCachedPianoKeys();
  const progression: string[] = [];
  
  if (startKey <= endKey) {
    // Ascending progression
    for (let keyNum = startKey; keyNum <= endKey; keyNum++) {
      const key = keys.find(k => k.keyNumber === keyNum);
      if (key) {
        progression.push(key.note);
      }
    }
  } else {
    // Descending progression
    for (let keyNum = startKey; keyNum >= endKey; keyNum--) {
      const key = keys.find(k => k.keyNumber === keyNum);
      if (key) {
        progression.push(key.note);
      }
    }
  }
  
  return progression;
}