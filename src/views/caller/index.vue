<script setup lang="ts">
import NewCallerModal from '@/components/NewCallerModal.vue';
import { useCallerView } from './script';

const {
  callers,
  loading,
  error,
  showCallerModal,
  editingCaller,
  openCreateModal,
  openEditModal,
  onModalClose,
  loadCallers,
  deleteCaller,
} = useCallerView();
</script>

<template>
  <div class="caller-page">
    <header class="page-header">
      <h1>MTG担当者（Caller）管理</h1>
    </header>

    <el-alert v-if="error" type="error" :title="error" show-icon class="error-alert" />

    <div class="toolbar">
      <el-button type="primary" @click="openCreateModal">
        + Callerを追加
      </el-button>
    </div>

    <NewCallerModal
      v-model:open="showCallerModal"
      :caller="editingCaller ?? undefined"
      @created="loadCallers"
      @updated="loadCallers"
      @close="onModalClose"
    />

    <section class="list">
      <h2 class="list-title">Caller一覧</h2>
      <el-table
        v-loading="loading"
        :data="callers"
        stripe
        style="width: 100%"
        class="caller-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名前" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditModal(row)">
              編集
            </el-button>
            <el-button type="danger" link size="small" @click="deleteCaller(row.id)">
              削除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && !callers.length" description="Callerがありません。" />
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
.caller-table {
  margin-bottom: 1rem;
}
</style>
