# 🎹 Vocal Keys

Interactive online piano accompaniment for vocal exercises, warm-ups, and singing practices. Built with Vue 3, TypeScript, and Tone.js.

## Features

- **Interactive 76-key Piano Keyboard** - Full-size piano with realistic key interactions
- **Real-time Audio Playback** - High-quality piano samples using Tone.js
- **Scale & Arpeggio Generation** - Major/minor scales, arpeggios, and chromatic progressions
- **Customizable Settings** - Tempo, volume, key range, and note count
- **Settings Persistence** - Automatic saving of user preferences
- **Responsive Design** - Works on desktop and mobile devices
- **Accessibility** - Keyboard navigation and screen reader support

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vocal-keys
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Basic Workflow

1. **Choose Key Type**: Select Major or Minor
2. **Select Mode**: Choose between Scales, Arpeggios, or Chromatic
3. **Set Note Range**: Pick 3, 5, or 8 notes for your warm-up
4. **Set Key Range**: 
   - Click a piano key for **Start Note** (blue highlight)
   - Click another for **End Note** (green highlight)
5. **Adjust Tempo**: Use the slider or preset BPM buttons
6. **Press Play**: The app will play scales/arpeggios chromatically from start to end key

### Advanced Features

- **Chord Playback**: Toggle chord accompaniment during scale playback
- **Volume Control**: Adjust master volume with real-time feedback
- **Pause/Resume**: Control playback state during practice
- **Settings Reset**: Return to default configuration

## Project Structure

```
src/
├── components/          # Vue components
│   ├── App.vue         # Main application component
│   ├── ControlPanel.vue # Settings and controls
│   ├── PianoKeyboard.vue # Piano keyboard container
│   ├── PianoKey.vue    # Individual piano key
│   └── HelloWorld.vue  # Example component
├── services/           # Business logic services
│   ├── audioService.ts # Audio playback management
│   └── cookieService.ts # Settings persistence
├── utils/              # Utility functions
│   └── musicTheory.ts  # Music theory calculations
├── types/              # TypeScript type definitions
│   └── index.ts        # Core type definitions
└── main.ts            # Application entry point
```

## API Documentation

For comprehensive API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Key APIs

### Audio Service
```typescript
import { audioService } from './services/audioService';

// Play a single note
await audioService.playNote(440, 0.5); // A4 for 0.5 seconds

// Play a sequence
await audioService.playSequence([261.63, 293.66, 329.63], 120);

// Play a chord
await audioService.playChord([261.63, 329.63, 392.00], 2, 120);
```

### Music Theory Utils
```typescript
import { getMajorScale, getChord } from './utils/musicTheory';

// Generate a C major scale
const cMajorScale = getMajorScale('C', 4);

// Generate a C major chord
const cMajorChord = getChord('major', 'C', 4);
```

## Browser Support

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

The project uses:
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting

### Testing

```bash
# Run tests (if configured)
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Tone.js** - Web Audio framework
- **Vue 3** - Progressive JavaScript framework
- **Salamander Piano Samples** - High-quality piano samples
- **Vite** - Fast build tool

## Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**Vocal Keys** - Making vocal practice more accessible and enjoyable! 🎵
