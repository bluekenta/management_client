import { ref, onMounted } from 'vue';
import { gql, BIDDER } from '@/gql';
import type { TBidder } from './types';

export function useBidderView() {
  const bidders = ref<TBidder[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const showBidderModal = ref(false);
  const editingBidder = ref<TBidder | null>(null);

  function openCreateModal(): void {
    editingBidder.value = null;
    showBidderModal.value = true;
  }

  function openEditModal(bidder: TBidder): void {
    editingBidder.value = { ...bidder };
    showBidderModal.value = true;
  }

  function onModalClose(): void {
    editingBidder.value = null;
  }

  async function loadBidders(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const data = await gql(BIDDER.BIDDERS_QUERY);
      bidders.value = (data.bidders ?? []) as TBidder[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  async function deleteBidder(id: number): Promise<void> {
    if (!confirm('このプロセス担当者を削除しますか？')) return;
    error.value = null;
    try {
      await gql(BIDDER.DELETE_BIDDER_MUTATION, { id });
      await loadBidders();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  onMounted(() => {
    loadBidders();
  });

  return {
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
  };
}
