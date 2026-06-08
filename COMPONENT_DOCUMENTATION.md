# Component Documentation

## Overview

This document provides detailed information about each Vue component in the Vocal Keys application, including their purpose, props, events, and usage patterns.

## Component Hierarchy

```
App.vue (Root)
├── PianoKeyboard.vue
│   └── PianoKey.vue (multiple instances)
└── ControlPanel.vue
```

## App.vue

**Purpose**: The main application component that orchestrates the entire application state and coordinates between child components.

**Location**: `src/App.vue`

### Key Responsibilities

- Manages global application state (`AppState`)
- Coordinates between piano keyboard and control panel
- Handles audio playback logic
- Manages settings persistence
- Provides SEO metadata

### State Management

The component uses Vue 3's `reactive()` to manage the following state:

```typescript
interface AppState {
  startKey: number | null;        // Selected start key (1-76)
  endKey: number | null;          // Selected end key (1-76)
  isPlaying: boolean;             // Playback state
  isPaused: boolean;              // Pause state
  currentPlayingKey: number | null; // Currently playing key
  currentPlayingKeys: number[];   // Multiple playing keys (chords)
  keyType: KeyType;              // 'major' or 'minor'
  scaleType: ScaleType;          // 'scales', 'arpeggios', or 'chromatic'
  noteRange: NoteRange;          // 3, 5, or 8 notes
  playChords: boolean;           // Whether to play chord accompaniment
  bpm: number;                   // Tempo (40-400)
  volume: number;                // Volume (0-1)
  currentScale: string;          // Current scale name
  pausedKeyIndex: number | null; // Pause state tracking
  pausedNoteIndex: number | null; // Pause state tracking
}
```

### Event Handlers

#### `handleKeyClick(keyNumber: number)`
Handles piano key clicks for setting start and end keys.

**Logic**:
1. If no start key is selected, set start key
2. If start key is selected but no end key, set end key
3. If both keys are selected, reset to new start key

**Example**:
```vue
<PianoKeyboard @keyClick="handleKeyClick" />
```

#### `updateKeyType(keyType: KeyType)`
Updates the key type (major/minor) and resets pause state.

**Example**:
```vue
<ControlPanel @updateKeyType="updateKeyType" />
```

#### `togglePlayback()`
Toggles between play, pause, and resume states with complex logic for:
- Scale/arpeggio generation
- Chromatic progression
- Audio playback coordination
- Visual feedback

#### `stopPlayback()`
Stops all playback and resets to initial state.

### Settings Persistence

The component automatically saves and loads user settings:

```typescript
// Load settings on mount
onMounted(() => {
  const savedSettings = cookieService.loadSettings();
  if (savedSettings) {
    // Apply saved settings to app state
    Object.assign(appState, savedSettings);
  }
});

// Watch for changes and save
watch(
  () => ({ keyType, scaleType, noteRange, startKey, endKey, bpm, volume, playChords }),
  (newSettings) => {
    cookieService.saveSettings(newSettings);
  },
  { deep: true }
);
```

## PianoKeyboard.vue

**Purpose**: Renders the interactive piano keyboard and manages key interactions.

**Location**: `src/components/PianoKeyboard.vue`

### Props

```typescript
interface Props {
  startKey: number | null;        // Currently selected start key
  endKey: number | null;          // Currently selected end key
  currentPlayingKey: number | null; // Key currently being played
  currentPlayingKeys: number[];   // Keys currently being played (chords)
}
```

### Events

```typescript
interface Emits {
  (e: 'keyClick', keyNumber: number): void;
}
```

### Key Features

#### Dynamic Key State Management
```typescript
const getKeyState = (keyNumber: number): KeyState => {
  if (props.currentPlayingKey === keyNumber) return 'playing';
  if (props.currentPlayingKeys && props.currentPlayingKeys.includes(keyNumber)) return 'playing';
  if (props.startKey === keyNumber) return 'start';
  if (props.endKey === keyNumber) return 'end';
  return 'default';
};
```

#### Audio Integration
```typescript
const handleKeyClick = async (keyNumber: number) => {
  // Immediate visual feedback
  emit('keyClick', keyNumber);
  
  // Background audio playback
  const key = pianoKeys.value.find(k => k.keyNumber === keyNumber);
  if (key) {
    audioService.playNote(key.frequency, 0.5).catch(error => {
      console.error('Error playing note:', error);
    });
  }
};
```

#### Responsive Scrolling
```typescript
const scrollToCenter = () => {
  if (!keyboardContainer.value) return;
  
  const scrollWidth = keyboardContainer.value.scrollWidth;
  const containerWidth = keyboardContainer.value.clientWidth;
  const centerPosition = (scrollWidth - containerWidth) / 2 * 1.1;
  
  keyboardContainer.value.scrollLeft = centerPosition;
};
```

### Usage Example

```vue
<template>
  <PianoKeyboard
    :startKey="appState.startKey"
    :endKey="appState.endKey"
    :currentPlayingKey="appState.currentPlayingKey"
    :currentPlayingKeys="appState.currentPlayingKeys"
    @keyClick="handleKeyClick"
  />
</template>
```

## PianoKey.vue

**Purpose**: Individual piano key component with interactive states and animations.

**Location**: `src/components/PianoKey.vue`

### Props

```typescript
interface Props {
  keyData: PianoKey;    // Piano key data (note, octave, frequency, etc.)
  state: KeyState;      // Visual state ('default', 'start', 'end', 'playing')
}
```

### Events

```typescript
interface Emits {
  (e: 'keyClick', keyNumber: number): void;
}
```

### Key Features

#### Dynamic CSS Classes
```typescript
const keyClasses = computed(() => [
  'piano-key',
  {
    'piano-key--black': props.keyData.isBlack,
    'piano-key--white': !props.keyData.isBlack,
    'piano-key--start': props.state === 'start',
    'piano-key--end': props.state === 'end',
    'piano-key--playing': props.state === 'playing',
    'piano-key--pressed': isPressed.value,
    'piano-key--hover': isHovered.value,
    'piano-key--mousedown': isMouseDown.value
  }
]);
```

#### Interactive States
- **Default**: Normal key appearance
- **Start**: Blue highlight for selected start key
- **End**: Green highlight for selected end key
- **Playing**: Yellow highlight with glow animation
- **Pressed**: Visual feedback when clicked
- **Hover**: Subtle highlight on mouse hover

#### Mouse Event Handling
```typescript
const handleClick = () => {
  isPressed.value = true;
  emit('keyClick', props.keyData.keyNumber);
  
  setTimeout(() => {
    isPressed.value = false;
  }, 150);
};
```

### Visual Design

#### White Keys
- Width: 40px, Height: 180px
- Gradient background: white to light gray
- Border radius on bottom corners
- Subtle shadows and borders

#### Black Keys
- Width: 28px, Height: 120px
- Gradient background: dark gray to black
- Positioned with negative margins to overlap white keys
- Higher z-index for proper layering

#### State Animations
- Smooth transitions for all state changes
- Glow effects for playing state
- Press animations with transform and shadow changes
- Hover effects with enhanced shadows

### Usage Example

```vue
<template>
  <PianoKey
    :keyData="key"
    :state="getKeyState(key.keyNumber)"
    @keyClick="handleKeyClick"
  />
</template>
```

## ControlPanel.vue

**Purpose**: Provides all user interface controls for settings and playback.

**Location**: `src/components/ControlPanel.vue`

### Props

```typescript
interface Props {
  keyType: KeyType;           // Current key type
  scaleType: ScaleType;       // Current scale type
  noteRange: NoteRange;       // Current note range
  startKey: number | null;    // Selected start key
  endKey: number | null;      // Selected end key
  bpm: number;               // Current tempo
  volume: number;            // Current volume
  playChords: boolean;       // Whether chords are enabled
  isPlaying: boolean;        // Playback state
  isPaused: boolean;         // Pause state
  currentScale: string;      // Current scale name
}
```

### Events

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

### Key Features

#### Settings Groups

1. **Key & Scale Type**
   - Key type dropdown (Major/Minor)
   - Scale type dropdown (Scales/Arpeggios/Chromatic)

2. **Note Range & Chords**
   - Note range dropdown (3/5/8 notes)
   - Chord toggle checkbox

3. **Tempo & Volume**
   - BPM slider (40-400)
   - BPM preset buttons
   - Volume slider (0-100%)

4. **Playback Controls**
   - Play/Pause/Resume button
   - Stop button
   - Dynamic button states

5. **Key Range**
   - Start key input field
   - End key input field
   - Clear selection button

#### Computed Properties

```typescript
const canPlay = computed(() => {
  return props.startKey !== null && props.endKey !== null;
});
```

#### Input Validation

```typescript
const handleStartKeyInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.toUpperCase();
  
  // Validate note format (e.g., "C4", "F#5")
  const noteMatch = value.match(/^([A-G]#?)(\d)$/);
  if (noteMatch) {
    const [, note, octave] = noteMatch;
    const keyNumber = findKeyNumber(note, parseInt(octave));
    if (keyNumber) {
      emit('updateStartKey', keyNumber);
    }
  }
};
```

#### BPM Presets
```typescript
const bpmPresets = [60, 80, 100, 120, 140, 160, 180, 200];
```

### Usage Example

```vue
<template>
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
</template>
```

## HelloWorld.vue

**Purpose**: Example component demonstrating Vue 3 composition API.

**Location**: `src/components/HelloWorld.vue`

### Props

```typescript
interface Props {
  msg: string;
}
```

### Features

- Simple counter with reactive state
- Demonstrates Vue 3 composition API
- Includes external links to Vue documentation

### Usage Example

```vue
<template>
  <HelloWorld msg="Welcome to Vocal Keys!" />
</template>
```

## Component Communication Patterns

### Parent-Child Communication

1. **Props Down**: Parent passes data to children
   ```vue
   <PianoKeyboard :startKey="appState.startKey" />
   ```

2. **Events Up**: Children emit events to parent
   ```vue
   <PianoKeyboard @keyClick="handleKeyClick" />
   ```

### State Management

- **Centralized State**: App.vue manages all application state
- **Reactive Updates**: Changes automatically propagate to all components
- **Event-Driven**: Components communicate through events

### Performance Optimizations

1. **Computed Properties**: Used for derived state
   ```typescript
   const keyClasses = computed(() => [...]);
   ```

2. **Caching**: Piano keys are cached after first generation
   ```typescript
   let cachedPianoKeys: PianoKey[] | null = null;
   ```

3. **Non-blocking Audio**: Audio playback doesn't block UI
   ```typescript
   audioService.playNote(frequency).catch(console.error);
   ```

## Styling Patterns

### CSS Classes

- **BEM Methodology**: Block-Element-Modifier
  ```css
  .piano-key--black
  .piano-key--playing
  .piano-key--hover
  ```

- **State-Based Styling**: Classes change based on component state
- **Responsive Design**: Mobile-first approach with media queries

### CSS Variables

- Consistent color scheme
- Easy theme customization
- Maintainable design system

### Animations

- **Smooth Transitions**: 0.2s cubic-bezier transitions
- **State Animations**: Glow effects for playing state
- **Hover Effects**: Enhanced shadows and transforms

## Accessibility Features

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators for all clickable elements
- Logical tab order

### Screen Reader Support

- ARIA labels for all controls
- Semantic HTML structure
- Descriptive button text

### Visual Accessibility

- High contrast color scheme
- Clear visual states for different key types
- Sufficient color contrast ratios

## Testing Considerations

### Unit Testing

- Test individual component logic
- Mock external dependencies (audio service)
- Test prop validation and event emission

### Integration Testing

- Test component interactions
- Test state management
- Test user workflows

### Visual Testing

- Test responsive design
- Test different screen sizes
- Test accessibility features

## Best Practices

### Component Design

1. **Single Responsibility**: Each component has one clear purpose
2. **Props Validation**: Use TypeScript interfaces for prop validation
3. **Event Naming**: Use descriptive event names
4. **Error Handling**: Graceful error handling in all components

### Performance

1. **Lazy Loading**: Consider lazy loading for large components
2. **Memoization**: Use computed properties for expensive calculations
3. **Event Debouncing**: Debounce frequent events like volume changes

### Maintainability

1. **Consistent Naming**: Follow Vue.js naming conventions
2. **Documentation**: Include JSDoc comments for complex methods
3. **Type Safety**: Use TypeScript for all components
4. **Code Splitting**: Organize code into logical modules