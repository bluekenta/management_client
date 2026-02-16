<script setup lang="ts">
import NewBidModal from '@/components/NewBidModal.vue';
import BidDetailModal from '@/components/BidDetailModal.vue';
import { useBidView } from './script';

const {
  sortedBids,
  onSortChange,
  steps,
  statuses,
  bidders,
  callers,
  langs,
  activeAgents,
  currentStep,
  currentStatus,
  currentBidderId,
  currentCallerId,
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
  editingTextValue,
  isEditing,
  startEdit,
  cancelEdit,
  confirmEditText,
  updateBidField,
  openCreateModal,
  openDetailModal,
  onModalClose,
  onDetailUpdated,
  loadBids,
  formatDate,
  formatDateForPicker,
  currentPage,
  totalBids,
  PAGE_SIZE,
  goToPage,
} = useBidView();

function isWebsiteUrl(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}
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
        placeholder="ステップ"
        clearable
        class="filter-select"
      >
        <el-option label="すべて" value="" />
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
        placeholder="状態"
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
        placeholder="プロセス担当者"
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
        placeholder="MTG担当者"
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
        placeholder="言語"
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
      <el-button type="primary" class="toolbar-action" @click="openCreateModal">
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
        :data="sortedBids"
        stripe
        style="width: 100%"
        class="bid-table"
        :default-sort="{ prop: 'applyDate', order: 'descending' }"
        @sort-change="onSortChange"
      >
        <el-table-column type="index" label="No" width="56" :index="(i) => (currentPage - 1) * PAGE_SIZE + i + 1" />
        <el-table-column prop="companyName" label="会社名" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'companyName')" class="cell-edit" @click.stop>
              <el-input v-model="editingTextValue" size="small" placeholder="会社名" @click.stop />
              <div class="cell-edit-actions">
                <el-button type="primary" size="small" @click="confirmEditText">OK</el-button>
              </div>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'companyName')">
              {{ row.companyName ?? '—' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="応募日" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'applyDate')" class="cell-edit" @click.stop>
              <el-date-picker
                :model-value="row.applyDate ? formatDateForPicker(row.applyDate) : ''"
                type="date"
                value-format="YYYY-MM-DD"
                size="small"
                style="width: 100%"
                placeholder="応募日"
                @update:model-value="(v) => updateBidField(row.id, 'applyDate', v)"
              />
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'applyDate')">
              {{ formatDate(row.applyDate) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="step" label="ステップ" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'step')" class="cell-edit" @click.stop>
              <el-select
                :model-value="row.step"
                size="small"
                style="width: 100%"
                @update:model-value="(v) => updateBidField(row.id, 'step', v)"
              >
                <el-option v-for="s in steps" :key="s" :label="s" :value="s" />
              </el-select>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'step')">
              <el-tag size="small" :type="row.step === 'REJECT' ? 'danger' : row.step === 'APPLIED' ? 'success' : 'info'">
                {{ row.step ?? '—' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状態" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'status')" class="cell-edit" @click.stop>
              <el-select
                :model-value="row.status"
                size="small"
                style="width: 100%"
                @update:model-value="(v) => updateBidField(row.id, 'status', v)"
              >
                <el-option v-for="s in statuses" :key="s" :label="s" :value="s" />
              </el-select>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'status')">
              <el-tag size="small">{{ row.status ?? '—' }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdated" label="最終面接" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'lastUpdated')" class="cell-edit" @click.stop>
              <el-date-picker
                :model-value="row.lastUpdated ? formatDateForPicker(row.lastUpdated) : ''"
                type="date"
                value-format="YYYY-MM-DD"
                size="small"
                style="width: 100%"
                placeholder="最終面接"
                @update:model-value="(v) => updateBidField(row.id, 'lastUpdated', v)"
              />
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'lastUpdated')">
              {{ formatDate(row.lastUpdated) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="会社URL">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'url')" class="cell-edit" @click.stop>
              <el-input v-model="editingTextValue" size="small" placeholder="URL" @click.stop />
              <div class="cell-edit-actions">
                <el-button type="primary" size="small" @click="confirmEditText">OK</el-button>
              </div>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'url')">
              <el-link v-if="isWebsiteUrl(row.url)" :href="row.url" target="_blank" type="primary" @click.stop>リンク</el-link>
              <span v-else-if="row.url">{{ row.url }}</span>
              <span v-else>—</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="求人URL">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'jobLink')" class="cell-edit" @click.stop>
              <el-input v-model="editingTextValue" size="small" placeholder="求人URL" @click.stop />
              <div class="cell-edit-actions">
                <el-button type="primary" size="small" @click="confirmEditText">OK</el-button>
              </div>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'jobLink')">
              <el-link v-if="isWebsiteUrl(row.jobLink)" :href="row.jobLink" target="_blank" type="primary" @click.stop>リンク</el-link>
              <span v-else-if="row.jobLink">{{ row.jobLink }}</span>
              <span v-else>—</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="lang" label="言語" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'lang')" class="cell-edit" @click.stop>
              <el-select
                :model-value="row.lang"
                size="small"
                style="width: 100%"
                @update:model-value="(v) => updateBidField(row.id, 'lang', v)"
              >
                <el-option v-for="l in langs" :key="l" :label="l" :value="l" />
              </el-select>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'lang')">
              {{ row.lang ?? '—' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="bidderName" label="Bid" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'bidderId')" class="cell-edit" @click.stop>
              <el-select
                :model-value="row.bidderId ?? null"
                size="small"
                style="width: 100%"
                clearable
                @update:model-value="(v) => updateBidField(row.id, 'bidderId', v)"
              >
                <el-option v-for="b in bidders" :key="b.id" :label="b.name" :value="b.id" />
              </el-select>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'bidderId')">
              {{ row.bidder?.name ?? '—' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="callerName" label="Call" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'callerId')" class="cell-edit" @click.stop>
              <el-select
                :model-value="row.callerId ?? null"
                size="small"
                style="width: 100%"
                clearable
                @update:model-value="(v) => updateBidField(row.id, 'callerId', v)"
              >
                <el-option v-for="c in callers" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'callerId')">
              {{ row.caller?.name ?? '—' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="agentName" label="Agent" sortable="custom">
          <template #default="{ row }">
            <div v-if="isEditing(row.id, 'agentId')" class="cell-edit" @click.stop>
              <el-select
                :model-value="row.agentId ?? null"
                size="small"
                style="width: 100%"
                clearable
                @update:model-value="(v) => updateBidField(row.id, 'agentId', v)"
              >
                <el-option v-for="a in activeAgents" :key="a.id" :label="a.companyName" :value="a.id" />
              </el-select>
            </div>
            <div v-else class="cell-clickable" @click="startEdit(row, 'agentId')">
              {{ row.agent?.companyName ?? '—' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDetailModal(row)">
              詳細
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="totalBids > PAGE_SIZE"
        class="pagination"
        :current-page="currentPage"
        :page-size="PAGE_SIZE"
        :total="totalBids"
        layout="total, prev, pager, next"
        @current-change="goToPage"
      />
      <el-empty v-if="!loading && !sortedBids.length" description="応募情報が見つかりません。" />
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
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.filter-input {
  width: 200px;
  min-width: 200px;
  flex-shrink: 0;
}
.filter-date {
  width: 160px;
  min-width: 160px;
  flex-shrink: 0;
}
.filter-select {
  width: 200px;
  min-width: 200px;
  flex-shrink: 0;
}
.toolbar-action {
  flex-shrink: 0;
}
.list-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--el-text-color-secondary);
}
.bid-table {
  margin-bottom: 0.75rem;
}
.pagination {
  margin-bottom: 1rem;
  justify-content: flex-start;
}
.cell-clickable {
  cursor: pointer;
  min-height: 1.5em;
}
.cell-clickable:hover {
  background: var(--el-fill-color-light);
  margin: 0 -8px;
  padding: 0 8px;
}
.cell-edit {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cell-edit .el-input,
.cell-edit .el-select {
  width: 100%;
}
.cell-edit-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>
