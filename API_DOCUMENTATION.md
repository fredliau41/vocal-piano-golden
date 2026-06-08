# Vocal Keys API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Types and Interfaces](#types-and-interfaces)
3. [Services](#services)
   - [AudioService](#audioservice)
   - [CookieService](#cookieservice)
4. [Utilities](#utilities)
   - [Music Theory Utils](#music-theory-utils)
5. [Components](#components)
   - [App.vue](#appvue)
   - [ControlPanel.vue](#controlpanelvue)
   - [PianoKeyboard.vue](#pianokeyboardvue)
   - [PianoKey.vue](#pianokeyvue)
   - [HelloWorld.vue](#helloworldvue)
6. [Usage Examples](#usage-examples)

## Overview

Vocal Keys is a Vue 3 + TypeScript application that provides an interactive piano interface for vocal exercises, warm-ups, and singing practices. The application features a 76-key piano keyboard with audio playback, scale/arpeggio generation, and customizable settings.

### Key Features
- Interactive 76-key piano keyboard
- Real-time audio playback using Tone.js
- Scale and arpeggio generation
- Customizable tempo and volume
- Settings persistence via cookies
- Responsive design

## Types and Interfaces

### Core Types

```typescript
// Piano key representation
interface PianoKey {
  note: string;        // Note name (e.g., "C", "C♯")
  octave: number;      // Octave number (1-7)
  keyNumber: number;   // Sequential key number (1-76)
  isBlack: boolean;    // Whether it's a black key
  frequency: number;   // Frequency in Hz
}

// Scale note representation
interface ScaleNote {
  note: string;        // Note name
  octave: number;      // Octave number
  keyNumber: number;   // Key number on piano
}

// Musical types
type KeyType = 'major' | 'minor';
type ScaleType = 'scales' | 'arpeggios' | 'chromatic';
type NoteRange = 3 | 5 | 8;
type KeyState = 'default' | 'start' | 'end' | 'playing';

// Application state
interface AppState {
  startKey: number | null;
  endKey: number | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentPlayingKey: number | null;
  keyType: KeyType;
  scaleType: ScaleType;
  noteRange: NoteRange;
  playChords: boolean;
  bpm: number;
  volume: number;
  currentScale: string;
  pausedKeyIndex: number | null;
  pausedNoteIndex: number | null;
  currentPlayingKeys: number[];
}
```

## Services

### AudioService

The AudioService manages audio playback using Tone.js with high-quality piano samples.

#### Constructor
```typescript
const audioService = new AudioService();
```

#### Public Methods

##### `setVolume(volume: number): void`
Sets the master volume for all audio playback.

**Parameters:**
- `volume`: Volume level (0-1, where 1 is 100%)

**Example:**
```typescript
import { audioService } from './services/audioService';

// Set volume to 75%
audioService.setVolume(0.75);
```

##### `playNote(frequency: number, duration?: number, volume?: number): Promise<void>`
Plays a single note at the specified frequency.

**Parameters:**
- `frequency`: Frequency in Hz
- `duration`: Duration in seconds (default: 0.5)
- `volume`: Volume level (default: master volume)

**Returns:** Promise that resolves when the note finishes playing

**Example:**
```typescript
// Play middle C (261.63 Hz) for 1 second
await audioService.playNote(261.63, 1.0);

// Play A4 (440 Hz) with custom volume
await audioService.playNote(440, 0.5, 0.8);
```

##### `playSequence(frequencies: number[], bpm: number): Promise<void>`
Plays a sequence of notes at the specified tempo.

**Parameters:**
- `frequencies`: Array of frequencies to play
- `bpm`: Tempo in beats per minute

**Returns:** Promise that resolves when the sequence finishes

**Example:**
```typescript
// Play a C major scale
const cMajorScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
await audioService.playSequence(cMajorScale, 120);
```

##### `playChord(frequencies: number[], beats: number, bpm: number, volume?: number): Promise<void>`
Plays multiple notes simultaneously as a chord.

**Parameters:**
- `frequencies`: Array of frequencies to play together
- `beats`: Duration in beats
- `bpm`: Tempo in beats per minute
- `volume`: Volume level (default: master volume)

**Returns:** Promise that resolves when the chord finishes

**Example:**
```typescript
// Play a C major chord for 2 beats at 120 BPM
const cMajorChord = [261.63, 329.63, 392.00]; // C, E, G
await audioService.playChord(cMajorChord, 2, 120);
```

##### `stopAll(): void`
Stops all currently playing notes.

**Example:**
```typescript
// Stop all audio playback
audioService.stopAll();
```

##### `get ready(): boolean`
Returns whether the audio service is ready for playback.

**Example:**
```typescript
if (audioService.ready) {
  await audioService.playNote(440);
}
```

### CookieService

The CookieService manages persistent storage of user settings using browser cookies.

#### Static Methods

##### `saveSettings(settings: UserSettings): void`
Saves user settings to a browser cookie.

**Parameters:**
- `settings`: UserSettings object to save

**Example:**
```typescript
import { cookieService } from './services/cookieService';

const settings: UserSettings = {
  keyType: 'major',
  scaleType: 'scales',
  noteRange: 5,
  startKey: 33,
  endKey: 45,
  bpm: 120,
  volume: 0.75,
  playChords: true
};

cookieService.saveSettings(settings);
```

##### `loadSettings(): UserSettings | null`
Loads user settings from browser cookie.

**Returns:** UserSettings object or null if no settings found

**Example:**
```typescript
const settings = cookieService.loadSettings();
if (settings) {
  // Apply loaded settings
  appState.keyType = settings.keyType;
  appState.bpm = settings.bpm;
}
```

##### `clearSettings(): void`
Clears all saved settings from browser cookie.

**Example:**
```typescript
cookieService.clearSettings();
```

## Utilities

### Music Theory Utils

The music theory utilities provide functions for generating scales, arpeggios, and managing piano keys.

#### `generatePianoKeys(): PianoKey[]`
Generates an array of all 76 piano keys with their properties.

**Returns:** Array of PianoKey objects

**Example:**
```typescript
import { generatePianoKeys } from './utils/musicTheory';

const pianoKeys = generatePianoKeys();
console.log(pianoKeys[0]); // { note: "E", octave: 1, keyNumber: 1, isBlack: false, frequency: 41.2 }
```

#### `getMajorScale(rootNote: string, octave: number, noteRange?: NoteRange): ScaleNote[]`
Generates a major scale starting from the specified root note.

**Parameters:**
- `rootNote`: Root note name (e.g., "C", "F♯")
- `octave`: Starting octave
- `noteRange`: Number of notes (3, 5, or 8, default: 8)

**Returns:** Array of ScaleNote objects

**Example:**
```typescript
import { getMajorScale } from './utils/musicTheory';

// Get C major scale in octave 4
const cMajorScale = getMajorScale('C', 4);
// Returns: [{ note: "C", octave: 4, keyNumber: 33 }, ...]
```

#### `getMinorScale(rootNote: string, octave: number, noteRange?: NoteRange): ScaleNote[]`
Generates a minor scale starting from the specified root note.

**Parameters:**
- `rootNote`: Root note name
- `octave`: Starting octave
- `noteRange`: Number of notes (3, 5, or 8, default: 8)

**Returns:** Array of ScaleNote objects

**Example:**
```typescript
import { getMinorScale } from './utils/musicTheory';

// Get A minor scale in octave 4
const aMinorScale = getMinorScale('A', 4);
```

#### `getMajorArpeggio(rootNote: string, octave: number, noteRange?: NoteRange): ScaleNote[]`
Generates a major arpeggio starting from the specified root note.

**Parameters:**
- `rootNote`: Root note name
- `octave`: Starting octave
- `noteRange`: Number of notes (3, 5, or 8, default: 8)

**Returns:** Array of ScaleNote objects

**Example:**
```typescript
import { getMajorArpeggio } from './utils/musicTheory';

// Get C major arpeggio in octave 4
const cMajorArpeggio = getMajorArpeggio('C', 4);
```

#### `getMinorArpeggio(rootNote: string, octave: number, noteRange?: NoteRange): ScaleNote[]`
Generates a minor arpeggio starting from the specified root note.

**Parameters:**
- `rootNote`: Root note name
- `octave`: Starting octave
- `noteRange`: Number of notes (3, 5, or 8, default: 8)

**Returns:** Array of ScaleNote objects

**Example:**
```typescript
import { getMinorArpeggio } from './utils/musicTheory';

// Get A minor arpeggio in octave 4
const aMinorArpeggio = getMinorArpeggio('A', 4);
```

#### `getChromaticScale(rootNote: string, octave: number, noteRange?: NoteRange): ScaleNote[]`
Generates a chromatic scale starting from the specified root note.

**Parameters:**
- `rootNote`: Root note name
- `octave`: Starting octave
- `noteRange`: Number of notes (3, 5, or 8, default: 8)

**Returns:** Array of ScaleNote objects

**Example:**
```typescript
import { getChromaticScale } from './utils/musicTheory';

// Get chromatic scale starting from C in octave 4
const chromaticScale = getChromaticScale('C', 4);
```

#### `getScale(keyType: KeyType, scaleType: ScaleType, rootNote: string, octave: number, noteRange?: NoteRange): ScaleNote[]`
Generic function to get any type of scale or arpeggio.

**Parameters:**
- `keyType`: 'major' or 'minor'
- `scaleType`: 'scales', 'arpeggios', or 'chromatic'
- `rootNote`: Root note name
- `octave`: Starting octave
- `noteRange`: Number of notes (3, 5, or 8, default: 8)

**Returns:** Array of ScaleNote objects

**Example:**
```typescript
import { getScale } from './utils/musicTheory';

// Get C major scale
const cMajorScale = getScale('major', 'scales', 'C', 4);

// Get A minor arpeggio
const aMinorArpeggio = getScale('minor', 'arpeggios', 'A', 4);
```

#### `getChord(keyType: KeyType, rootNote: string, octave: number): ScaleNote[]`
Generates a chord (triad) for the specified root note and key type.

**Parameters:**
- `keyType`: 'major' or 'minor'
- `rootNote`: Root note name
- `octave`: Starting octave

**Returns:** Array of ScaleNote objects representing the chord

**Example:**
```typescript
import { getChord } from './utils/musicTheory';

// Get C major chord
const cMajorChord = getChord('major', 'C', 4);

// Get A minor chord
const aMinorChord = getChord('minor', 'A', 4);
```

#### `getScaleName(rootNote: string, keyType: KeyType): string`
Generates a human-readable scale name.

**Parameters:**
- `rootNote`: Root note name
- `keyType`: 'major' or 'minor'

**Returns:** Scale name string

**Example:**
```typescript
import { getScaleName } from './utils/musicTheory';

const scaleName = getScaleName('C', 'major'); // "C Major"
const minorScaleName = getScaleName('A', 'minor'); // "A Minor"
```

#### `chromaticProgression(startKey: number, endKey: number): string[]`
Generates a chromatic progression of note names between two piano keys.

**Parameters:**
- `startKey`: Starting key number (1-76)
- `endKey`: Ending key number (1-76)

**Returns:** Array of note name strings

**Example:**
```typescript
import { chromaticProgression } from './utils/musicTheory';

// Get chromatic progression from key 33 to 45
const progression = chromaticProgression(33, 45);
// Returns: ["A", "A♯", "B", "C", ...]
```

## Components

### App.vue

The main application component that orchestrates the entire application.

#### Props
None (root component)

#### Events
None (root component)

#### Public Methods

##### `handleKeyClick(keyNumber: number): void`
Handles piano key clicks for setting start and end keys.

**Parameters:**
- `keyNumber`: The clicked key number (1-76)

**Example:**
```vue
<PianoKeyboard @keyClick="handleKeyClick" />
```

##### `updateKeyType(keyType: KeyType): void`
Updates the key type (major/minor).

**Parameters:**
- `keyType`: 'major' or 'minor'

**Example:**
```vue
<ControlPanel @updateKeyType="updateKeyType" />
```

##### `updateScaleType(scaleType: ScaleType): void`
Updates the scale type (scales/arpeggios/chromatic).

**Parameters:**
- `scaleType`: 'scales', 'arpeggios', or 'chromatic'

**Example:**
```vue
<ControlPanel @updateScaleType="updateScaleType" />
```

##### `updateNoteRange(noteRange: NoteRange): void`
Updates the note range (3/5/8 notes).

**Parameters:**
- `noteRange`: 3, 5, or 8

**Example:**
```vue
<ControlPanel @updateNoteRange="updateNoteRange" />
```

##### `updateBpm(bpm: number): void`
Updates the tempo in beats per minute.

**Parameters:**
- `bpm`: Tempo value (40-400)

**Example:**
```vue
<ControlPanel @updateBpm="updateBpm" />
```

##### `updateVolume(volume: number): void`
Updates the volume level.

**Parameters:**
- `volume`: Volume level (0-1)

**Example:**
```vue
<ControlPanel @updateVolume="updateVolume" />
```

##### `updatePlayChords(playChords: boolean): void`
Updates whether chords should be played.

**Parameters:**
- `playChords`: Boolean flag

**Example:**
```vue
<ControlPanel @updatePlayChords="updatePlayChords" />
```

##### `togglePlayback(): void`
Toggles between play, pause, and resume states.

**Example:**
```vue
<ControlPanel @togglePlayback="togglePlayback" />
```

##### `stopPlayback(): void`
Stops all playback and resets to initial state.

**Example:**
```vue
<ControlPanel @stopPlayback="stopPlayback" />
```

##### `clearSelection(): void`
Clears the selected start and end keys.

**Example:**
```vue
<ControlPanel @clearSelection="clearSelection" />
```

##### `updateStartKey(startKey: number): void`
Updates the start key number.

**Parameters:**
- `startKey`: Key number (1-76)

**Example:**
```vue
<ControlPanel @updateStartKey="updateStartKey" />
```

##### `updateEndKey(endKey: number): void`
Updates the end key number.

**Parameters:**
- `endKey`: Key number (1-76)

**Example:**
```vue
<ControlPanel @updateEndKey="updateEndKey" />
```

##### `resetDefaults(): void`
Resets all settings to default values.

**Example:**
```vue
<ControlPanel @resetDefaults="resetDefaults" />
```

### ControlPanel.vue

The control panel component that provides all user interface controls.

#### Props

```typescript
interface Props {
  keyType: KeyType;
  scaleType: ScaleType;
  noteRange: NoteRange;
  startKey: number | null;
  endKey: number | null;
  bpm: number;
  volume: number;
  playChords: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentScale: string;
}
```

#### Events

```typescript
interface Emits {
  (e: 'updateKeyType', keyType: KeyType): void;
  (e: 'updateScaleType', scaleType: ScaleType): void;
  (e: 'updateNoteRange', noteRange: NoteRange): void;
  (e: 'updateBpm', bpm: number): void;
  (e: 'updateVolume', volume: number): void;
  (e: 'updatePlayChords', playChords: boolean): void;
  (e: 'togglePlayback'): void;
  (e: 'stopPlayback'): void;
  (e: 'clearSelection'): void;
  (e: 'updateStartKey', startKey: number): void;
  (e: 'updateEndKey', endKey: number): void;
  (e: 'resetDefaults'): void;
}
```

#### Computed Properties

##### `canPlay: boolean`
Returns whether playback can be started (requires start and end keys).

#### Methods

##### `handleKeyTypeChange(event: Event): void`
Handles key type dropdown changes.

##### `handleScaleTypeChange(event: Event): void`
Handles scale type dropdown changes.

##### `handleNoteRangeChange(event: Event): void`
Handles note range dropdown changes.

##### `handleBpmChange(event: Event): void`
Handles BPM slider changes.

##### `handleVolumeChange(event: Event): void`
Handles volume slider changes.

##### `togglePlayChords(event: Event): void`
Handles chord toggle checkbox changes.

##### `handleStartKeyInput(event: Event): void`
Handles start key text input changes.

##### `handleEndKeyInput(event: Event): void`
Handles end key text input changes.

##### `handleStartKeyBlur(): void`
Handles start key input blur events.

##### `handleEndKeyBlur(): void`
Handles end key input blur events.

##### `getKeyLabel(keyNumber: number): string`
Converts a key number to a note label.

**Parameters:**
- `keyNumber`: Key number (1-76)

**Returns:** Note label string (e.g., "C4")

**Example:**
```typescript
const label = getKeyLabel(33); // "A3"
```

### PianoKeyboard.vue

The piano keyboard component that renders the interactive piano interface.

#### Props

```typescript
interface Props {
  startKey: number | null;
  endKey: number | null;
  currentPlayingKey: number | null;
  currentPlayingKeys: number[];
}
```

#### Events

```typescript
interface Emits {
  (e: 'keyClick', keyNumber: number): void;
}
```

#### Computed Properties

##### `pianoKeys: PianoKey[]`
Returns the array of all piano keys.

#### Methods

##### `getKeyState(keyNumber: number): KeyState`
Determines the visual state of a piano key.

**Parameters:**
- `keyNumber`: Key number (1-76)

**Returns:** KeyState ('default', 'start', 'end', or 'playing')

**Example:**
```typescript
const state = getKeyState(33); // Returns 'start' if startKey is 33
```

##### `handleKeyClick(keyNumber: number): Promise<void>`
Handles piano key click events.

**Parameters:**
- `keyNumber`: The clicked key number

**Example:**
```vue
<PianoKey @keyClick="handleKeyClick" />
```

##### `scrollToCenter(): void`
Scrolls the keyboard to center the piano keys.

### PianoKey.vue

Individual piano key component with interactive states and animations.

#### Props

```typescript
interface Props {
  keyData: PianoKey;
  state: KeyState;
}
```

#### Events

```typescript
interface Emits {
  (e: 'keyClick', keyNumber: number): void;
}
```

#### Computed Properties

##### `keyClasses: string[]`
Returns CSS classes for the key based on its state and properties.

##### `keyStyles: Record<string, string>`
Returns inline styles for the key.

#### Methods

##### `handleClick(): void`
Handles key click events with visual feedback.

##### `handleMouseDown(): void`
Handles mouse down events.

##### `handleMouseUp(): void`
Handles mouse up events.

##### `handleMouseEnter(): void`
Handles mouse enter events.

##### `handleMouseLeave(): void`
Handles mouse leave events.

### HelloWorld.vue

A simple example component demonstrating Vue 3 composition API.

#### Props

```typescript
interface Props {
  msg: string;
}
```

#### Events
None

#### Reactive Data

##### `count: Ref<number>`
A reactive counter value.

## Usage Examples

### Basic Setup

```vue
<template>
  <div id="app">
    <PianoKeyboard
      :startKey="appState.startKey"
      :endKey="appState.endKey"
      :currentPlayingKey="appState.currentPlayingKey"
      :currentPlayingKeys="appState.currentPlayingKeys"
      @keyClick="handleKeyClick"
    />
    
    <ControlPanel
      :keyType="appState.keyType"
      :scaleType="appState.scaleType"
      :noteRange="appState.noteRange"
      :startKey="appState.startKey"
      :endKey="appState.endKey"
      :bpm="appState.bpm"
      :volume="appState.volume"
      :playChords="appState.playChords"
      :isPlaying="appState.isPlaying"
      :isPaused="appState.isPaused"
      :currentScale="appState.currentScale"
      @updateKeyType="updateKeyType"
      @updateScaleType="updateScaleType"
      @updateNoteRange="updateNoteRange"
      @updateBpm="updateBpm"
      @updateVolume="updateVolume"
      @updatePlayChords="updatePlayChords"
      @togglePlayback="togglePlayback"
      @stopPlayback="stopPlayback"
      @clearSelection="clearSelection"
      @updateStartKey="updateStartKey"
      @updateEndKey="updateEndKey"
      @resetDefaults="resetDefaults"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import PianoKeyboard from './components/PianoKeyboard.vue';
import ControlPanel from './components/ControlPanel.vue';
import type { AppState } from './types';

const appState = reactive<AppState>({
  startKey: 33,
  endKey: 45,
  isPlaying: false,
  isPaused: false,
  currentPlayingKey: null,
  currentPlayingKeys: [],
  keyType: 'major',
  scaleType: 'scales',
  noteRange: 5,
  playChords: true,
  bpm: 120,
  volume: 0.75,
  currentScale: '',
  pausedKeyIndex: null,
  pausedNoteIndex: null,
});

const handleKeyClick = (keyNumber: number) => {
  if (appState.startKey === null) {
    appState.startKey = keyNumber;
    appState.endKey = null;
  } else if (appState.endKey === null && keyNumber !== appState.startKey) {
    appState.endKey = keyNumber;
  } else {
    appState.startKey = keyNumber;
    appState.endKey = null;
  }
};

const updateKeyType = (keyType: KeyType) => {
  appState.keyType = keyType;
};

// ... other event handlers
</script>
```

### Audio Service Usage

```typescript
import { audioService } from './services/audioService';
import { getScale } from './utils/musicTheory';

// Play a C major scale
const cMajorScale = getScale('major', 'scales', 'C', 4);
const frequencies = cMajorScale.map(note => {
  const key = pianoKeys.find(k => k.keyNumber === note.keyNumber);
  return key ? key.frequency : 0;
});

await audioService.playSequence(frequencies, 120);
```

### Music Theory Usage

```typescript
import { 
  getMajorScale, 
  getMinorArpeggio, 
  getChord,
  generatePianoKeys 
} from './utils/musicTheory';

// Generate piano keys
const pianoKeys = generatePianoKeys();

// Get scales and arpeggios
const cMajorScale = getMajorScale('C', 4);
const aMinorArpeggio = getMinorArpeggio('A', 4);
const fMajorChord = getChord('major', 'F', 4);

console.log('C Major Scale:', cMajorScale);
console.log('A Minor Arpeggio:', aMinorArpeggio);
console.log('F Major Chord:', fMajorChord);
```

### Settings Persistence

```typescript
import { cookieService } from './services/cookieService';

// Save user settings
const settings = {
  keyType: 'major',
  scaleType: 'scales',
  noteRange: 5,
  startKey: 33,
  endKey: 45,
  bpm: 120,
  volume: 0.75,
  playChords: true
};

cookieService.saveSettings(settings);

// Load settings on app startup
const savedSettings = cookieService.loadSettings();
if (savedSettings) {
  // Apply saved settings to app state
  Object.assign(appState, savedSettings);
}
```

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Audio Context**: Requires user interaction before audio playback
- **CSS Features**: Uses modern CSS features like Grid, Flexbox, and CSS Variables
- **JavaScript**: ES2020+ features supported

## Performance Considerations

- Piano keys are cached after first generation
- Audio samples are preloaded on service initialization
- Settings are debounced to prevent excessive cookie writes
- Audio playback is non-blocking for UI responsiveness

## Error Handling

- Audio service gracefully handles failed sample loading
- Cookie service includes validation for loaded settings
- Component event handlers include error boundaries
- Network errors are logged but don't crash the application

## Accessibility

- Keyboard navigation support for all interactive elements
- ARIA labels and roles for screen readers
- High contrast visual states for different key types
- Focus indicators for all clickable elements