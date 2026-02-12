import { ref, onMounted } from 'vue';
import { graphql, BIDS_QUERY, DELETE_BID_MUTATION } from '../../graphql';
import type { TBid } from './types.ts';

export function useBidView() {
  const bids = ref<TBid[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const showBidModal = ref(false);
  const editingBid = ref<TBid | null>(null);

  function openCreateModal(): void {
    editingBid.value = null;
    showBidModal.value = true;
  }

  function openEditModal(bid: TBid): void {
    editingBid.value = { ...bid };
    showBidModal.value = true;
  }

  function onModalClose(): void {
    editingBid.value = null;
  }

  async function loadBids(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const data = await graphql(BIDS_QUERY);
      bids.value = (data.bids ?? []) as TBid[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  async function deleteBid(id: number): Promise<void> {
    if (!confirm('Delete this application?')) return;
    error.value = null;
    try {
      await graphql(DELETE_BID_MUTATION, { id });
      await loadBids();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  onMounted(loadBids);

  return {
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
  };
}
