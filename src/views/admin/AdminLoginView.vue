<template>
  <div class="auth-container d-flex align-items-center justify-content-center py-5">
    <div class="glass-card auth-card w-100 p-4">
      <div class="text-center mb-4">
        <router-link to="/" class="text-decoration-none">
          <h2 class="fw-bold display-font"><span class="gradient-text-orange">管理系統後台</span></h2>
        </router-link>
        <p class="text-secondary mt-2">請輸入管理員帳號與密碼進行驗證</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger py-2 fs-7 mb-3 d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-octagon"></i> {{ errorMsg }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="account" class="form-label">管理員帳號 Username</label>
          <input 
            type="text" 
            id="account" 
            v-model="account" 
            class="form-control" 
            placeholder="請輸入帳號" 
            required 
          />
        </div>
        <div class="mb-4">
          <label for="password" class="form-label">密碼 Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            class="form-control" 
            placeholder="請輸入密碼" 
            required 
          />
        </div>

        <button 
          type="submit" 
          class="btn btn-primary-orange w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status"></span>
          <span v-else><i class="bi bi-shield-check"></i> 安全登入</span>
        </button>
      </form>

      <div class="text-center mt-3">
        <router-link to="/" class="text-secondary text-decoration-none fs-8"><i class="bi bi-arrow-left"></i> 返回前台首頁</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminLoginView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const account = ref('');
    const password = ref('');
    const errorMsg = ref('');
    const loading = ref(false);

    const handleSubmit = async () => {
      errorMsg.value = '';
      loading.value = true;
      try {
        const res = await authStore.adminLogin(account.value, password.value);
        if (res.success) {
          router.push({ name: 'admin-dashboard' });
        } else {
          errorMsg.value = res.message;
        }
      } catch (err) {
        errorMsg.value = '系統連線錯誤，請稍後再試';
      } finally {
        loading.value = false;
      }
    };

    return {
      account,
      password,
      errorMsg,
      loading,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background-color: var(--bg-dark-primary);
  background-image: radial-gradient(circle at 10% 80%, rgba(245, 158, 11, 0.05) 0%, rgba(15, 23, 42, 0) 50%);
}

.auth-card {
  max-width: 440px;
  border-color: rgba(245, 158, 11, 0.2);
}

.auth-card:hover {
  border-color: rgba(245, 158, 11, 0.4) !important;
  box-shadow: 0 12px 40px 0 rgba(245, 158, 11, 0.1) !important;
}

.btn-primary-orange {
  background-color: var(--accent-orange);
  border: none;
  color: #fff;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: var(--font-display);
  transition: all 0.2s ease;
}

.btn-primary-orange:hover {
  background-color: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.fs-7 {
  font-size: 0.9rem;
}

.fs-8 {
  font-size: 0.8rem;
}
</style>
