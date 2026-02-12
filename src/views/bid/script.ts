import { ref, onMounted, computed, watch } from 'vue';
import { gql, BID, CONFIG } from '@/gql';
import type { TBid } from './types.ts';
import type { IBidConditionInput } from '@/types/bid.ts';

export function useBidView() {
  const bids = ref<TBid[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const showBidModal = ref(false);
  const editingBid = ref<TBid | null>(null);
  // '' means no filter (show all)
  const currentStatus = ref<string>('');
  const currentBidder = ref<string>('');
  const currentCaller = ref<string>('');
  const currentLang = ref<string>('');
  const companyNameSearch = ref<string>('');

  // statuses are fetched from the server (enum values)
  const statuses = ref<string[]>([]);
  const bidders = ref<string[]>([]);
  const callers = ref<string[]>([]);
  const langs = ref<string[]>([]);

  async function loadOptions(): Promise<void> {
    try {
      statuses.value = ((await gql(CONFIG.BID_STATUSES_QUERY)).bidStatuses ??
        []) as string[];
      langs.value = ((await gql(CONFIG.BID_LANGS_QUERY)).langs ?? []) as string[];
      bidders.value = ((await gql(CONFIG.BID_BIDDERS_QUERY)).bidders ?? []) as string[];
      callers.value = ((await gql(CONFIG.BID_CALLERS_QUERY)).callers ?? []) as string[];
    } catch (e) {
      console.error("Failed to load options:", e);
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
    await loadBidsByCondition({
      status: currentStatus.value || undefined,
      bidder: currentBidder.value || undefined,
      caller: currentCaller.value || undefined,
      lang: currentLang.value || undefined,
      companyName: companyNameSearch.value.trim() || undefined,
    });
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
    loadOptions();
  });

  async function loadBidsByCondition(condition: IBidConditionInput): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const data = await gql(BID.BIDS_BY_CONDITION_QUERY, { condition });
      bids.value = (data.bidsByCondition ?? []) as TBid[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  watch(
    [currentStatus, currentBidder, currentCaller, currentLang, companyNameSearch],
    () => {
      // Omit enum fields when empty ("" is invalid for GraphQL enums). No status = backend returns only non-failed bids by default.
      loadBidsByCondition({
        status: currentStatus.value || undefined,
        bidder: currentBidder.value || undefined,
        caller: currentCaller.value || undefined,
        lang: currentLang.value || undefined,
        companyName: companyNameSearch.value.trim() || undefined,
      });
    },
    { immediate: true },
  );

  return {
    bids,
    filteredBids,
    statuses,
    currentStatus,
    bidders,
    currentBidder,
    callers,
    currentCaller,
    langs,
    currentLang,
    companyNameSearch,
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
