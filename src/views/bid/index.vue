<script setup lang="ts">
import NewBidModal from '@/components/NewBidModal.vue';
import { useBidView } from './script.ts';

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
      <h1>Job applications</h1>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="toolbar">
      <button type="button" class="btn-add" @click="openCreateModal">
        + Add application
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
      <h2>Applications</h2>
      <p v-if="loading">Loading…</p>
      <div v-else-if="bids.length" class="table-wrap">
        <table class="bid-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Status</th>
              <th>Apply date</th>
              <th>URL</th>
              <th>Job link</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bid in bids" :key="bid.id">
              <td class="col-company">{{ bid.companyName }}</td>
              <td><span class="status">{{ bid.status ?? '—' }}</span></td>
              <td class="col-date">{{ formatDate(bid.applyDate) }}</td>
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
                  Edit
                </button>
                <button type="button" class="btn-delete" @click="deleteBid(bid.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty">No applications yet.</p>
    </section>
  </div>
</template>

<style scoped src="./style.less" lang="less" />
