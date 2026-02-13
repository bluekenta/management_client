<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { gql, AGENT, CONFIG, CALLER, BIDDER } from "@/gql";
import type { IAgent } from "@/types/agent";

const props = defineProps<{
  open: boolean;
  agent?: IAgent | null;
}>();

const emit = defineEmits<{
  (e: "update:open", v: boolean): void;
  (e: "created"): void;
  (e: "updated"): void;
  (e: "close"): void;
}>();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const form = ref({
  status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  companyName: "",
  url: "",
  workStartDate: todayStr(),
  manager: "",
  language: "",
  bidderId: null as number | null,
  callerId: null as number | null,
});
const statusOptions = [
  { label: "有効", value: "ACTIVE" },
  { label: "無効", value: "INACTIVE" },
];
const submitting = ref(false);
const error = ref<string | null>(null);
const langOptions = ref<string[]>([]);
const bidderOptions = ref<{ id: number; name: string }[]>([]);
const callerOptions = ref<{ id: number; name: string }[]>([]);

const isEdit = computed(
  () => props.agent != null && typeof props.agent.id === "number",
);
const modalTitle = computed(() =>
  isEdit.value ? "エージェントを編集" : "新規エージェント",
);
const submitLabel = computed(() =>
  submitting.value ? "保存中…" : isEdit.value ? "保存" : "追加",
);

async function loadOptions() {
  try {
    langOptions.value = ((await gql(CONFIG.BID_LANGS_QUERY)).langs ?? []) as string[];
    bidderOptions.value = ((await gql(BIDDER.BIDDERS_QUERY)).bidders ?? []) as { id: number; name: string }[];
    callerOptions.value = ((await gql(CALLER.CALLERS_QUERY)).callers ?? []) as { id: number; name: string }[];
  } catch (e) {
    console.error("Failed to load options:", e);
  }
}

onMounted(loadOptions);

function resetForm() {
  form.value = {
    status: "ACTIVE",
    companyName: "",
    url: "",
    workStartDate: todayStr(),
    manager: "",
    language: "",
    bidderId: null,
    callerId: null,
  };
  error.value = null;
}

function parseDateOnly(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return todayStr();
  return new Date(isoOrDate).toISOString().slice(0, 10);
}

function fillForm(a: IAgent) {
  form.value = {
    status: (a.status === "INACTIVE" ? "INACTIVE" : "ACTIVE") as "ACTIVE" | "INACTIVE",
    companyName: a.companyName ?? "",
    url: a.url ?? "",
    workStartDate: parseDateOnly(a.workStartDate),
    manager: a.manager ?? "",
    language: a.language ?? "",
    bidderId: a.bidderId ?? null,
    callerId: a.callerId ?? null,
  };
}

function close() {
  emit("update:open", false);
  emit("close");
  resetForm();
}

async function submit() {
  if (!form.value.companyName.trim()) return;
  submitting.value = true;
  error.value = null;
  try {
    if (isEdit.value && props.agent?.id != null) {
      await gql(AGENT.UPDATE_AGENT_MUTATION, {
        id: props.agent.id,
        input: {
          status: form.value.status,
          companyName: form.value.companyName.trim(),
          url: form.value.url.trim() || undefined,
          workStartDate: form.value.workStartDate || undefined,
          manager: form.value.manager.trim() || undefined,
          language: form.value.language || undefined,
          bidderId: form.value.bidderId || undefined,
          callerId: form.value.callerId || undefined,
        },
      });
      emit("updated");
    } else {
      await gql(AGENT.CREATE_AGENT_MUTATION, {
        input: {
          status: form.value.status,
          companyName: form.value.companyName.trim(),
          url: form.value.url.trim() || undefined,
          workStartDate: form.value.workStartDate || undefined,
          manager: form.value.manager.trim() || undefined,
          language: form.value.language || undefined,
          bidderId: form.value.bidderId || undefined,
          callerId: form.value.callerId || undefined,
        },
      });
      emit("created");
    }
    close();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    submitting.value = false;
  }
}

watch(
  () => [props.open, props.agent],
  () => {
    if (!props.open) {
      resetForm();
    } else if (props.agent) {
      fillForm(props.agent);
    } else {
      resetForm();
    }
  },
  { immediate: true },
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
      <el-alert
        v-if="error"
        type="error"
        :title="error"
        show-icon
        class="form-error"
      />

      <el-form-item label="状態">
        <el-select v-model="form.status" placeholder="状態" style="width: 100%">
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="会社名" required>
        <el-input v-model="form.companyName" placeholder="会社名" clearable />
      </el-form-item>
      <el-form-item label="URL">
        <el-input
          v-model="form.url"
          type="url"
          placeholder="https://..."
          clearable
        />
      </el-form-item>
      <el-form-item label="業務開始日">
        <el-date-picker
          v-model="form.workStartDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="日付を選択"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="担当者">
        <el-input v-model="form.manager" placeholder="担当者名" clearable />
      </el-form-item>
      <el-form-item label="言語">
        <el-select v-model="form.language" placeholder="言語" style="width: 100%">
          <el-option v-for="l in langOptions" :key="l" :label="l" :value="l" />
        </el-select>
      </el-form-item>
      <el-form-item label="Bidder">
        <el-select v-model="form.bidderId" placeholder="Bidder" clearable style="width: 100%">
          <el-option
            v-for="b in bidderOptions"
            :key="b.id"
            :label="b.name"
            :value="b.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Caller">
        <el-select v-model="form.callerId" placeholder="Caller" clearable style="width: 100%">
          <el-option
            v-for="c in callerOptions"
            :key="c.id"
            :label="c.name"
            :value="c.id"
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
