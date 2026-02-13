<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { gql, AUTH, setAuthToken } from '@/gql';

const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function onSubmit() {
  error.value = '';
  loading.value = true;
  try {
    const data = await gql(AUTH.LOGIN_MUTATION, {
      input: { username: username.value, password: password.value },
    });
    const token = data?.login?.access_token;
    if (token) {
      setAuthToken(token);
      const redirect = (route.query.redirect || '/').toString();
      await router.replace(redirect);
    } else {
      error.value = 'Login failed';
    }
  } catch (e) {
    error.value = e.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card">
      <template #header>
        <span>ログイン</span>
      </template>
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="ユーザー名">
          <el-input v-model="username" placeholder="username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="パスワード">
          <el-input
            v-model="password"
            type="password"
            placeholder="password"
            autocomplete="current-password"
            show-password
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-alert v-if="error" type="error" :title="error" show-icon class="mb" />
        <el-form-item>
          <el-button type="primary" :loading="loading" native-type="submit" style="width: 100%">
            ログイン
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 1rem;
}
.login-card {
  width: 100%;
  max-width: 360px;
}
.mb {
  margin-bottom: 1rem;
}
</style>
