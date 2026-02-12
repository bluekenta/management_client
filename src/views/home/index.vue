<script setup>
</script>

<template>
  <div class="home">
    <h1>Welcome</h1>
    <p class="lead">Manage your job applications and bids from here.</p>
    <router-link to="/bid" class="nav-btn">Bid Management</router-link>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 3rem 1.5rem;
}
.home h1 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 600;
}
.lead {
  color: #a1a1aa;
  margin: 0 0 2rem;
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
