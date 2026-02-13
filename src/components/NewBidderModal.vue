<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { gql, BIDDER } from '@/gql';
import type { TBidder } from '@/views/bidder/types';

const props = defineProps<{
  open: boolean;
  bidder?: TBidder | null;
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

const isEdit = computed(() => props.bidder != null && typeof props.bidder.id === 'number');
const modalTitle = computed(() => (isEdit.value ? 'Bidderを編集' : '新規Bidder'));
const submitLabel = computed(() =>
  submitting.value ? '保存中…' : isEdit.value ? '保存' : '追加',
);

function resetForm() {
  form.value = { name: '' };
  error.value = null;
}

function fillForm(b: TBidder) {
  form.value = { name: b.name ?? '' };
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
    if (isEdit.value && props.bidder?.id != null) {
      await gql(BIDDER.UPDATE_BIDDER_MUTATION, {
        id: props.bidder.id,
        input: { name: form.value.name.trim() },
      });
      emit('updated');
    } else {
      await gql(BIDDER.CREATE_BIDDER_MUTATION, {
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
  () => [props.open, props.bidder],
  () => {
    if (!props.open) resetForm();
    else if (props.bidder) fillForm(props.bidder);
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
        <el-input v-model="form.name" placeholder="Bidder名" clearable />
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
