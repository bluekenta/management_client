import { ref, onMounted } from 'vue';
import { gql, CALLER } from '@/gql';
import type { TCaller } from './types';

export function useCallerView() {
  const callers = ref<TCaller[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const showCallerModal = ref(false);
  const editingCaller = ref<TCaller | null>(null);

  function openCreateModal(): void {
    editingCaller.value = null;
    showCallerModal.value = true;
  }

  function openEditModal(caller: TCaller): void {
    editingCaller.value = { ...caller };
    showCallerModal.value = true;
  }

  function onModalClose(): void {
    editingCaller.value = null;
  }

  async function loadCallers(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const data = await gql(CALLER.CALLERS_QUERY);
      callers.value = (data.callers ?? []) as TCaller[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  async function deleteCaller(id: number): Promise<void> {
    if (!confirm('このMTG担当者を削除しますか？')) return;
    error.value = null;
    try {
      await gql(CALLER.DELETE_CALLER_MUTATION, { id });
      await loadCallers();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  onMounted(() => {
    loadCallers();
  });

  return {
    callers,
    loading,
    error,
    showCallerModal,
    editingCaller,
    openCreateModal,
    openEditModal,
    onModalClose,
    loadCallers,
    deleteCaller,
  };
}
