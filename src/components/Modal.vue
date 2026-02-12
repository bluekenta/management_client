<script setup>
import { watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  closeOnOverlay: { type: Boolean, default: true },
});

const emit = defineEmits(['update:open', 'close']);

function close() {
  emit('update:open', false);
  emit('close');
}

function onOverlayClick(e) {
  if (props.closeOnOverlay && e.target === e.currentTarget) close();
}

function onEscape(e) {
  if (e.key === 'Escape' && props.open) close();
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener('keydown', onEscape);
});
onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onEscape);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @click="onOverlayClick">
        <div class="modal-box" role="dialog" aria-modal="true" :aria-label="title || 'Modal'">
          <div class="modal-header" v-if="$slots.header || title">
            <slot name="header">
              <h2 v-if="title" class="modal-title">{{ title }}</h2>
            </slot>
            <button
              type="button"
              class="modal-close"
              aria-label="Close"
              @click="close"
            >
              ×
            </button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}
.modal-box {
  background: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 12px;
  max-width: 28rem;
  width: 100%;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #3f3f46;
  flex-shrink: 0;
}
.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}
.modal-close {
  background: none;
  border: none;
  color: #a1a1aa;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: 4px;
}
.modal-close:hover {
  color: #e4e4e7;
  background: #3f3f46;
}
.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}
.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #3f3f46;
  flex-shrink: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}
.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.96);
}
</style>
