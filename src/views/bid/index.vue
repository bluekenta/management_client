<script setup lang="ts">
import NewBidModal from '@/components/NewBidModal.vue';
import BidDetailModal from '@/components/BidDetailModal.vue';
import { useBidView } from './script';

const {
  filteredBids,
  steps,
  statuses,
  currentStep,
  currentStatus,
  bidders,
  currentBidderId,
  callers,
  currentCallerId,
  langs,
  currentLang,
  companyNameSearch,
  startDate,
  endDate,
  loading,
  error,
  showBidModal,
  editingBid,
  showDetailModal,
  detailBid,
  openCreateModal,
  openEditModal,
  openDetailModal,
  onModalClose,
  onDetailUpdated,
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
      <!-- 応募日範囲（未指定時は直近1週間。終了日は開始日より前を選択不可） -->
      <el-date-picker
        v-model="startDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="開始日"
        clearable
        class="filter-date"
        :disabled-date="endDate ? (d) => new Date(d) > new Date(endDate) : undefined"
      />
      <el-date-picker
        v-model="endDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="終了日"
        clearable
        class="filter-date"
        :disabled-date="startDate ? (d) => new Date(d) < new Date(startDate) : undefined"
      />

      <!-- 会社名検索 -->
      <el-input
        v-model="companyNameSearch"
        placeholder="会社名で検索"
        clearable
        class="filter-input"
      />

      <!-- ステップ（wait / applied / reject） -->
      <el-select
        v-model="currentStep"
        placeholder="ステップで絞り込み"
        clearable
        class="filter-select"
      >
        <el-option label="すべて（不採用を除く）" value="" />
        <el-option
          v-for="s in steps"
          :key="s"
          :label="s"
          :value="s"
        />
      </el-select>

      <!-- 状態（resume, Intro, firsttech, ...） -->
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
        v-model="currentBidderId"
        placeholder="プロセス担当者で絞り込み"
        clearable
        class="filter-select"
      >
        <el-option label="すべて" :value="'' as any" />
        <el-option
          v-for="b in bidders"
          :key="b.id"
          :label="b.name"
          :value="b.id"
        />
      </el-select>

      <!-- MTG担当者リスト -->
      <el-select
        v-model="currentCallerId"
        placeholder="MTG担当者で絞り込み"
        clearable
        class="filter-select"
      >
        <el-option label="すべて" :value="'' as any" />
        <el-option
          v-for="c in callers"
          :key="c.id"
          :label="c.name"
          :value="c.id"
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

    <BidDetailModal
      v-model:open="showDetailModal"
      :bid="detailBid"
      @updated="onDetailUpdated"
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
        <el-table-column label="ステップ" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.step === 'REJECT' ? 'danger' : row.step === 'APPLIED' ? 'success' : 'info'">
              {{ row.step ?? '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状態" min-width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.status ?? '—' }}</el-tag>
          </template>
        </el-table-column>
        <!-- 最終面接 -->
        <el-table-column label="最終面接" min-width="100">
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
            {{ row.bidder?.name ?? '—' }}
          </template>
        </el-table-column>
        <!-- MTG担当者 -->
        <el-table-column label="MTG担当者" width="120">
          <template #default="{ row }">
            {{ row.caller?.name ?? '—' }}
          </template>
        </el-table-column>
        <!-- 経由エージェント -->
        <el-table-column label="経由エージェント" min-width="120">
          <template #default="{ row }">
            {{ row.agent?.companyName ?? '—' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDetailModal(row)">
              詳細
            </el-button>
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
.filter-input {
  width: 200px;
}
.filter-date {
  width: 140px;
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
