<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<template>
  <div class="app">
    <nav class="nav">
      <router-link to="/" class="nav-logo">Management</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }">
          Home
        </router-link>
        <router-link to="/bid" class="nav-link" :class="{ active: route.path === '/bid' }">
          Bid Management
        </router-link>
      </div>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #1a1b1e;
  color: #e4e4e7;
  min-height: 100vh;
}
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 3rem;
  border-bottom: 1px solid #27272a;
  background: #18181b;
}
.nav-logo {
  font-weight: 600;
  color: #e4e4e7;
  text-decoration: none;
}
.nav-logo:hover {
  color: #fff;
}
.nav-links {
  display: flex;
  gap: 0.25rem;
}
.nav-link {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #a1a1aa;
  text-decoration: none;
  border-radius: 6px;
}
.nav-link:hover {
  color: #e4e4e7;
  background: #27272a;
}
.nav-link.active {
  color: #fff;
  background: #6366f1;
}
.nav-link.active:hover {
  background: #4f46e5;
}
.main {
  flex: 1;
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
}
</style>
