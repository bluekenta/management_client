import { ref, onMounted, computed, watch } from 'vue';
import { gql, BID, CONFIG } from '@/gql';
import type { TBid } from './types.ts';

export function useBidView() {
  const bids = ref<TBid[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const showBidModal = ref(false);
  const editingBid = ref<TBid | null>(null);
  // '' means no filter (show all)
  const currentStatus = ref<string>('');

  // statuses are fetched from the server (enum values)
  const statuses = ref<string[]>([]);

  async function loadStatuses(): Promise<void> {
    try {
      const data = await gql(CONFIG.BID_STATUSES_QUERY);
      statuses.value = (data.bidStatuses ?? []) as string[];
    } catch (e) {
      // non-fatal: keep empty list
      console.warn('loadStatuses error', e);
    }
  }

  const filteredBids = computed(() => {
    // kept for backward compatibility in case someone reads filteredBids
    if (!currentStatus.value) return bids.value;
    return bids.value.filter((b) => (b.status ?? '') === currentStatus.value);
  });

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
      const data = await gql(BID.BIDS_QUERY);
      bids.value = (data.bids ?? []) as TBid[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  async function loadBidsByStatus(status: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      // GraphQL expects an enum value for Status; pass the selected status
      const data = await gql(BID.BID_BY_STATUS_QUERY, { status });
      bids.value = (data.bidsByStatus ?? []) as TBid[];
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
      await gql(BID.DELETE_BID_MUTATION, { id });
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

  onMounted(() => {
    loadBids();
    loadStatuses();
  });

  // When the currentStatus changes, fetch appropriate data from server
  watch(currentStatus, (val) => {
    if (!val) {
      loadBids();
    } else {
      loadBidsByStatus(val);
    }
  });

  return {
    bids,
    filteredBids,
    statuses,
    currentStatus,
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
