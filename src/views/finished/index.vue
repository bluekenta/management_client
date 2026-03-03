<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { gql, BID } from '@/gql';
import BidDetailModal from '@/components/BidDetailModal.vue';
import type { TBid } from '@/views/bid/types';

const bids = ref<TBid[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const totalBids = ref(0);
const showDetailModal = ref(false);
const detailBid = ref<TBid | null>(null);
const pageSize = ref(100);
const currentPage = ref(1);

async function loadBids(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    const data = await gql(BID.BIDS_BY_CONDITION_QUERY, {
      condition: {
        step: 'FINISHED',
        offset: (currentPage.value - 1) * pageSize.value,
        limit: pageSize.value,
      },
    });
    const result = data.bidsByCondition;
    bids.value = (result?.bids ?? []) as TBid[];
    totalBids.value = result?.total ?? 0;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toISOString().slice(0, 10);
}

function openDetailModal(bid: TBid): void {
  detailBid.value = { ...bid };
  showDetailModal.value = true;
}

function onDetailUpdated(): void {
  loadBids();
  if (detailBid.value) {
    const next = bids.value.find((b) => b.id === detailBid.value!.id);
    if (next) detailBid.value = next;
  }
}

onMounted(loadBids);
watch(currentPage, loadBids);
</script>

<template>
  <div class="finished-page">
    <header class="page-header">
      <h1>完了（Finished）</h1>
      <p class="page-desc">Job has succeeded and is ready to close.</p>
    </header>

    <el-alert v-if="error" type="error" :title="error" show-icon class="error-alert" />

    <section class="list">
      <el-table
        v-loading="loading"
        :data="bids"
        stripe
        style="width: 100%"
        class="bid-table"
      >
        <el-table-column type="index" label="No" width="56" :index="(i) => (currentPage - 1) * pageSize + i + 1" />
        <el-table-column prop="companyName" label="会社名" min-width="160">
          <template #default="{ row }">{{ row.companyName ?? '—' }}</template>
        </el-table-column>
        <el-table-column prop="applyDate" label="応募日" width="120">
          <template #default="{ row }">{{ formatDate(row.applyDate) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状態" width="120">
          <template #default="{ row }">{{ row.status ?? '—' }}</template>
        </el-table-column>
        <el-table-column prop="country" label="勤務地・国" width="120">
          <template #default="{ row }">{{ row.country ?? '—' }}</template>
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
        v-if="totalBids > pageSize"
        class="pagination"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="totalBids"
        layout="total, prev, pager, next"
        @current-change="(p: number) => (currentPage = p)"
      />
      <el-empty v-if="!loading && !bids.length" description="完了した応募はありません。" />
    </section>

    <BidDetailModal
      v-model:open="showDetailModal"
      :bid="detailBid"
      @updated="onDetailUpdated"
    />
  </div>
</template>

<style scoped>
.page-header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 600;
}
.page-desc {
  margin: 0 0 1rem;
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
}
.error-alert {
  margin-bottom: 1rem;
}
.list {
  margin-top: 0.5rem;
}
.bid-table {
  margin-bottom: 0.75rem;
}
.pagination {
  margin-bottom: 1rem;
  justify-content: flex-start;
}
</style>
