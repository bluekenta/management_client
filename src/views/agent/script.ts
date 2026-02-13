import { ref, onMounted } from 'vue';
import { gql, AGENT } from '@/gql';
import type { TAgent } from './types';

export function useAgentView() {
  const agents = ref<TAgent[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const showAgentModal = ref(false);
  const editingAgent = ref<TAgent | null>(null);

  function openCreateModal(): void {
    editingAgent.value = null;
    showAgentModal.value = true;
  }

  function openEditModal(agent: TAgent): void {
    editingAgent.value = { ...agent };
    showAgentModal.value = true;
  }

  function onModalClose(): void {
    editingAgent.value = null;
  }

  async function loadAgents(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const data = await gql(AGENT.AGENTS_QUERY);
      agents.value = (data.agents ?? []) as TAgent[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      loading.value = false;
    }
  }

  async function deleteAgent(id: number): Promise<void> {
    if (!confirm('このエージェントを削除しますか？')) return;
    error.value = null;
    try {
      await gql(AGENT.DELETE_AGENT_MUTATION, { id });
      await loadAgents();
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
    loadAgents();
  });

  return {
    agents,
    loading,
    error,
    showAgentModal,
    editingAgent,
    openCreateModal,
    openEditModal,
    onModalClose,
    loadAgents,
    deleteAgent,
    formatDate,
  };
}
