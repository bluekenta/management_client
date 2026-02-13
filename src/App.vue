<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useAuth } from '@/composables/useAuth';
import { clearAuthToken } from '@/gql';

const route = useRoute();
const router = useRouter();
const { isDark } = useTheme();
const { isLoggedIn } = useAuth();

const activeIndex = computed(() => {
  const p = route.path;
  if (p === '/bid') return '/bid';
  if (p === '/agent') return '/agent';
  if (p === '/caller') return '/caller';
  if (p === '/bidder') return '/bidder';
  if (p === '/chat') return '/chat';
  return '/';
});

function logout() {
  clearAuthToken();
  router.replace('/login');
}
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        :ellipsis="false"
        router
        class="nav-menu"
      >
        <el-menu-item index="/">ホーム</el-menu-item>
        <el-menu-item index="/chat">技術Q&A</el-menu-item>
        <el-menu-item index="/bid">応募管理</el-menu-item>
        <el-menu-item index="/agent">エージェント管理</el-menu-item>
        <el-menu-item index="/bidder">応募者管理</el-menu-item>
        <el-menu-item index="/caller">MTG担当者管理</el-menu-item>
      </el-menu>
      <div class="header-right">
        <el-button v-if="isLoggedIn()" type="danger" link @click="logout">ログアウト</el-button>
        <el-tooltip :content="isDark ? 'ライト' : 'ダーク'" placement="bottom">
          <el-switch v-model="isDark" inline-prompt active-text="暗" inactive-text="明" />
        </el-tooltip>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  min-height: 100vh;
}
/* Light (default) */
html:not(.dark) {
  --app-bg: #f5f7fa;
  --app-header-border: #e4e7ed;
}
/* Dark */
html.dark {
  --app-bg: #0d1117;
  --app-header-border: #30363d;
}
body {
  background-color: var(--app-bg);
}
.app-container {
  min-height: 100vh;
  flex-direction: column;
}
.app-header {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  height: 56px;
}
.nav-menu {
  flex: 1;
  border-bottom: none;
}
.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.theme-toggle {
  margin-left: 0;
}
.app-main {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
}

::v-deep .el-menu {
  background: none;
}
</style>
