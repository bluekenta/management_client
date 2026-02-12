<script setup>
import { ref, watch, computed } from 'vue';
import Modal from './Modal.vue';
import { graphql, CREATE_BID_MUTATION, UPDATE_BID_MUTATION } from '@/gql';

const props = defineProps({
  open: { type: Boolean, default: false },
  /** When set, modal is in edit mode for this bid */
  bid: { type: Object, default: null },
});

const emit = defineEmits(['update:open', 'created', 'updated', 'close']);

const form = ref({
  companyName: '',
  url: '',
  jobLink: '',
  status: 'APPLIED',
});
const submitting = ref(false);
const error = ref(null);

const isEdit = computed(() => props.bid != null && typeof props.bid.id === 'number');
const modalTitle = computed(() => (isEdit.value ? 'Edit application' : 'New application'));
const submitLabel = computed(() => (submitting.value ? 'Saving…' : isEdit.value ? 'Save' : 'Add'));

const statusOptions = [
  'APPLIED',
  'RESUME_FAILED',
  'INTRO',
  'INTRO_FAILED',
  'FIRST_TECH',
  'FIRST_TECH_FAILED',
  'FINAL',
  'FINAL_FAILED',
  'OFFER',
];

function resetForm() {
  form.value = { companyName: '', url: '', jobLink: '', status: 'APPLIED' };
  error.value = null;
}

function fillForm(b) {
  form.value = {
    companyName: b.companyName ?? '',
    url: b.url ?? '',
    jobLink: b.jobLink ?? '',
    status: b.status ?? 'APPLIED',
  };
}

function close() {
  emit('update:open', false);
  emit('close');
  resetForm();
}

async function submit() {
  if (!form.value.companyName.trim()) return;
  submitting.value = true;
  error.value = null;
  try {
    if (isEdit.value && props.bid?.id != null) {
      await graphql(UPDATE_BID_MUTATION, {
        id: props.bid.id,
        input: {
          companyName: form.value.companyName.trim(),
          url: form.value.url.trim() || undefined,
          jobLink: form.value.jobLink.trim() || undefined,
          status: form.value.status,
        },
      });
      emit('updated');
    } else {
      await graphql(CREATE_BID_MUTATION, {
        input: {
          companyName: form.value.companyName.trim(),
          url: form.value.url.trim() || undefined,
          jobLink: form.value.jobLink.trim() || undefined,
          status: form.value.status,
        },
      });
      emit('created');
    }
    close();
  } catch (e) {
    error.value = e.message;
  } finally {
    submitting.value = false;
  }
}

watch(
  () => [props.open, props.bid],
  ([isOpen, bid]) => {
    if (!isOpen) {
      resetForm();
    } else if (bid) {
      fillForm(bid);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);
</script>

<template>
  <Modal
    :open="open"
    :title="modalTitle"
    @update:open="(v) => emit('update:open', v)"
    @close="close"
  >
    <form @submit.prevent="submit">
      <p v-if="error" class="error">{{ error }}</p>
      <div class="row">
        <label>Company</label>
        <input v-model="form.companyName" required placeholder="Company name" />
      </div>
      <div class="row">
        <label>URL</label>
        <input v-model="form.url" type="url" placeholder="https://..." />
      </div>
      <div class="row">
        <label>Job link</label>
        <input v-model="form.jobLink" type="url" placeholder="https://..." />
      </div>
      <div class="row">
        <label>Status</label>
        <select v-model="form.status">
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="actions">
        <button type="button" class="btn-secondary" @click="close">Cancel</button>
        <button type="submit" :disabled="submitting">
          {{ submitLabel }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
.error {
  background: #7f1d1d;
  color: #fecaca;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
.row {
  margin-bottom: 0.75rem;
}
.row label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #a1a1aa;
}
input,
select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #3f3f46;
  border-radius: 6px;
  background: #18181b;
  color: #e4e4e7;
}
input:focus,
select:focus {
  outline: none;
  border-color: #6366f1;
}
.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
}
button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background: #6366f1;
  color: white;
  cursor: pointer;
}
button:hover:not(:disabled) {
  background: #4f46e5;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #3f3f46;
  color: #e4e4e7;
}
.btn-secondary:hover {
  background: #52525b;
}
</style>
