<script setup lang="ts">
import NewBidderModal from '@/components/NewBidderModal.vue';
import { useBidderView } from './script';

const {
  bidders,
  loading,
  error,
  showBidderModal,
  editingBidder,
  openCreateModal,
  openEditModal,
  onModalClose,
  loadBidders,
  deleteBidder,
} = useBidderView();
</script>

<template>
  <div class="bidder-page">
    <header class="page-header">
      <h1>プロセス担当者管理</h1>
    </header>

    <el-alert v-if="error" type="error" :title="error" show-icon class="error-alert" />

    <div class="toolbar">
      <el-button type="primary" @click="openCreateModal">
        + 追加
      </el-button>
    </div>

    <NewBidderModal
      v-model:open="showBidderModal"
      :bidder="editingBidder ?? undefined"
      @created="loadBidders"
      @updated="loadBidders"
      @close="onModalClose"
    />

    <section class="list">
      <el-table
        v-loading="loading"
        :data="bidders"
        stripe
        style="width: 100%"
        class="bidder-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名前" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditModal(row)">
              編集
            </el-button>
            <el-button type="danger" link size="small" @click="deleteBidder(row.id)">
              削除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && !bidders.length" description="Bidderがありません。" />
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
.bidder-table {
  margin-bottom: 1rem;
}
</style>
