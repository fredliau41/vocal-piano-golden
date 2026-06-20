<template>
    <div class="control-panel">
        <button class="reset-btn" @click="$emit('resetDefaults')" title="Reset to defaults">
            &#x21bb;
        </button>
        <div class="controls-row">
            <div class="control-group">
                <label>Key & Scale Type</label>
                <div class="key-scale-container">
                    <select :value="keyType" @change="handleKeyTypeChange" class="mode-select" style="margin-bottom: 0px;">
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                    </select>
                    <select :value="scaleType" @change="handleScaleTypeChange" class="mode-select">
                        <option value="scales">Scales</option>
                        <option value="arpeggios">Arpeggios</option>
                        <option value="chromatic">Chromatic</option>
                    </select>
                </div>
            </div>

            <div class="control-group">
                <label>Note Range</label>
                <div class="range-chords-container">
                    <select :value="noteRange" @change="handleNoteRangeChange" class="mode-select">
                        <option :value="3">3 Notes</option>
                        <option :value="5">5 Notes</option>
                        <option :value="8">8 Notes</option>
                    </select>
                    <div class="toggle-row">
                        <label class="toggle-label">
                            <input type="checkbox" :checked="playChords" @change="togglePlayChords" />
                            Chords
                        </label>
                        <label class="toggle-label">
                            <input type="checkbox" :checked="reverseSelection" @change="toggleReverseSelection" />
                            Reverse
                        </label>
                    </div>
                </div>
            </div>

            <div class="control-group">
                <label for="bpm">Tempo: {{ bpm }} BPM</label>
                <div class="slider-container">
                    <input id="bpm" type="range" min="40" max="400" :value="bpm" @input="handleBpmChange" class="slider"
                        style="margin-bottom: 2px;">
                    <div class="presets" style="margin-top: 5px;">
                        <button v-for="preset in bpmPresets" :key="preset" @click="$emit('updateBpm', preset)"
                            :class="['preset-btn', { active: bpm === preset }]">
                            {{ preset }}
                        </button>
                    </div>
                </div>
                <div class="slider-container" style="margin-top: px;">
                    <label for="volume" style=" color: #aaa; margin-bottom: 0; display: block;">
                        <span>Volume</span>
                        <span style="margin-left: 6px;">{{ Math.round(volume * 100) }}%</span>
                    </label>
                    <input id="volume" type="range" min="0" max="1" step="0.01" :value="volume"
                        @input="handleVolumeChange" class="slider">
                </div>
            </div>

            <div class="control-group">
                <label>Controls</label>
                <div class="playback-controls">
                    <div class="playback-row">
                        <button :class="['control-btn play-btn', { disabled: !canPlay }]" @click="$emit('togglePlayback')"
                            :disabled="!canPlay">
                            {{ isPlaying ? 'Pause' : (isPaused ? 'Resume' : 'Play') }}
                        </button>
                        <button class="control-btn stop-btn" @click="$emit('stopPlayback')"
                            :disabled="!isPlaying && !isPaused">
                            Stop
                        </button>
                    </div>
                    <div class="playback-row">
                        <button :class="['control-btn play-btn', { active: repeatCurrent }]" @click="$emit('toggleRepeat')"
                            :disabled="!canPlay" title="Repeat current pattern">
                            {{ repeatCurrent ? 'Repeat: On' : 'Repeat: Off' }}
                        </button>
                    </div>
                </div>
            </div>

            <div class="control-group">
                <label>Key Range</label>
                <div class="key-range">
                    <div class="key-range-grid">
                        <!-- Top row: Start (left) and Clear (right) -->
                        <div class="key-display">
                            <span class="key-label">Start:</span>
                            <input type="text" :class="['key-input', { set: startKey }]"
                                :value="startKey ? getKeyLabel(startKey) : ''" @input="handleStartKeyInput"
                                @blur="handleStartKeyBlur" placeholder="C4" maxlength="4" />
                        </div>
                        <div class="clear-container" style="margin-bottom: 4px;">
                            <button class="clear-btn" @click="$emit('clearSelection')" :disabled="!startKey && !endKey">
                                Clear
                            </button>
                        </div>

                        <!-- Bottom row: End (left) and empty space (right) -->
                        <div class="key-display">
                            <span class="key-label">End:</span>
                            <input type="text" :class="['key-input', { set: endKey }]"
                                :value="endKey ? getKeyLabel(endKey) : ''" @input="handleEndKeyInput"
                                @blur="handleEndKeyBlur" placeholder="C5" maxlength="4" />
                        </div>
                        <div class="empty-space"></div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="currentScale" class="current-scale-section">
            <div class="current-scale">
                <span class="scale-label">Now Playing:</span>
                <span class="scale-name">{{ currentScale }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { generatePianoKeys } from '../utils/musicTheory';
import type { KeyType, ScaleType, NoteRange } from '../types';

interface Props {
    keyType: KeyType;
    scaleType: ScaleType;
    noteRange: NoteRange;
    playChords: boolean;
    reverseSelection: boolean;
    repeatCurrent: boolean;
    startKey: number | null;
    endKey: number | null;
    bpm: number;
    volume: number;
    isPlaying: boolean;
    isPaused: boolean;
    currentScale: string;
}

interface Emits {
    (e: 'updateKeyType', keyType: KeyType): void;
    (e: 'updateScaleType', scaleType: ScaleType): void;
    (e: 'updateNoteRange', noteRange: NoteRange): void;
    (e: 'updateBpm', bpm: number): void;
    (e: 'updateVolume', volume: number): void;
    (e: 'updatePlayChords', value: boolean): void;
    (e: 'updateReverseSelection', value: boolean): void;
    (e: 'toggleRepeat'): void;
    (e: 'togglePlayback'): void;
    (e: 'stopPlayback'): void;
    (e: 'clearSelection'): void;
    (e: 'updateStartKey', key: number): void;
    (e: 'updateEndKey', key: number): void;
    (e: 'resetDefaults'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const bpmPresets = [60, 90, 120, 140];

const pianoKeys = computed(() => generatePianoKeys());

const canPlay = computed(() => {
    return props.startKey !== null && props.endKey !== null;
});

const getKeyLabel = (keyNumber: number): string => {
    const key = pianoKeys.value.find(k => k.keyNumber === keyNumber);
    return key ? `${key.note}${key.octave}` : '';
};

const parseKeyInput = (input: string): number | null => {
    const upperInput = input.toUpperCase().trim();
    if (!upperInput) return null;

    // Convert # to ♯ for consistency with display format
    const normalizedInput = upperInput.replace('#', '♯');

    // Find matching key by note and octave
    const key = pianoKeys.value.find(k => `${k.note}${k.octave}` === normalizedInput);
    return key ? key.keyNumber : null;
};

const handleKeyTypeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit('updateKeyType', target.value as KeyType);
};

const handleScaleTypeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit('updateScaleType', target.value as ScaleType);
};

const handleNoteRangeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit('updateNoteRange', parseInt(target.value) as NoteRange);
};

const handleBpmChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('updateBpm', parseInt(target.value));
};

const handleVolumeChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('updateVolume', parseFloat(target.value));
};

const handleStartKeyInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    target.value = target.value.toUpperCase().replace('#', '♯');
};

const handleEndKeyInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    target.value = target.value.toUpperCase().replace('#', '♯');
};

const handleStartKeyBlur = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const keyNumber = parseKeyInput(target.value);
    if (keyNumber !== null) {
        emit('updateStartKey', keyNumber);
    } else if (target.value.trim()) {
        // Invalid input, revert to current value
        target.value = props.startKey ? getKeyLabel(props.startKey) : '';
    }
};

const handleEndKeyBlur = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const keyNumber = parseKeyInput(target.value);
    if (keyNumber !== null) {
        emit('updateEndKey', keyNumber);
    } else if (target.value.trim()) {
        // Invalid input, revert to current value
        target.value = props.endKey ? getKeyLabel(props.endKey) : '';
    }
};

const togglePlayChords = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('updatePlayChords', target.checked);
};

const toggleReverseSelection = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('updateReverseSelection', target.checked);
};
</script>

<style scoped>
.control-panel {
    background: #1a1a1a;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.05);
    border: 1px solid #2a1a00;
    color: #e0e0e0;
    margin: 20px 0;
    max-width: 1200px;
    width: 100%;
    position: relative;
}

.controls-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 30px;
    align-items: start;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 16.5px;
    padding-top: 1.1px;
}

.control-group label {
    font-size: 19.6px;
    font-weight: 600;
    color: #D4AF37;
    margin-bottom: 4px;
}

.key-scale-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.range-chords-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.mode-select {
    padding: 8px 12px;
    border: 2px solid #444;
    border-radius: 8px;
    background: #0d0d0d;
    color: #e0e0e0;
    font-size: 19.6px;
    cursor: pointer;
    transition: all 0.2s ease;
    max-width: 200px;
}

.mode-select:focus {
    outline: none;
    border-color: #D4AF37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
}

.toggle-row {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 14px;
}

.toggle-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16.8px;
    color: #aaa;
    cursor: pointer;
}

.toggle-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #D4AF37;
    /* Customize checkbox color */
}

.key-range {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.key-range-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 8.8px clamp(6px, 2vw, 13px);
    padding: 0px 1px;
    align-items: start;
    padding-top: 7px;
}

.clear-container {
    display: flex;
    justify-content: flex-start;
    align-items:  flex-start;
    padding-left: clamp(20px, 30vw, 35px);
}



.key-display {
    display: flex;
    align-items: center;
    gap: 1px;
    min-width: 0;
    max-width: 100%;
    flex-shrink: 1;
    justify-self: start;
}

.key-label {
    font-size: 16.8px;
    color: #aaa;
    min-width: 40px;
    padding-right: clamp(25.2px, 10vw, 51px);
    flex-shrink: 1;
    display: inline-block;
    text-align: left;
}

.key-input {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d0d0d;
    border: 1px solid #444;
    border-radius: 4px;
    font-size: 16.8px;
    font-weight: 500;
    color: #aaa;
    width: auto;
    min-width: 53px;
    max-width: calc(100% - 46px);
    text-align: center;
    box-sizing: border-box;
    height: 31px;
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 2px 6px;
    outline: none;
    transition: all 0.2s ease;
    text-transform: uppercase;
}

.key-input:focus {
    border-color: #D4AF37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.15);
}

.key-input.set {
    background: #2a1a00;
    color: #D4AF37;
    border-color: #D4AF37;
}

.key-input::placeholder {
    color: #555;
    text-transform: none;
    font-size: 14px;
}

.key-value {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d0d0d;
    border-radius: 4px;
    font-size: 16.8px;
    font-weight: 500;
    color: #aaa;
    width: auto;
    min-width: 50px;
    max-width: calc(100% - 46px);
    text-align: center;
    box-sizing: border-box;
    height: 30px;
    line-height: 20px;
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 6px;
}

.key-value.set {
    background: #2a1a00;
    color: #D4AF37;
}

.clear-btn {
    padding: 4px 7.5px;
    background: #0d0d0d;
    border: 1px solid #444;
    color: #ccc;
    border-radius: 6px;
    font-size: 16.8px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: fit-content;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.clear-btn:hover:not(:disabled) {
    background: #2a1a00;
    border-color: #D4AF37;
}

.clear-btn:disabled {
    opacity: 0.3;
    cursor: default;
}

.slider-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #333;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #D4AF37;
    cursor: pointer;
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
}

.slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #D4AF37;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
}

.presets {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.preset-btn {
    padding: 2px 4px;
    background: #0d0d0d;
    border: 1px solid #444;
    color: #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 15.4px;
    min-width: 45px;
}

.preset-btn:hover {
    background: #2a1a00;
    border-color: #D4AF37;
}

.preset-btn.active {
    background: #D4AF37;
    color: #0a0a0a;
    border-color: #D4AF37;
}

.playback-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.control-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 19.6px;
    flex: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.playback-row {
    display: flex;
    gap: 8px;
}

.play-btn {
    background: #D4AF37;
    color: #0a0a0a;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.play-btn.active {
    background: #B8860B;
    color: #D4AF37;
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.3);
}

.play-btn:hover:not(:disabled) {
    background: #D4AF37;
    transform: translateY(-1px);
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
}

.play-btn.disabled {
    background: #333;
    color: #666;
    cursor: default;
}

.stop-btn {
    background: #1a0800;
    color: #FF8C00;
    border: 1px solid #FF8C00;
}

.stop-btn:hover:not(:disabled) {
    background: #2a0a00;
    transform: translateY(-1px);
}

.stop-btn:disabled {
    background: #333;
    color: #666;
    cursor: default;
    border: 1px solid #444;
}

.reset-btn {
    position: absolute;
    top: 14px;
    right: 20px;
    background: transparent;
    border: none;
    color: #aaa;
    font-size: 20px;
    cursor: pointer;
    padding: 2px;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 10;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    outline: none;
    box-shadow: none;
}

.reset-btn:hover:not(:disabled) {
    opacity: 1;
    transform: rotate(90deg);
    color: #D4AF37;
}

.reset-btn:disabled {
    opacity: 0.3;
    cursor: default;
}

.current-scale-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #333;
}

.current-scale {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #2a1a00 0%, #3a2a00 100%);
    border-radius: 12px;
    border: 1px solid #D4AF37;
}

.scale-label {
    font-size: 22.4px;
    font-weight: 500;
    color: #D4AF37;
}

.scale-name {
    font-size: 25.2px;
    font-weight: 700;
    color: #D4AF37;
}

@media (max-width: 1024px) {
    .controls-row {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 22px;

    }
}

@media (max-width: 768px) {

    .control-panel {
        padding: 20px;
    }

    .controls-row {
        grid-template-columns: fr;
        gap: 25px;
    }

    .playback-controls {
        flex-direction: column;
    }

    .control-btn {
        width: 100%;
    }

    .current-scale {
        flex-direction: column;
        gap: 8px;
    }
}
</style>
