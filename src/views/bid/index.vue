<script setup lang="ts">
import NewBidModal from '@/components/NewBidModal.vue';
import { useBidView } from './script';

const {
  bids,
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

    <p v-if="error" class="error">{{ error }}</p>

    <div class="toolbar">
      <button type="button" class="btn-add" @click="openCreateModal">
        + 応募情報を追加
      </button>
    </div>

    <NewBidModal
      v-model:open="showBidModal"
      :bid="editingBid ?? undefined"
      @created="loadBids"
      @updated="loadBids"
      @close="onModalClose"
    />

    <section class="list">
      <h2>応募情報</h2>
      <p v-if="loading">Loading…</p>
      <div v-else-if="bids.length" class="table-wrap">
        <table class="bid-table">
          <thead>
            <tr>
              <th>会社名</th>
              <th>応募日</th>
              <th>応募状態</th>
              <th>最終更新</th>
              <th>会社URL</th>
              <th>求人URL</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in bids" :key="bid.id">
              <td class="col-company">{{ bid.companyName }}</td>
              <td class="col-date">{{ formatDate(bid.applyDate) }}</td>
              <td><span class="status">{{ bid.status ?? '—' }}</span></td>
              <td class="col-date">{{ formatDate(bid.lastUpdated) }}</td>
              <td class="col-link">
                <a v-if="bid.url" :href="bid.url" target="_blank" rel="noopener">{{ bid.url }}</a>
                <span v-else>—</span>
              </td>
              <td class="col-link">
                <a v-if="bid.jobLink" :href="bid.jobLink" target="_blank" rel="noopener">Job link</a>
                <span v-else>—</span>
              </td>
              <td class="col-actions">
                <button type="button" class="btn-edit" @click="openEditModal(bid)">
                  編集
                </button>
                <button type="button" class="btn-delete" @click="deleteBid(bid.id)">
                  削除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty">応募情報が見つかれません。</p>
    </section>
  </div>
</template>

<style scoped src="./style.less" lang="less" />
