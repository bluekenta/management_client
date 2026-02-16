import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { gql, BID, CONFIG, CALLER, BIDDER, AGENT } from '@/gql';
import type { TBid } from './types.ts';
import type { IBidConditionInput } from '@/types/bid.ts';

export function useBidView() {
  const bids = ref<TBid[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const showBidModal = ref(false);
  const editingBid = ref<TBid | null>(null);
  const showDetailModal = ref(false);
  const detailBid = ref<TBid | null>(null);
  // '' means no filter (show all for that dimension)
  const currentStep = ref<string>('');
  const currentStatus = ref<string>('');
  const currentBidderId = ref<number | ''>('');
  const currentCallerId = ref<number | ''>('');
  const currentLang = ref<string>('');
  const companyNameSearch = ref<string>('');
  const startDate = ref<string>('');
  const endDate = ref<string>('');

  const PAGE_SIZE = 50;
  const currentPage = ref(1);
  const totalBids = ref(0);
  const lastFilterJson = ref('');

  const steps = ref<string[]>([]);
  const statuses = ref<string[]>([]);
  const bidders = ref<{ id: number; name: string }[]>([]);
  const callers = ref<{ id: number; name: string }[]>([]);
  const langs = ref<string[]>([]);
  const activeAgents = ref<{ id: number; companyName: string }[]>([]);

  async function loadOptions(): Promise<void> {
    try {
      steps.value = ((await gql(CONFIG.BID_STEPS_QUERY)).bidSteps ?? []) as string[];
      statuses.value = ((await gql(CONFIG.BID_STATUSES_QUERY)).bidStatuses ?? []) as string[];
      langs.value = ((await gql(CONFIG.BID_LANGS_QUERY)).langs ?? []) as string[];
      bidders.value = ((await gql(BIDDER.BIDDERS_QUERY)).bidders ?? []) as { id: number; name: string }[];
      callers.value = ((await gql(CALLER.CALLERS_QUERY)).callers ?? []) as { id: number; name: string }[];
      activeAgents.value = ((await gql(AGENT.ACTIVE_AGENTS_QUERY)).activeAgents ?? []) as { id: number; companyName: string }[];
    } catch (e) {
      console.error("Failed to load options:", e);
    }
  }

  const editingCell = ref<{ bidId: number; field: string } | null>(null);
  const editingTextValue = ref('');

  function isEditing(bidId: number, field: string): boolean {
    const c = editingCell.value;
    return c !== null && c.bidId === bidId && c.field === field;
  }

  const TEXT_FIELDS = ['companyName', 'url', 'jobLink'];

  function startEdit(row: TBid, field: string): void {
    editingCell.value = { bidId: row.id, field };
    if (field === 'companyName') editingTextValue.value = row.companyName ?? '';
    else if (field === 'url') editingTextValue.value = row.url ?? '';
    else if (field === 'jobLink') editingTextValue.value = row.jobLink ?? '';
  }

  function cancelEdit(): void {
    editingCell.value = null;
  }

  let clickOutsideHandler: ((e: MouseEvent) => void) | null = null;

  watch(editingCell, (cell) => {
    if (clickOutsideHandler) {
      document.removeEventListener('click', clickOutsideHandler);
      clickOutsideHandler = null;
    }
    if (cell) {
      setTimeout(() => {
        clickOutsideHandler = (e: MouseEvent) => {
          const target = e.target as Node;
          if (target && document.body.contains(target) && (target as Element).closest?.('.cell-edit')) return;
          cancelEdit();
          if (clickOutsideHandler) {
            document.removeEventListener('click', clickOutsideHandler);
            clickOutsideHandler = null;
          }
        };
        document.addEventListener('click', clickOutsideHandler);
      }, 0);
    }
  });

  onBeforeUnmount(() => {
    if (clickOutsideHandler) {
      document.removeEventListener('click', clickOutsideHandler);
    }
  });

  async function confirmEditText(): Promise<void> {
    const c = editingCell.value;
    if (!c || !TEXT_FIELDS.includes(c.field)) return;
    error.value = null;
    try {
      await gql(BID.UPDATE_BID_MUTATION, {
        id: c.bidId,
        input: { [c.field]: editingTextValue.value.trim() || undefined },
      });
      await loadBids();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    }
    editingCell.value = null;
  }

  const NULLABLE_FIELDS = ['lastUpdated', 'bidderId', 'callerId', 'agentId'];

  async function updateBidField(bidId: number, field: string, value: string | number | null): Promise<void> {
    error.value = null;
    try {
      const input: Record<string, unknown> = {};
      if (NULLABLE_FIELDS.includes(field) && (value === null || value === '')) {
        input[field] = null;
      } else {
        input[field] = value ?? undefined;
      }
      await gql(BID.UPDATE_BID_MUTATION, { id: bidId, input });
      await loadBids();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    }
    editingCell.value = null;
  }

  const filteredBids = computed(() => bids.value);

  const sortProp = ref<string>('applyDate');
  const sortOrder = ref<'ascending' | 'descending' | null>('descending');

  function getSortValue(row: TBid, prop: string): string | number {
    switch (prop) {
      case 'companyName':
        return (row.companyName ?? '').toLowerCase();
      case 'applyDate':
        return row.applyDate ? new Date(row.applyDate).getTime() : 0;
      case 'lastUpdated':
        return row.lastUpdated ? new Date(row.lastUpdated).getTime() : 0;
      case 'step':
        return row.step ?? '';
      case 'status':
        return row.status ?? '';
      case 'lang':
        return row.lang ?? '';
      case 'bidderName':
        return (row.bidder?.name ?? '').toLowerCase();
      case 'callerName':
        return (row.caller?.name ?? '').toLowerCase();
      case 'agentName':
        return (row.agent?.companyName ?? '').toLowerCase();
      default:
        return '';
    }
  }

  const sortedBids = computed(() => {
    const list = [...filteredBids.value];
    const prop = sortProp.value;
    const order = sortOrder.value;
    if (!prop || !order) return list;
    list.sort((a, b) => {
      const va = getSortValue(a, prop);
      const vb = getSortValue(b, prop);
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb));
      return order === 'ascending' ? cmp : -cmp;
    });
    return list;
  });

  function onSortChange({ prop, order }: { prop?: string; order?: string | null }): void {
    sortProp.value = prop ?? 'applyDate';
    sortOrder.value = (order === 'ascending' || order === 'descending' ? order : null) ?? 'descending';
  }

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

  function openDetailModal(bid: TBid): void {
    detailBid.value = { ...bid };
    showDetailModal.value = true;
  }

  watch(showDetailModal, (open) => {
    if (!open) detailBid.value = null;
  });

  async function onDetailUpdated(): Promise<void> {
    await loadBids();
    if (detailBid.value) {
      const next = bids.value.find((b) => b.id === detailBid.value!.id);
      if (next) detailBid.value = next;
    }
  }

  async function loadBids(): Promise<void> {
    const condition: IBidConditionInput = {
      status: currentStatus.value || undefined,
      bidderId: currentBidderId.value === '' ? undefined : currentBidderId.value,
      callerId: currentCallerId.value === '' ? undefined : currentCallerId.value,
      lang: currentLang.value || undefined,
      companyName: companyNameSearch.value.trim() || undefined,
      startDate: startDate.value.trim() || undefined,
      endDate: endDate.value.trim() || undefined,
    };
    if (currentStep.value) condition.step = currentStep.value;
    await loadBidsByCondition(condition);
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
    return new Date(iso).toISOString().slice(0, 10);
  }

  function formatDateForPicker(iso: string | null | undefined): string {
    if (!iso) return '';
    return new Date(iso).toISOString().slice(0, 10);
  }

  onMounted(() => {
    loadOptions();
  });

  async function loadBidsByCondition(condition: IBidConditionInput): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const data = await gql(BID.BIDS_BY_CONDITION_QUERY, { condition });
      const result = data.bidsByCondition;
      bids.value = (result?.bids ?? []) as TBid[];
      totalBids.value = result?.total ?? 0;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  function goToPage(page: number): void {
    currentPage.value = Math.max(1, page);
  }

  watch([startDate, endDate], () => {
    const s = (startDate.value ?? '').toString().trim();
    const e = (endDate.value ?? '').toString().trim();
    if (s && e && s > e) endDate.value = '';
  });

  watch(
    [
      currentStep,
      currentStatus,
      currentBidderId,
      currentCallerId,
      currentLang,
      companyNameSearch,
      startDate,
      endDate,
      currentPage,
    ],
    () => {
      const filterPart: Omit<IBidConditionInput, 'offset'> = {
        status: currentStatus.value || undefined,
        bidderId: currentBidderId.value === '' ? undefined : currentBidderId.value,
        callerId: currentCallerId.value === '' ? undefined : currentCallerId.value,
        lang: currentLang.value || undefined,
        companyName: companyNameSearch.value.trim() || undefined,
        startDate: (startDate.value ?? '').toString().trim() || undefined,
        endDate: (endDate.value ?? '').toString().trim() || undefined,
      };
      if (currentStep.value) filterPart.step = currentStep.value;
      const filterJson = JSON.stringify(filterPart);
      if (filterJson !== lastFilterJson.value) {
        lastFilterJson.value = filterJson;
        currentPage.value = 1;
      }
      const condition: IBidConditionInput = {
        ...filterPart,
        offset: (currentPage.value - 1) * PAGE_SIZE,
      };
      loadBidsByCondition(condition);
    },
    { immediate: true },
  );

  return {
    bids,
    filteredBids,
    sortedBids,
    sortProp,
    sortOrder,
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
    editingCell,
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
    deleteBid,
    formatDate,
    formatDateForPicker,
    currentPage,
    totalBids,
    PAGE_SIZE,
    goToPage,
  };
}
