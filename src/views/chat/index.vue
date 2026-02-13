<script setup>
import { ref, nextTick, watch } from 'vue';
import { sendChatMessage } from '@/api/chat';

const messages = ref([]);
const input = ref('');
const loading = ref(false);
const error = ref('');
const listRef = ref(null);

async function send() {
  const text = input.value?.trim();
  if (!text || loading.value) return;

  messages.value.push({ role: 'user', content: text });
  input.value = '';
  loading.value = true;
  error.value = '';

  const history = messages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));

  try {
    const reply = await sendChatMessage(text, history);
    messages.value.push({ role: 'assistant', content: reply });
  } catch (e) {
    error.value = e.message || '送信に失敗しました';
    messages.value.pop();
  } finally {
    loading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  const el = listRef.value;
  if (el?.scrollTo) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}

watch(
  () => messages.value.length,
  () => nextTick(scrollToBottom),
);
</script>

<template>
  <div class="chat-page">
    <el-card class="chat-card">
      <template #header>
        <span>技術Q&A</span>
        <span class="subtitle">技術・ドキュメントに関する質問に答えます</span>
      </template>
      <div ref="listRef" class="message-list" role="log">
        <div v-if="messages.length === 0" class="empty-hint">
          技術的な質問を入力してください。業務データ（応募一覧など）にはアクセスできません。
        </div>
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['message', msg.role === 'user' ? 'user' : 'assistant']"
        >
          <div class="message-content">{{ msg.content }}</div>
        </div>
        <div v-if="loading" class="message assistant">
          <div class="message-content typing">...</div>
        </div>
      </div>
      <el-alert v-if="error" type="error" :title="error" show-icon class="chat-error" />
      <div class="input-row">
        <el-input
          v-model="input"
          type="textarea"
          :rows="2"
          placeholder="質問を入力..."
          :disabled="loading"
          @keydown.enter.exact.prevent="send()"
        />
        <el-button type="primary" :loading="loading" @click="send">送信</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.chat-page {
  max-width: 720px;
  margin: 0 auto;
}
.chat-card {
  display: flex;
  flex-direction: column;
  min-height: 420px;
}
.chat-card :deep(.el-card__header) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.subtitle {
  font-size: 0.85rem;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}
.message-list {
  flex: 1;
  min-height: 240px;
  max-height: 360px;
  overflow-y: auto;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
}
.empty-hint {
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
  padding: 1rem;
  text-align: center;
}
.message {
  margin-bottom: 0.75rem;
  max-width: 90%;
}
.message.user {
  margin-left: auto;
}
.message.user .message-content {
  background: var(--el-color-primary);
  color: var(--el-color-white);
  border-radius: 12px 12px 4px 12px;
}
.message.assistant .message-content {
  background: var(--el-fill-color-light);
  border-radius: 12px 12px 12px 4px;
}
.message-content {
  padding: 0.5rem 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
}
.message-content.typing {
  opacity: 0.7;
}
.chat-error {
  margin-bottom: 0.5rem;
}
.input-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}
.input-row .el-input {
  flex: 1;
}
</style>
