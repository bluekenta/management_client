<script setup lang="ts">
import NewAgentModal from '@/components/NewAgentModal.vue';
import { useAgentView } from './script';
import type { IAgent } from '@/types/agent';

const {
  agents,
  loading,
  error,
  showAgentModal,
  editingAgent,
  openCreateModal,
  openEditModal,
  onModalClose,
  loadAgents,
  deleteAgent,
  formatDate,
} = useAgentView();
</script>

<template>
  <div class="agent-page">
    <header class="page-header">
      <h1>エージェント管理</h1>
    </header>

    <el-alert v-if="error" type="error" :title="error" show-icon class="error-alert" />

    <div class="toolbar">
      <el-button type="primary" @click="openCreateModal">
        + 追加
      </el-button>
    </div>

    <NewAgentModal
      v-model:open="showAgentModal"
      :agent="editingAgent as unknown as IAgent | null"
      @created="loadAgents"
      @updated="loadAgents"
      @close="onModalClose"
    />

    <section class="list">
      <el-table
        v-loading="loading"
        :data="agents"
        stripe
        style="width: 100%"
        class="agent-table"
      >
        <el-table-column prop="companyName" label="会社名" min-width="140" />
        <el-table-column label="状態" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
              {{ row.status === 'ACTIVE' ? '有効' : '無効' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="URL" min-width="120">
          <template #default="{ row }">
            <el-link v-if="row.url" :href="row.url" target="_blank" type="primary">
              リンク
            </el-link>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="業務開始日" min-width="110">
          <template #default="{ row }">
            {{ formatDate(row.workStartDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="担当者" min-width="100" />
        <el-table-column prop="language" label="言語" width="80" />
        <el-table-column label="Bid" width="100">
          <template #default="{ row }">{{ row.bidder?.name ?? '—' }}</template>
        </el-table-column>
        <el-table-column label="Call" width="100">
          <template #default="{ row }">{{ row.caller?.name ?? '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditModal(row)">
              編集
            </el-button>
            <el-button type="danger" link size="small" @click="deleteAgent(row.id)">
              削除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && !agents.length" description="エージェントがありません。" />
    </section>
  </div>
</template>

<style scoped>
.page-header h1 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}
.error-alert {
  margin-bottom: 1rem;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.list-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--el-text-color-secondary);
}
.agent-table {
  margin-bottom: 1rem;
}
</style>
