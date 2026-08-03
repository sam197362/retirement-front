<template>
  <div class="auth-wrapper">
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>

    <div class="auth-container">
      <!-- Left Info Panel -->
      <div class="info-panel">
        <div>
          <router-link to="/" class="brand-logo">
            <div class="brand-icon">
              <i class="bi bi-shield-lock-fill"></i>
            </div>
            <span class="brand-name">退休理財規劃平台</span>
          </router-link>

          <h2 class="info-headline">掌握專屬財務缺口，<br>輕鬆邁向財富自由</h2>
          <p class="info-subtext">
            登入系統隨時更新個人收支、檢視勞保勞退預估發放金與投資複利成長趨勢。
          </p>

          <ul class="feature-list">
            <li class="feature-item">
              <div class="feature-check"><i class="bi bi-check"></i></div>
              <span>對接 2026 現行勞退新制與老年給付標準</span>
            </li>
            <li class="feature-item">
              <div class="feature-check"><i class="bi bi-check"></i></div>
              <span>動態整合通貨膨脹與醫療準備金評估</span>
            </li>
            <li class="feature-item">
              <div class="feature-check"><i class="bi bi-check"></i></div>
              <span>高隱私資安防護與個人化儀表板</span>
            </li>
          </ul>
        </div>

        <div class="info-footer">
          © 2026 退休理財規劃平台. All Rights Reserved.
        </div>
      </div>

      <!-- Right Form Panel -->
      <div class="form-panel">
        <div class="form-header">
          <h1 class="form-title">會員登入</h1>
          <p class="form-subtitle">歡迎回來！請輸入您的帳號密碼</p>
        </div>

        <!-- Error Message Alert -->
        <div v-if="errorMsg" class="alert-error">
          <i class="bi bi-exclamation-octagon-fill"></i>
          <span>{{ errorMsg }}</span>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Email Input -->
          <div class="input-group">
            <label for="email" class="input-label">電子郵件 Email</label>
            <div class="input-wrapper">
              <i class="bi bi-envelope input-icon"></i>
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                class="form-control" 
                placeholder="name@example.com" 
                required
              >
            </div>
          </div>

          <!-- Password Input -->
          <div class="input-group">
            <label for="password" class="input-label">安全密碼 Password</label>
            <div class="input-wrapper">
              <i class="bi bi-lock input-icon"></i>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                class="form-control" 
                placeholder="請輸入您的密碼" 
                required
              >
              <button type="button" class="toggle-password" @click="showPassword = !showPassword" title="顯示/隱藏密碼">
                <i :class="showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
              </button>
            </div>
          </div>

          <!-- Form Options -->
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe">
              <span>記住我的登入資訊</span>
            </label>
            <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">忘記密碼？</a>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <template v-else>
              <i class="bi bi-box-arrow-in-right"></i>
              <span>登入系統</span>
            </template>
          </button>
        </form>

        <div class="form-footer">
          <span>還沒有帳號嗎？</span>
          <router-link to="/register" class="register-link">免費註冊帳號</router-link>
        </div>

        <div class="admin-switch">
          <router-link to="/admin/login" class="admin-link">
            <i class="bi bi-gear-fill me-1"></i> 切換至後台管理員登入
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const rememberMe = ref(false);
    const showPassword = ref(false);
    const errorMsg = ref('');
    const loading = ref(false);

    const fillAccount = (userEmail, userPassword) => {
      email.value = userEmail;
      password.value = userPassword;
      errorMsg.value = '';
    };

    const handleForgotPassword = () => {
      alert('請聯絡系統管理員進行密碼重設。');
    };

    const handleSubmit = async () => {
      errorMsg.value = '';
      loading.value = true;
      try {
        const res = await authStore.login(email.value, password.value);
        if (res && res.success) {
          router.push({ name: 'dashboard' });
        } else {
          errorMsg.value = (res && res.message) || '登入失敗，請確認帳點與密碼。';
        }
      } catch (err) {
        errorMsg.value = '系統連線錯誤，請稍後再試';
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      password,
      rememberMe,
      showPassword,
      errorMsg,
      loading,
      fillAccount,
      handleForgotPassword,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  background-color: #0f172a;
  background: radial-gradient(circle at 15% 15%, #1e1b4b 0%, #0f172a 45%, #090d16 100%);
  font-family: 'Inter', 'Noto Sans TC', sans-serif;
  color: #f8fafc;
}

.bg-blob {
  position: absolute;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.blob-1 { top: 10%; left: 15%; }
.blob-2 { bottom: 10%; right: 15%; }

.auth-container {
  width: 100%;
  max-width: 960px;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 35px rgba(16, 185, 129, 0.2);
  position: relative;
  z-index: 10;
}

.info-panel {
  padding: 48px 40px;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95));
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  margin-bottom: 32px;
}

.brand-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.brand-name {
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.info-headline {
  font-size: 1.85rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 16px;
  color: #ffffff;
}

.info-subtext {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 32px;
}

.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #f8fafc;
}

.feature-check {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.info-footer {
  font-size: 0.8rem;
  color: #64748b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  margin-top: 32px;
}

.form-panel {
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-header {
  margin-bottom: 28px;
}

.form-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 6px;
  color: #ffffff;
}

.form-subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
}

.demo-account-bar {
  background: rgba(16, 185, 129, 0.08);
  border: 1px dashed rgba(16, 185, 129, 0.3);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 0.85rem;
}

.demo-account-title {
  color: #34d399;
  font-weight: 700;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.demo-btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.demo-chip {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-chip:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #34d399;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #f8fafc;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 5;
  transition: color 0.2s ease;
}

.form-control {
  width: 100%;
  height: 48px;
  padding-left: 48px !important;
  padding-right: 48px !important;
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 14px;
  color: #f8fafc !important;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.25s ease;
}

.form-control:focus {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
  background: rgba(15, 23, 42, 0.85) !important;
}

.input-wrapper:focus-within .input-icon {
  color: #10b981;
}

.toggle-password {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  z-index: 5;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: #f8fafc;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 0.88rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #10b981;
  cursor: pointer;
}

.forgot-link {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 18px -4px rgba(16, 185, 129, 0.4);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(16, 185, 129, 0.6);
  filter: brightness(1.08);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert-error {
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fda4af;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.9rem;
  color: #94a3b8;
}

.register-link {
  color: #34d399;
  text-decoration: none;
  font-weight: 700;
  margin-left: 6px;
}

.register-link:hover {
  text-decoration: underline;
}

.admin-switch {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.admin-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.82rem;
  transition: color 0.2s;
}

.admin-link:hover {
  color: #94a3b8;
}

@media (max-width: 840px) {
  .auth-container {
    grid-template-columns: 1fr;
  }
  .info-panel {
    display: none;
  }
  .form-panel {
    padding: 36px 24px;
  }
}
</style>
