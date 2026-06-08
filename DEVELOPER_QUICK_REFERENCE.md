# Developer Quick Reference

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
git clone <repository-url>
cd vocal-keys
npm install
npm run dev
```

### Build Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 📁 Project Structure

```
src/
├── components/          # Vue components
│   ├── App.vue         # Main app (orchestrates everything)
│   ├── ControlPanel.vue # Settings & controls
│   ├── PianoKeyboard.vue # Piano container
│   ├── PianoKey.vue    # Individual key
│   └── HelloWorld.vue  # Example component
├── services/           # Business logic
│   ├── audioService.ts # Audio playback
│   └── cookieService.ts # Settings persistence
├── utils/              # Utilities
│   └── musicTheory.ts  # Music calculations
├── types/              # TypeScript types
│   └── index.ts        # Core types
└── main.ts            # Entry point
```

## 🎵 Key APIs

### Audio Service
```typescript
import { audioService } from './services/audioService';

// Play single note
await audioService.playNote(440, 0.5); // A4 for 0.5s

// Play sequence
await audioService.playSequence([261.63, 293.66, 329.63], 120);

// Play chord
await audioService.playChord([261.63, 329.63, 392.00], 2, 120);

// Set volume
audioService.setVolume(0.75);

// Stop all audio
audioService.stopAll();
```

### Music Theory Utils
```typescript
import { 
  getMajorScale, 
  getMinorArpeggio, 
  getChord,
  generatePianoKeys 
} from './utils/musicTheory';

// Generate piano keys
const pianoKeys = generatePianoKeys();

// Get scales/arpeggios
const cMajorScale = getMajorScale('C', 4);
const aMinorArpeggio = getMinorArpeggio('A', 4);
const fMajorChord = getChord('major', 'F', 4);
```

### Settings Persistence
```typescript
import { cookieService } from './services/cookieService';

// Save settings
cookieService.saveSettings({
  keyType: 'major',
  scaleType: 'scales',
  noteRange: 5,
  startKey: 33,
  endKey: 45,
  bpm: 120,
  volume: 0.75,
  playChords: true
});

// Load settings
const settings = cookieService.loadSettings();
```

## 🎹 Core Types

```typescript
// Piano key representation
interface PianoKey {
  note: string;        // "C", "C♯", etc.
  octave: number;      // 1-7
  keyNumber: number;   // 1-76
  isBlack: boolean;    // Black key?
  frequency: number;   // Hz
}

// Scale note
interface ScaleNote {
  note: string;
  octave: number;
  keyNumber: number;
}

// Musical types
type KeyType = 'major' | 'minor';
type ScaleType = 'scales' | 'arpeggios' | 'chromatic';
type NoteRange = 3 | 5 | 8;
type KeyState = 'default' | 'start' | 'end' | 'playing';

// App state
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
  currentPlayingKeys: number[];
  pausedKeyIndex: number | null;
  pausedNoteIndex: number | null;
}
```

## 🎯 Component Quick Reference

### App.vue
**Purpose**: Main orchestrator
**Key Methods**:
- `handleKeyClick(keyNumber)` - Handle piano key clicks
- `togglePlayback()` - Play/pause/resume
- `stopPlayback()` - Stop all playback
- `updateKeyType(keyType)` - Change major/minor
- `updateScaleType(scaleType)` - Change scales/arpeggios/chromatic

### PianoKeyboard.vue
**Props**: `startKey`, `endKey`, `currentPlayingKey`, `currentPlayingKeys`
**Events**: `keyClick`
**Key Features**: Dynamic key states, audio integration, responsive scrolling

### PianoKey.vue
**Props**: `keyData`, `state`
**Events**: `keyClick`
**States**: `default`, `start`, `end`, `playing`
**Features**: Interactive animations, hover effects, visual feedback

### ControlPanel.vue
**Props**: All app state properties
**Events**: All update events
**Features**: Settings groups, input validation, BPM presets

## 🎨 Styling Patterns

### CSS Classes
```css
/* BEM Methodology */
.piano-key--black
.piano-key--white
.piano-key--start
.piano-key--end
.piano-key--playing
.piano-key--pressed
.piano-key--hover
```

### Key Dimensions
- **White Keys**: 40px × 180px
- **Black Keys**: 28px × 120px
- **Overlap**: Black keys use negative margins

### Colors
- **Start Key**: Blue (#3b82f6)
- **End Key**: Green (#22c55e)
- **Playing**: Yellow (#fbbf24)
- **White Keys**: White to light gray gradient
- **Black Keys**: Dark gray to black gradient

## 🔧 Development Tips

### State Management
```typescript
// Use reactive for app state
const appState = reactive<AppState>({...});

// Use computed for derived state
const canPlay = computed(() => startKey && endKey);

// Use ref for DOM elements
const keyboardContainer = ref<HTMLElement>();
```

### Event Handling
```typescript
// Emit events from child to parent
const emit = defineEmits<{
  (e: 'keyClick', keyNumber: number): void;
}>();

// Handle events in parent
<PianoKeyboard @keyClick="handleKeyClick" />
```

### Audio Best Practices
```typescript
// Non-blocking audio
audioService.playNote(frequency).catch(console.error);

// Check if ready
if (audioService.ready) {
  await audioService.playNote(440);
}

// Stop all on cleanup
onUnmounted(() => {
  audioService.stopAll();
});
```

### Performance Optimization
```typescript
// Cache expensive calculations
let cachedPianoKeys: PianoKey[] | null = null;

// Use computed for derived state
const keyClasses = computed(() => [...]);
```

## 🐛 Common Issues & Solutions

### Audio Not Playing
```typescript
// Check if audio context is started
await Tone.start();

// Check if samples are loaded
if (!audioService.ready) {
  await audioService.loadingPromise;
}
```

### Piano Keys Not Rendering
```typescript
// Ensure piano keys are generated
const pianoKeys = generatePianoKeys();

// Check key state logic
const getKeyState = (keyNumber: number): KeyState => {
  if (currentPlayingKey === keyNumber) return 'playing';
  if (startKey === keyNumber) return 'start';
  if (endKey === keyNumber) return 'end';
  return 'default';
};
```

### Settings Not Persisting
```typescript
// Check cookie service
const settings = cookieService.loadSettings();
if (settings) {
  Object.assign(appState, settings);
}

// Validate settings
if (cookieService.isValidSettings(settings)) {
  // Apply settings
}
```

## 🧪 Testing

### Unit Tests
```typescript
// Test component props
expect(wrapper.props('keyType')).toBe('major');

// Test event emission
expect(wrapper.emitted('keyClick')).toBeTruthy();
expect(wrapper.emitted('keyClick')[0]).toEqual([33]);
```

### Integration Tests
```typescript
// Test user workflow
await wrapper.find('[data-test="piano-key"]').trigger('click');
expect(wrapper.vm.startKey).toBe(33);
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
  .piano-keyboard {
    padding: 15px 10px;
    max-width: 100%;
  }
}
```

### Touch Support
```typescript
// Handle touch events
@touchstart="handleTouchStart"
@touchend="handleTouchEnd"
```

## 🔒 Security Considerations

### Cookie Security
```typescript
// Use SameSite=Lax
document.cookie = `${key}=${value}; SameSite=Lax`;

// Validate loaded settings
if (isValidSettings(settings)) {
  // Apply settings
}
```

### Audio Context
```typescript
// Require user interaction
await Tone.start();
```

## 🚀 Deployment

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2020',
    outDir: 'dist'
  }
});
```

### Environment Variables
```bash
# .env
VITE_APP_TITLE=Vocal Keys
VITE_APP_VERSION=1.0.0
```

## 📚 Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tone.js Documentation](https://tonejs.github.io/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: See API_DOCUMENTATION.md
- **Examples**: See usage examples in README.md