<template>
    <div class="piano-keyboard" ref="keyboardContainer">
      <div class="keys-container">
        <PianoKey
          v-for="key in pianoKeys"
          :key="key.keyNumber"
          :keyData="key"
          :state="getKeyState(key.keyNumber)"
          @keyClick="handleKeyClick"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref, onMounted, nextTick } from 'vue';
  import PianoKey from './PianoKey.vue';
  import { generatePianoKeys } from '../utils/musicTheory';
  import { audioService } from '../services/audioService';
  import type { KeyState } from '../types';
  
  interface Props {
    startKey: number | null;
    endKey: number | null;
    currentPlayingKey: number | null;
    currentPlayingKeys: number[];
  }
  
  interface Emits {
    (e: 'keyClick', keyNumber: number): void;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();
  
  const keyboardContainer = ref<HTMLElement>();
  const pianoKeys = computed(() => generatePianoKeys());
  
  const getKeyState = (keyNumber: number): KeyState => {
    if (props.currentPlayingKey === keyNumber) return 'playing';
    if (props.currentPlayingKeys && props.currentPlayingKeys.includes(keyNumber)) return 'playing';
    if (props.startKey === keyNumber) return 'start';
    if (props.endKey === keyNumber) return 'end';
    return 'default';
  };
  
  const handleKeyClick = async (keyNumber: number) => {
    // Immediately emit for instant visual feedback
    emit('keyClick', keyNumber);
    
    // Handle audio asynchronously in background
    const key = pianoKeys.value.find(k => k.keyNumber === keyNumber);
    if (key) {
      // Play the note without blocking UI
      audioService.playNote(key.frequency, 0.5).catch(error => {
        console.error('Error playing note:', error);
      });
    }
  };
  
  const scrollToCenter = () => {
    if (!keyboardContainer.value) return;
    
    // Get total scrollable width
    const scrollWidth = keyboardContainer.value.scrollWidth;
    const containerWidth = keyboardContainer.value.clientWidth;
    
    // Calculate position 20% closer to the right from center
    const centerPosition = (scrollWidth - containerWidth) / 2 * 1.1;
    
    keyboardContainer.value.scrollLeft = centerPosition;
  };
  
  onMounted(async () => {
    await nextTick();
    scrollToCenter();
  });
  </script>
  
  <style scoped>
  .piano-keyboard {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(30, 41, 59, 0.08);
    border: 1px solid #e2e8f0;
    overflow-x: auto;
    margin: 20px auto;
    max-width: 1200px;
    width: 100%;
    scroll-behavior: smooth;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  .keys-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    width: fit-content;
    position: relative;
    margin: 0 auto;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  @media (max-width: 768px) {
    .piano-keyboard {
      padding: 15px 10px;
      max-width: 100%;
    }
    
    .keys-container {
      width: fit-content;
    }
  }
  </style>