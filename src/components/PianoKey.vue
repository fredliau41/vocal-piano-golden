<template>
  <div
    :class="keyClasses"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :style="keyStyles"
  >
    <span class="key-label">{{ keyData.note }}{{ keyData.octave }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PianoKey, KeyState } from '../types';

interface Props {
  keyData: PianoKey;
  state: KeyState;
}

interface Emits {
  (e: 'keyClick', keyNumber: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isPressed = ref(false);
const isHovered = ref(false);
const isMouseDown = ref(false);

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

const keyStyles = computed(() => {
  const baseStyles: Record<string, string> = {};
  
  if (props.keyData.isBlack) {
    baseStyles.zIndex = '2';
  }
  
  return baseStyles;
});

const handleClick = () => {
  // Provide immediate visual feedback
  isPressed.value = true;
  
  // Emit the click event immediately
  emit('keyClick', props.keyData.keyNumber);
  
  // Reset pressed state after short delay for visual feedback
  setTimeout(() => {
    isPressed.value = false;
  }, 150);
};

const handleMouseDown = () => {
  isMouseDown.value = true;
  isPressed.value = true;
};

const handleMouseUp = () => {
  isMouseDown.value = false;
  isPressed.value = false;
};

const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
  isMouseDown.value = false;
  isPressed.value = false;
};
</script>

<style scoped>
.piano-key {
  position: relative;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 0 0 4px 4px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.piano-key--white {
  width: 40px;
  height: 180px;
  background: linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%);
  border: 1px solid #ddd;
  border-top: 1px solid #ccc;
  color: #666;
}

.piano-key--black {
  width: 28px;
  height: 120px;
  background: linear-gradient(to bottom, #2a2a2a 0%, #1a1a1a 100%);
  border: 1px solid #000;
  margin-left: -14px;
  margin-right: -14px;
  color: #ccc;
}

/* Hover States */
.piano-key--white.piano-key--hover {
  background: linear-gradient(to bottom, #f0f0f0 0%, #e8e8e8 100%);
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-color: #bbb;
}

.piano-key--black.piano-key--hover {
  background: linear-gradient(to bottom, #333333 0%, #222222 100%);
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-color: #111;
}

/* Mouse Down State (Pre-press) */
.piano-key--white.piano-key--mousedown {
  background: linear-gradient(to bottom, #e8e8e8 0%, #e0e0e0 100%);
  transform: translateY(1px);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.piano-key--black.piano-key--mousedown {
  background: linear-gradient(to bottom, #222222 0%, #1a1a1a 100%);
  transform: translateY(1px);
  box-shadow: 
    0 1px 4px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Pressed States */
.piano-key--white.piano-key--pressed {
  background: linear-gradient(to bottom, #e0e0e0 0%, #d8d8d8 100%);
  transform: translateY(3px);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 3px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.piano-key--black.piano-key--pressed {
  background: linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%);
  transform: translateY(3px);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.6),
    inset 0 3px 6px rgba(0, 0, 0, 0.4);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Release Animation */
.piano-key--white:not(.piano-key--pressed):not(.piano-key--mousedown) {
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.piano-key--black:not(.piano-key--pressed):not(.piano-key--mousedown) {
  transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Special States (Start, End, Playing) */
.piano-key--start {
  background: linear-gradient(to bottom, #3b82f6 0%, #1e40af 100%) !important;
  color: white !important;
  box-shadow: 0 0 8px rgba(30, 64, 175, 0.5);
}

.piano-key--start.piano-key--hover {
  background: linear-gradient(to bottom, #2563eb 0%, #1d4ed8 100%) !important;
  box-shadow: 0 0 12px rgba(30, 64, 175, 0.7);
}

.piano-key--start.piano-key--pressed {
  background: linear-gradient(to bottom, #1d4ed8 0%, #1e40af 100%) !important;
  transform: translateY(3px);
  box-shadow: 0 0 8px rgba(30, 64, 175, 0.5), inset 0 3px 6px rgba(0, 0, 0, 0.3);
}

.piano-key--end {
  background: linear-gradient(to bottom, #22c55e 0%, #16a34a 100%) !important;
  color: white !important;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.piano-key--end.piano-key--hover {
  background: linear-gradient(to bottom, #16a34a 0%, #15803d 100%) !important;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.7);
}

.piano-key--end.piano-key--pressed {
  background: linear-gradient(to bottom, #15803d 0%, #16a34a 100%) !important;
  transform: translateY(3px);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5), inset 0 3px 6px rgba(0, 0, 0, 0.3);
}

.piano-key--playing {
  background: linear-gradient(to bottom, #fbbf24 0%, #f59e0b 100%) !important;
  color: white !important;
  animation: glow 0.5s ease-in-out;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.8);
  transform: translateY(-1px);
}

.piano-key--playing.piano-key--hover {
  background: linear-gradient(to bottom, #f59e0b 0%, #d97706 100%) !important;
  box-shadow: 0 0 16px rgba(251, 191, 36, 1);
}

.piano-key--playing.piano-key--pressed {
  background: linear-gradient(to bottom, #d97706 0%, #f59e0b 100%) !important;
  transform: translateY(2px);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.8), inset 0 3px 6px rgba(0, 0, 0, 0.3);
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 12px rgba(251, 191, 36, 0.8); }
  50% { box-shadow: 0 0 20px rgba(251, 191, 36, 1); }
}

.key-label {
  font-family: 'Arial', sans-serif;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Enhanced label visibility on hover */
.piano-key--hover .key-label {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>