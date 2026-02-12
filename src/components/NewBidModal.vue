<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { graphql, CREATE_BID_MUTATION, UPDATE_BID_MUTATION, BID_STATUSES_QUERY } from '@/gql';

const props = defineProps({
  open: { type: Boolean, default: false },
  /** When set, modal is in edit mode for this bid */
  bid: { type: Object, default: null },
});

const emit = defineEmits(['update:open', 'created', 'updated', 'close']);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const form = ref({
  companyName: '',
  url: '',
  jobLink: '',
  status: 'APPLIED',
  applyDate: todayStr(),
  lastUpdated: todayStr(),
});
const submitting = ref(false);
const error = ref(null);
const statusOptions = ref([]);

const isEdit = computed(() => props.bid != null && typeof props.bid.id === 'number');
const modalTitle = computed(() => (isEdit.value ? '応募を編集' : '新規応募'));
const submitLabel = computed(() => (submitting.value ? '保存中…' : isEdit.value ? '保存' : '追加'));

async function loadStatusOptions() {
  try {
    const data = await graphql(BID_STATUSES_QUERY);
    statusOptions.value = data.bidStatuses ?? [];
  } catch {
    statusOptions.value = [];
  }
}

onMounted(loadStatusOptions);

function resetForm() {
  form.value = {
    companyName: '',
    url: '',
    jobLink: '',
    status: 'APPLIED',
    applyDate: todayStr(),
    lastUpdated: todayStr(),
  };
  error.value = null;
}

function parseDateOnly(isoOrDate) {
  if (!isoOrDate) return todayStr();
  const d = new Date(isoOrDate);
  return d.toISOString().slice(0, 10);
}

function fillForm(b) {
  form.value = {
    companyName: b.companyName ?? '',
    url: b.url ?? '',
    jobLink: b.jobLink ?? '',
    status: b.status ?? 'APPLIED',
    applyDate: parseDateOnly(b.applyDate),
    lastUpdated: todayStr(),
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
          lastUpdated: form.value.lastUpdated || todayStr(),
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
          applyDate: form.value.applyDate || todayStr(),
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
  <el-dialog
    :model-value="open"
    :title="modalTitle"
    width="420px"
    destroy-on-close
    @update:model-value="(v) => { if (!v) close(); }"
    @close="close"
  >
    <el-form label-position="top" @submit.prevent="submit">
      <el-alert v-if="error" type="error" :title="error" show-icon class="form-error" />

      <el-form-item label="会社名" required>
        <el-input v-model="form.companyName" placeholder="会社名" clearable />
      </el-form-item>
      <el-form-item label="URL">
        <el-input v-model="form.url" type="url" placeholder="https://..." clearable />
      </el-form-item>
      <el-form-item label="求人URL">
        <el-input v-model="form.jobLink" type="url" placeholder="https://..." clearable />
      </el-form-item>

      <el-form-item v-if="!isEdit" label="応募日">
        <el-date-picker
          v-model="form.applyDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="日付を選択"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item v-if="isEdit" label="最終更新">
        <el-date-picker
          v-model="form.lastUpdated"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="日付を選択"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="状態">
        <el-select v-model="form.status" placeholder="状態" style="width: 100%">
          <el-option
            v-for="s in statusOptions"
            :key="s"
            :label="s"
            :value="s"
          />
        </el-select>
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
