<script setup lang="ts">
import NewBidModal from '@/components/NewBidModal.vue';
import { useBidView } from './script';

const {
  filteredBids,
  statuses,
  currentStatus,
  bidders,
  currentBidder,
  callers,
  currentCaller,
  langs,
  currentLang,
  loading,
  error,
  showBidModal,
  editingBid,
  openCreateModal,
  openEditModal,
  onModalClose,
  loadBids,
  deleteBid,
  formatDate,
} = useBidView();
</script>

<template>
  <div class="bid-page">
    <header class="page-header">
      <h1>応募情報</h1>
    </header>

    <el-alert v-if="error" type="error" :title="error" show-icon class="error-alert" />

    <div class="toolbar">
      <!-- 応募ステータスリスト -->
      <el-select
        v-model="currentStatus"
        placeholder="状態で絞り込み"
        clearable
        class="filter-select"
      >
        <el-option label="すべて" value="" />
        <el-option
          v-for="s in statuses"
          :key="s"
          :label="s"
          :value="s"
        />
      </el-select>

      <!-- プロセス担当者リスト -->
      <el-select
        v-model="currentBidder"
        placeholder="プロセス担当者で絞り込み"
        clearable
        class="filter-select"
      >
        <el-option label="すべて" value="" />
        <el-option
          v-for="b in bidders"
          :key="b"
          :label="b"
          :value="b"
        />
      </el-select>

      <!-- MTG担当者リスト -->
      <el-select
        v-model="currentCaller"
        placeholder="MTG担当者で絞り込み"
        clearable
        class="filter-select"
      >
        <el-option label="すべて" value="" />
        <el-option
          v-for="c in callers"
          :key="c"
          :label="c"
          :value="c"
        />
      </el-select>

      <!-- 言語リスト -->
      <el-select
        v-model="currentLang"
        placeholder="言語で絞り込み"
        clearable
        class="filter-select"
      >
        <el-option label="すべて" value="" />
        <el-option
          v-for="l in langs"
          :key="l"
          :label="l"
          :value="l"
        />
      </el-select>

      <!-- 応募情報を追加 -->
      <el-button type="primary" @click="openCreateModal">
        + 応募情報を追加
      </el-button>
    </div>

    <NewBidModal
      v-model:open="showBidModal"
      :bid="editingBid ?? undefined"
      @created="loadBids"
      @updated="loadBids"
      @close="onModalClose"
    />

    <section class="list">
      <h2 class="list-title">応募情報</h2>
      <el-table
        v-loading="loading"
        :data="filteredBids"
        stripe
        style="width: 100%"
        class="bid-table"
      >
        <el-table-column prop="companyName" label="会社名" min-width="120" />
        <el-table-column label="応募日" min-width="100">
          <template #default="{ row }">
            {{ formatDate(row.applyDate) }}
          </template>
        </el-table-column>
        <!-- 応募状態 -->
        <el-table-column prop="status" label="応募状態" min-width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.status ?? '—' }}</el-tag>
          </template>
        </el-table-column>
        <!-- 最終更新 -->
        <el-table-column label="最終更新" min-width="100">
          <template #default="{ row }">
            {{ formatDate(row.lastUpdated) }}
          </template>
        </el-table-column>
        <!-- 会社URL -->
        <el-table-column label="会社URL" min-width="140">
          <template #default="{ row }">
            <el-link v-if="row.url" :href="row.url" target="_blank" type="primary">
              リンク
            </el-link>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <!-- 求人URL -->
        <el-table-column label="求人URL" width="100">
          <template #default="{ row }">
            <el-link v-if="row.jobLink" :href="row.jobLink" target="_blank" type="primary">
              リンク
            </el-link>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <!-- ポジション言語 -->
        <el-table-column label="言語" width="100">
          <template #default="{ row }">
            {{ row.lang ?? '—' }}
          </template>
        </el-table-column>
        <!-- プロセス担当者 -->
        <el-table-column label="応募者" width="120">
          <template #default="{ row }">
            {{ row.bidder ?? '—' }}
          </template>
        </el-table-column>
        <!-- MTG担当者 -->
        <el-table-column label="MTG担当者" width="120">
          <template #default="{ row }">
            {{ row.caller ?? '—' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditModal(row)">
              編集
            </el-button>
            <el-button type="danger" link size="small" @click="deleteBid(row.id)">
              削除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && !filteredBids.length" description="応募情報が見つかりません。" />
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
.filter-select {
  width: 200px;
}
.list-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--el-text-color-secondary);
}
.bid-table {
  margin-bottom: 1rem;
}
</style>
