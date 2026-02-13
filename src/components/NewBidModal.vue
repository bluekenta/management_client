<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { gql, BID, AGENT, CONFIG, CALLER, BIDDER } from "@/gql";

const props = defineProps({
  open: { type: Boolean, default: false },
  /** When set, modal is in edit mode for this bid */
  bid: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "created", "updated", "close"]);

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const form = ref({
  companyName: "",
  url: "",
  jobLink: "",
  step: "APPLIED",
  status: "RESUME",
  lang: "",
  bidderId: null as number | null,
  callerId: null as number | null,
  agentId: null as number | null,
  applyDate: todayStr(),
  lastUpdated: todayStr(),
});
const submitting = ref(false);
const error = ref(null);
const stepOptions = ref<string[]>([]);
const statusOptions = ref<string[]>([]);
const langOptions = ref<string[]>([]);
const bidderOptions = ref<{ id: number; name: string }[]>([]);
const callerOptions = ref<{ id: number; name: string }[]>([]);
const activeAgents = ref<{ id: number; companyName: string }[]>([]);

const isEdit = computed(
  () => props.bid != null && typeof props.bid.id === "number",
);
const modalTitle = computed(() => (isEdit.value ? "応募を編集" : "新規応募"));
const submitLabel = computed(() =>
  submitting.value ? "保存中…" : isEdit.value ? "保存" : "追加",
);

async function loadOptions() {
  try {
    stepOptions.value = ((await gql(CONFIG.BID_STEPS_QUERY)).bidSteps ?? []) as string[];
    statusOptions.value = ((await gql(CONFIG.BID_STATUSES_QUERY)).bidStatuses ?? []) as string[];
    langOptions.value = ((await gql(CONFIG.BID_LANGS_QUERY)).langs ?? []) as string[];
    bidderOptions.value = ((await gql(BIDDER.BIDDERS_QUERY)).bidders ?? []) as { id: number; name: string }[];
    callerOptions.value = ((await gql(CALLER.CALLERS_QUERY)).callers ?? []) as { id: number; name: string }[];
    activeAgents.value = ((await gql(AGENT.ACTIVE_AGENTS_QUERY)).activeAgents ?? []) as { id: number; companyName: string }[];
  } catch (e) {
    console.error("Failed to load options:", e);
  }
}

onMounted(loadOptions);

function resetForm() {
  form.value = {
    companyName: "",
    url: "",
    jobLink: "",
    step: "APPLIED",
    status: "RESUME",
    lang: "EN",
    bidderId: null,
    callerId: null,
    agentId: null,
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
    companyName: b.companyName ?? "",
    url: b.url ?? "",
    jobLink: b.jobLink ?? "",
    step: b.step ?? "APPLIED",
    status: b.status ?? "RESUME",
    lang: b.lang ?? "EN",
    bidderId: b.bidderId ?? null,
    callerId: b.callerId ?? null,
    agentId: b.agentId ?? null,
    applyDate: parseDateOnly(b.applyDate),
    lastUpdated: todayStr(),
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
    if (isEdit.value && props.bid?.id != null) {
      await gql(BID.UPDATE_BID_MUTATION, {
        id: props.bid.id,
        input: {
          companyName: form.value.companyName.trim(),
          url: form.value.url.trim() || undefined,
          jobLink: form.value.jobLink.trim() || undefined,
          step: form.value.step,
          status: form.value.status,
          lang: form.value.lang,
          bidderId: form.value.bidderId || undefined,
          callerId: form.value.callerId || undefined,
          agentId: form.value.agentId || undefined,
          lastUpdated: form.value.lastUpdated || todayStr(),
        },
      });
      emit("updated");
    } else {
      await gql(BID.CREATE_BID_MUTATION, {
        input: {
          companyName: form.value.companyName.trim(),
          url: form.value.url.trim() || undefined,
          jobLink: form.value.jobLink.trim() || undefined,
          step: form.value.step,
          status: form.value.status,
          lang: form.value.lang,
          bidderId: form.value.bidderId || undefined,
          callerId: form.value.callerId || undefined,
          agentId: form.value.agentId || undefined,
          applyDate: form.value.applyDate || todayStr(),
        },
      });
      emit("created");
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
  { immediate: true },
);
</script>

<template>
  <el-dialog
    :model-value="open"
    :title="modalTitle"
    width="420px"
    destroy-on-close
    @update:model-value="
      (v) => {
        if (!v) close();
      }
    "
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
      <el-form-item label="求人URL">
        <el-input
          v-model="form.jobLink"
          type="url"
          placeholder="https://..."
          clearable
        />
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
      <el-form-item v-if="isEdit" label="最終面接">
        <el-date-picker
          v-model="form.lastUpdated"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="日付を選択"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="ステップ">
        <el-select v-model="form.step" placeholder="ステップ" style="width: 100%">
          <el-option
            v-for="s in stepOptions"
            :key="s"
            :label="s"
            :value="s"
          />
        </el-select>
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

      <el-form-item label="言語">
        <el-select v-model="form.lang" placeholder="言語" style="width: 100%">
          <el-option v-for="l in langOptions" :key="l" :label="l" :value="l" />
        </el-select>
      </el-form-item>

      <el-form-item label="応募者">
        <el-select
          v-model="form.bidderId"
          placeholder="応募者"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="b in bidderOptions"
            :key="b.id"
            :label="b.name"
            :value="b.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="MTG担当者">
        <el-select
          v-model="form.callerId"
          placeholder="MTG担当者"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="c in callerOptions"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="経由エージェント">
        <el-select
          v-model="form.agentId"
          placeholder="経由エージェント"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="a in activeAgents"
            :key="a.id"
            :label="a.companyName"
            :value="a.id"
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
