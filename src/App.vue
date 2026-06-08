<template>
    <div class="app">
      <header class="app-header">
        <h1 style="font-size: 3.2rem; line-height: 1.1;">Vocal Keys</h1>
        <p>Interactive online piano accompaniment for vocal exercises, warm ups and singing practices</p>
      </header>
  
      <main class="app-main" style="padding-top: 0px;">
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
          :reverseSelection="appState.reverseSelection"
          :repeatCurrent="appState.repeatCurrent"
          :isPlaying="appState.isPlaying"
          :isPaused="appState.isPaused"
          :currentScale="appState.currentScale"
          @updateKeyType="updateKeyType"
          @updateScaleType="updateScaleType"
          @updateNoteRange="updateNoteRange"
          @updateBpm="updateBpm"
          @updateVolume="updateVolume"
          @updatePlayChords="updatePlayChords"
          @updateReverseSelection="updateReverseSelection"
          @toggleRepeat="toggleRepeat"
          @togglePlayback="togglePlayback"
          @stopPlayback="stopPlayback"
          @clearSelection="clearSelection"
          @updateStartKey="updateStartKey"
          @updateEndKey="updateEndKey"
          @resetDefaults="resetDefaults"
        />
  
        <div class="instructions">
          <h3>How to use:</h3>
          <ol>
            <li>Choose a key type: <strong>Major</strong> or <strong>Minor</strong></li>
            <li>Select a mode: <strong>Scales</strong>, <strong>Arpeggio</strong>, or <strong>Chromatic</strong></li>
            <li>Pick a range: <strong>3-note</strong>, <strong>5-note</strong> or <strong>8-note</strong> warmup</li>
            <li>Set the key range:</li>
            <ul>
              <li>Click a piano key for <strong>Start Note</strong> (blue highlight)</li>
              <li>Click another for <strong>End Note</strong> (green highlight)</li>
            </ul>
            <li>Set your tempo: Use the slider or preset BPM buttons</li>
            <li>Press <strong>Play</strong>: Warm up Scales and Arpeggios will be played chromatically from start to end key</li>
          </ol>
          <!-- <p class="tip">💡 <strong>Tip:</strong> 
          The app will play each scale/arpeggio 
          chromatically, highlighting each note 
          in yellow as it plays.</p> -->
        </div>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue';
import { useHead } from '@vueuse/head';
import PianoKeyboard from './components/PianoKeyboard.vue';
import ControlPanel from './components/ControlPanel.vue';
import { generatePianoKeys } from './utils/musicTheory';
import { PlaybackBuilder } from './utils/playbackBuilder';
import { audioService } from './services/audioService';
import { cookieService, type UserSettings } from './services/cookieService';
import type { AppState, KeyType, ScaleType, NoteRange, ScaleNote } from './types';


//////////////////////////
// Set up SEO metadata //
//////////////////////////

useHead({
  title: '🎹 Vocal Keys - Piano Warm Up Accompaniment for Singers',
  meta: [
    { name: 'description', content: 'Interactive piano built for vocal exercises, warmups, and singing practices.  Great for singer, vocalists, vocal coaches, and warm-up routines. The one and only Vocal Piano Online' },
    { name: 'keywords', content: 'vocal piano online, singing piano, piano warm up, vocal warm up piano,  warm up for singers, piano for singers, vocal warm up tool' },
    { property: 'og:title', content: '🎹 Vocal Keys - Piano Warm Up Accompaniment for Singers' },
    { property: 'og:description', content: 'Free online vocal piano tool for singers. Practice with custom scales, arpeggios, and warm ups for your voice.' },
    { property: 'og:type', content: 'website' }
  ]
});
  
  // Centralised defaults for the application state. Update these values once
  // and both the initial state and the reset behaviour will follow.
  const defaultAppState: AppState = {
    startKey: 33, // A3
    endKey: 45,   // C5
    isPlaying: false,
    isPaused: false,
    currentPlayingKey: null,
    currentPlayingKeys: [],
    keyType: 'major',
    scaleType: 'scales',
    noteRange: 5,
    playChords: true,
    reverseSelection: false,
    repeatCurrent: false,
    bpm: 120,
    volume: 0.75,
    currentScale: '',
    // Pause/resume state
    pausedKeyIndex: null,
    pausedNoteIndex: null,
  };
  
  const appState = reactive<AppState>({ ...defaultAppState });
  
  const playbackTimeout = ref<number | null>(null);
const pianoKeys = generatePianoKeys();

// Load settings from cookies on mount
onMounted(() => {
  const savedSettings = cookieService.loadSettings();
  if (savedSettings) {
    appState.keyType = savedSettings.keyType;
    appState.scaleType = savedSettings.scaleType;
    appState.noteRange = savedSettings.noteRange;
    appState.startKey = savedSettings.startKey;
    appState.endKey = savedSettings.endKey;
    appState.bpm = savedSettings.bpm;
    appState.volume = savedSettings.volume;
    appState.playChords = savedSettings.playChords;
      appState.repeatCurrent = savedSettings.repeatCurrent ?? false;
      appState.reverseSelection = savedSettings.reverseSelection ?? false;
    
    // Apply volume to audio service
    audioService.setVolume(savedSettings.volume);
  }
});

// Watch for changes in settings and save to cookies
watch(
  () => ({
    keyType: appState.keyType,
    scaleType: appState.scaleType,
    noteRange: appState.noteRange,
    startKey: appState.startKey,
    endKey: appState.endKey,
    bpm: appState.bpm,
    volume: appState.volume,
    playChords: appState.playChords,
      repeatCurrent: appState.repeatCurrent,
      reverseSelection: appState.reverseSelection,
  }),
  (newSettings: UserSettings) => {
    cookieService.saveSettings(newSettings);
  },
  { deep: true }
);
  
  const handleKeyClick = (keyNumber: number) => {
    if (appState.isPlaying) return;

    if (appState.startKey === null) {
      // Set start key
      appState.startKey = keyNumber;
      appState.endKey = null;
    } else if (appState.endKey === null && keyNumber !== appState.startKey) {
      // Set end key (maintain the order of selection)
      appState.endKey = keyNumber;
    } else {
      // Reset selection
      appState.startKey = keyNumber;
      appState.endKey = null;
    }
    
    // Reset pause state when key selection changes
    appState.isPaused = false;
    appState.pausedKeyIndex = null;
    appState.pausedNoteIndex = null;
  };
  
  const updateKeyType = (keyType: KeyType) => {
    if (appState.isPlaying) return;
    appState.keyType = keyType;
    // Reset pause state when settings change
    appState.isPaused = false;
    appState.pausedKeyIndex = null;
    appState.pausedNoteIndex = null;
  };

  const updateScaleType = (scaleType: ScaleType) => {
    if (appState.isPlaying) return;
    appState.scaleType = scaleType;
    // Reset pause state when settings change
    appState.isPaused = false;
    appState.pausedKeyIndex = null;
    appState.pausedNoteIndex = null;
  };

  const updateNoteRange = (noteRange: NoteRange) => {
    if (appState.isPlaying) return;
    appState.noteRange = noteRange;
    // Reset pause state when settings change
    appState.isPaused = false;
    appState.pausedKeyIndex = null;
    appState.pausedNoteIndex = null;
  };
  
  const updateBpm = (bpm: number) => {
    appState.bpm = bpm;
  };
  
  const updateVolume = (volume: number) => {
    appState.volume = volume;
    audioService.setVolume(volume);
  };

  const updatePlayChords = (value: boolean) => {
    appState.playChords = value;
  };

  const updateReverseSelection = (value: boolean) => {
    appState.reverseSelection = value;
  };
  
  const toggleRepeat = () => {
    appState.repeatCurrent = !appState.repeatCurrent;
  };
  
  const clearSelection = () => {
    if (appState.isPlaying) return;
    appState.startKey = null;
    appState.endKey = null;
    // Reset pause state when selection changes
    appState.isPaused = false;
    appState.pausedKeyIndex = null;
    appState.pausedNoteIndex = null;
  };

  const updateStartKey = (keyNumber: number) => {
    if (appState.isPlaying) return;
    appState.startKey = keyNumber;
    // Reset pause state when key range changes
    appState.isPaused = false;
    appState.pausedKeyIndex = null;
    appState.pausedNoteIndex = null;
  };

  const updateEndKey = (keyNumber: number) => {
    if (appState.isPlaying) return;
    appState.endKey = keyNumber;
    // Reset pause state when key range changes
    appState.isPaused = false;
    appState.pausedKeyIndex = null;
    appState.pausedNoteIndex = null;
  };

  const togglePlayback = async () => {
    if (appState.isPlaying) {
      pausePlayback();
    } else {
      await startPlayback();
    }
  };
  
  const startPlayback = async () => {
    if (appState.startKey === null || appState.endKey === null) return;

    appState.isPlaying = true;
    
    // If not resuming from pause, reset the scale display
    if (!appState.isPaused) {
      appState.currentScale = '';
    }
    
    // Clear pause state when starting playback
    const wasResuming = appState.isPaused;
    appState.isPaused = false;

    try {
      // Build the progression using the builder pattern
      const builder = new PlaybackBuilder({
        keyType: appState.keyType,
        scaleType: appState.scaleType,
        noteRange: appState.noteRange,
        startKey: appState.startKey,
        endKey: appState.endKey,
        includeChords: appState.playChords,
        reverseSelection: appState.reverseSelection,
      });
      const progression = builder.build();

      // Determine starting points based on pause state
      const startKeyIndex = wasResuming && appState.pausedKeyIndex !== null
        ? appState.pausedKeyIndex
        : 0;

      for (let i = startKeyIndex; i < progression.entries.length; i++) {
        if (!appState.isPlaying) break;

        const entry = progression.entries[i];
        appState.currentScale = entry.displayName;
        const notes: ScaleNote[] = entry.notes;
        const noteFrequencies: number[] = entry.noteFrequencies;

        // Determine starting note index based on pause state
        const startNoteIndex = (wasResuming && appState.pausedKeyIndex === i && appState.pausedNoteIndex !== null)
          ? appState.pausedNoteIndex
          : 0;

        // Play each note in the scale/arpeggio
        for (let j = startNoteIndex; j < notes.length; j++) {
          if (!appState.isPlaying) {
            // Store pause position - we haven't played this note yet
            appState.pausedKeyIndex = i;
            appState.pausedNoteIndex = j;
            return;
          }

          const note = notes[j];
          appState.currentPlayingKey = note.keyNumber;
          appState.currentPlayingKeys = [note.keyNumber];

          // Store current position (will be used if pause happens during this note)
          appState.pausedKeyIndex = i;
          appState.pausedNoteIndex = j + 1 < notes.length ? j + 1 : 0; // Next note, or start of next key

          // If we're at the last note of this key, prepare for next key
          if (j + 1 >= notes.length && i + 1 < progression.entries.length) {
            appState.pausedKeyIndex = i + 1;
            appState.pausedNoteIndex = 0;
          }

          const noteKey = pianoKeys.find(k => k.keyNumber === note.keyNumber);
          if (noteKey) {
            // Determine beats for this note (2 beats if last note before chord transition)
            const isLastNote = appState.playChords && j === notes.length - 1 && i < progression.entries.length - 1;
            const beatsForNote = isLastNote ? 2 : 1;
            const noteDuration = (60 / appState.bpm) * 0.8 * beatsForNote;
            const totalDuration = (60 / appState.bpm) * beatsForNote;

            // Play the note
            // Use precomputed frequency if available, fallback to lookup
            const freq = noteFrequencies[j] ?? noteKey.frequency;
            audioService.playNote(freq, noteDuration, appState.volume);

            // Wait for the full beat(s) duration
            await new Promise<void>(resolve => {
              playbackTimeout.value = setTimeout(resolve, totalDuration * 1000);
            });

            // Check if paused after the timeout
            if (!appState.isPlaying) {
              return;
            }
          }
        }

        // Transition between keys: either play chords or short pause
        if (appState.isPlaying && (appState.repeatCurrent || i < progression.entries.length - 1)) {
          if (appState.playChords) {
            const currentFreqs = entry.currentChordFreqs ?? [];
            const nextEntry = appState.repeatCurrent ? entry : progression.entries[i + 1];
            const nextFreqs = appState.repeatCurrent
              ? (entry.currentChordFreqs ?? entry.nextChordFreqs ?? [])
              : (nextEntry.currentChordFreqs ?? nextEntry.nextChordFreqs ?? []);

            // Clear single-note highlight before chord playback
            appState.currentPlayingKey = null;
            appState.currentPlayingKeys = (entry.currentChord ?? []).map(n => n.keyNumber);
            await audioService.playChord(currentFreqs, 2, appState.bpm, appState.volume);
            appState.currentPlayingKeys = (nextEntry.currentChord ?? nextEntry.nextChord ?? []).map(n => n.keyNumber);
            if (!appState.isPlaying) return; // In case playback was stopped during chord

            await audioService.playChord(nextFreqs, 4, appState.bpm, appState.volume);
            // Clear chord highlight after playing
            appState.currentPlayingKeys = [];

            if (!appState.isPlaying) return;
          } else {
            // Fallback: maintain the tiny pause
            appState.currentPlayingKeys = [];
            await new Promise<void>(resolve => {
              playbackTimeout.value = setTimeout(resolve, 200);
            });
          }
        }

        // If repeat is enabled, loop the same entry indefinitely until toggled off or stopped
        if (appState.isPlaying && appState.repeatCurrent) {
          // Step back the loop counter to replay the same index
          i -= 1;
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
    } finally {
      // If we completed the sequence, reset everything
      if (appState.isPlaying && !appState.repeatCurrent) {
        stopPlayback();
      }
    }
  };

  const pausePlayback = () => {
    appState.isPlaying = false;
    appState.isPaused = true;
    appState.currentPlayingKey = null;
    appState.currentPlayingKeys = [];
    
    if (playbackTimeout.value) {
      clearTimeout(playbackTimeout.value);
      playbackTimeout.value = null;
    }
    
    audioService.stopAll();
  };

  const stopPlayback = () => {
    appState.isPlaying = false;
    appState.isPaused = false;
    appState.currentPlayingKey = null;
    appState.currentPlayingKeys = [];
    appState.currentScale = '';
    // Reset pause position
    appState.pausedKeyIndex = null;
    appState.pausedNoteIndex = null;
    
    if (playbackTimeout.value) {
      clearTimeout(playbackTimeout.value);
      playbackTimeout.value = null;
    }
    
    audioService.stopAll();
  };

  const resetDefaults = () => {
    if (appState.isPlaying) {
      stopPlayback();
    }
    // Restore every field to its default value in one go.
    Object.assign(appState, { ...defaultAppState });

    // Ensure the audio service volume reflects the reset state.
    audioService.setVolume(appState.volume);
  };
  </script>
  
  <style scoped>
  .app {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 22px;
  }
  
  .app-header {
    text-align: center;
    color: #1e293b;
    margin-bottom: 30px;
  }
  
  .app-header h1 {
    font-size: 2.75rem;
    font-weight: 700;
    margin: 0 0 11px 0;
    text-shadow: 0 2px 4px rgba(30, 41, 59, 0.1);
  }
  
  .app-header p {
    font-size: 1.85rem;
    opacity: 0.9;
    margin: 0;
    font-weight: 300;
    color: #475569;
  }
  
  .app-main {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .app-piano {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .instructions {
    background: white;
    padding: 26.4px;
    border-radius: 17.6px;
    margin-top: 33px;
    box-shadow: 0 4px 20px rgba(30, 41, 59, 0.08);
    border: 1px solid #e2e8f0;
    max-width: 880px;
    width: 100%;
  }
  
  .instructions h3 {
    color: #1e293b;
    margin: 0 0 17.6px 0;
    font-size: 1.925rem;
    font-weight: 600;
  }
  
  .instructions ol {
    color: #475569;
    margin: 0 0 17.6px 0;
    padding-left: 22px;
    font-size: 1.54rem;
  }
  
  .instructions li {
    margin-bottom: 8.8px;
    line-height: 1.6;
  }
  
  .instructions strong {
    color: #1e40af;
    font-weight: 600;
  }
  
  .tip {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    padding: 13.2px 17.6px;
    border-radius: 8.8px;
    border-left: 4px solid #1e40af;
    color: #1e40af;
    margin: 0;
    font-weight: 500;
    font-size: 1.54rem;
  }
  
  @media (max-width: 768px) {
    .app {
      padding: 11px;
    }
    
    .app-header h1 {
      font-size: 2.2rem;
    }
    
    .app-header p {
      font-size: 1.5rem;
      line-height: 1.3;
      max-width: 95%;
      margin: 0 auto;
    }
    
    .instructions {
      padding: 17.6px;
      margin-top: 22px;
    }
  }
  </style>