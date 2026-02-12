<script setup>
</script>

<template>
  <div class="home">
    <router-link to="/bid" class="nav-btn">応募管理</router-link>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 3rem 1.5rem;
}
.nav-btn {
  display: inline-block;
  padding: 0.625rem 1.25rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 6px;
  background: #6366f1;
  color: white;
  text-decoration: none;
}
.nav-btn:hover {
  background: #4f46e5;
}
</style>
