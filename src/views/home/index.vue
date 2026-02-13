<script setup>
</script>

<template>
  <div class="home-page">
    <el-button type="primary" size="large" @click="$router.push('/bid')">
      応募管理
    </el-button>
    <el-button type="primary" size="large" @click="$router.push('/agent')">
      エージェント管理
    </el-button>
  </div>
</template>

<style scoped>
.home-page {
  text-align: center;
  padding: 3rem 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
