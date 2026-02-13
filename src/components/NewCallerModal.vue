<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { gql, CALLER } from '@/gql';
import type { TCaller } from '@/views/caller/types';

const props = defineProps<{
  open: boolean;
  caller?: TCaller | null;
}>();

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void;
  (e: 'created'): void;
  (e: 'updated'): void;
  (e: 'close'): void;
}>();

const form = ref({ name: '' });
const submitting = ref(false);
const error = ref<string | null>(null);

const isEdit = computed(() => props.caller != null && typeof props.caller.id === 'number');
const modalTitle = computed(() => (isEdit.value ? 'Callerを編集' : '新規Caller'));
const submitLabel = computed(() =>
  submitting.value ? '保存中…' : isEdit.value ? '保存' : '追加',
);

function resetForm() {
  form.value = { name: '' };
  error.value = null;
}

function fillForm(c: TCaller) {
  form.value = { name: c.name ?? '' };
}

function close() {
  emit('update:open', false);
  emit('close');
  resetForm();
}

async function submit() {
  if (!form.value.name.trim()) return;
  submitting.value = true;
  error.value = null;
  try {
    if (isEdit.value && props.caller?.id != null) {
      await gql(CALLER.UPDATE_CALLER_MUTATION, {
        id: props.caller.id,
        input: { name: form.value.name.trim() },
      });
      emit('updated');
    } else {
      await gql(CALLER.CREATE_CALLER_MUTATION, {
        input: { name: form.value.name.trim() },
      });
      emit('created');
    }
    close();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    submitting.value = false;
  }
}

watch(
  () => [props.open, props.caller],
  () => {
    if (!props.open) resetForm();
    else if (props.caller) fillForm(props.caller);
    else resetForm();
  },
  { immediate: true },
);
</script>

<template>
  <el-dialog
    :model-value="open"
    :title="modalTitle"
    width="400px"
    destroy-on-close
    @update:model-value="(v) => { if (!v) close(); }"
    @close="close"
  >
    <el-form label-position="top" @submit.prevent="submit">
      <el-alert
        v-if="error"
        type="error"
        :title="error"
        show-icon
        class="form-error"
      />
      <el-form-item label="名前" required>
        <el-input v-model="form.name" placeholder="Caller名" clearable />
      </el-form-item>
      <div class="form-actions">
        <el-button @click="close">キャンセル</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">
          {{ submitLabel }}
        </el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.form-error {
  margin-bottom: 1rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
</style>
