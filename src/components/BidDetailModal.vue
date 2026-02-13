<script setup lang="ts">
import { ref, watch } from 'vue';
import { gql, BID } from '@/gql';
import type { TBid } from '@/views/bid/types';

const props = defineProps<{
  open: boolean;
  bid: TBid | null;
}>();

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void;
  (e: 'updated'): void;
}>();

const isEditing = ref(false);
const detailContent = ref('');
const submitting = ref(false);
const error = ref<string | null>(null);

const modalTitle = () => (props.bid ? `${props.bid.companyName} — 詳細` : '詳細');

function close() {
  emit('update:open', false);
  isEditing.value = false;
  error.value = null;
}

function startEdit() {
  detailContent.value = props.bid?.detail ?? '';
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  detailContent.value = props.bid?.detail ?? '';
}

async function save() {
  if (props.bid == null) return;
  submitting.value = true;
  error.value = null;
  try {
    await gql(BID.UPDATE_BID_MUTATION, {
      id: props.bid.id,
      input: { detail: detailContent.value || undefined },
    });
    emit('updated');
    isEditing.value = false;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    submitting.value = false;
  }
}

watch(
  () => [props.open, props.bid],
  () => {
    if (props.open && props.bid) {
      detailContent.value = props.bid.detail ?? '';
      isEditing.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <el-dialog
    :model-value="open"
    :title="modalTitle()"
    width="640px"
    destroy-on-close
    class="bid-detail-modal"
    @update:model-value="(v) => { if (!v) close(); }"
    @close="close"
  >
    <el-alert
      v-if="error"
      type="error"
      :title="error"
      show-icon
      class="form-error"
    />

    <div v-if="!isEditing" class="detail-view">
      <div
        v-if="bid?.detail"
        class="detail-richtext"
        v-html="bid.detail"
      />
      <p v-else class="detail-empty">詳細がありません。</p>
      <div class="detail-actions">
        <el-button type="primary" @click="startEdit">編集</el-button>
        <el-button @click="close">閉じる</el-button>
      </div>
    </div>

    <div v-else class="detail-edit">
      <el-input
        v-model="detailContent"
        type="textarea"
        :rows="14"
        placeholder="詳細を入力（HTMLタグも使用できます）"
        class="detail-textarea"
      />
      <div class="detail-actions">
        <el-button type="primary" :loading="submitting" @click="save">
          保存
        </el-button>
        <el-button :disabled="submitting" @click="cancelEdit">キャンセル</el-button>
        <el-button @click="close">閉じる</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
.form-error {
  margin-bottom: 1rem;
}
.detail-view {
  min-height: 120px;
}
.detail-richtext {
  padding: 0.75rem 0;
  line-height: 1.6;
  word-break: break-word;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 1rem;
}
.detail-richtext :deep(p) {
  margin: 0.5em 0;
}
.detail-richtext :deep(ul),
.detail-richtext :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}
.detail-empty {
  color: var(--el-text-color-secondary);
  padding: 1.5rem 0;
  margin: 0;
}
.detail-edit .detail-textarea {
  margin-bottom: 1rem;
}
.detail-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
