<template>
  <div class="auth-container d-flex align-items-center justify-content-center py-5">
    <div class="glass-card auth-card w-100 p-4">
      <div class="text-center mb-4">
        <router-link to="/" class="text-decoration-none">
          <h2 class="fw-bold display-font"><span class="gradient-text-green">建立新帳號</span></h2>
        </router-link>
        <p class="text-secondary mt-2">填寫以下欄位，立即啟動您的退休財務模擬</p>
      </div>

      <div v-if="errorMsg" class="alert alert-danger py-2 fs-7 mb-3 d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-octagon"></i> {{ errorMsg }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="name" class="form-label">您的姓名 Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            class="form-control" 
            placeholder="王小明" 
            required 
          />
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">電子郵件 Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            class="form-control" 
            placeholder="example@email.com" 
            required 
          />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">設定密碼 Password (最少 6 碼)</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            class="form-control" 
            placeholder="請輸入密碼" 
            required 
            minlength="6"
          />
        </div>

        <div class="row mb-3">
          <div class="col-6">
            <label for="birthday" class="form-label">出生日期</label>
            <input 
              type="date" 
              id="birthday" 
              v-model="birthday" 
              class="form-control" 
              required 
            />
          </div>
          <div class="col-6">
            <label for="gender" class="form-label">性別</label>
            <select id="gender" v-model="gender" class="form-select">
              <option value="">請選擇</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-6">
            <label for="retirementAge" class="form-label">預估退休年齡</label>
            <input 
              type="number" 
              id="retirementAge" 
              v-model="retirementAge" 
              class="form-control" 
              min="30" 
              max="100" 
              required 
            />
          </div>
          <div class="col-6">
            <label for="lifeExpectancy" class="form-label">預期平均壽命</label>
            <input 
              type="number" 
              id="lifeExpectancy" 
              v-model="lifeExpectancy" 
              class="form-control" 
              min="50" 
              max="120" 
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary-green w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status"></span>
          <span v-else><i class="bi bi-person-plus"></i> 註冊並登入</span>
        </button>
      </form>

      <div class="text-center mt-3">
        <span class="text-secondary">已經有帳號了嗎？</span>
        <router-link to="/login" class="text-success text-decoration-none fw-semibold ms-1">立即登入</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const name = ref('');
    const email = ref('');
    const password = ref('');
    const birthday = ref('1990-01-01');
    const gender = ref('');
    const retirementAge = ref(65);
    const lifeExpectancy = ref(85);
    
    const errorMsg = ref('');
    const loading = ref(false);

    const handleSubmit = async () => {
      errorMsg.value = '';

      if (Number(retirementAge.value) >= Number(lifeExpectancy.value)) {
        errorMsg.value = '預期壽命必須大於退休年齡';
        return;
      }

      loading.value = true;
      try {
        const res = await authStore.register({
          name: name.value,
          email: email.value,
          password: password.value,
          birthday: new Date(birthday.value),
          gender: gender.value,
          retirementAge: Number(retirementAge.value),
          lifeExpectancy: Number(lifeExpectancy.value)
        });
        if (res.success) {
          router.push({ name: 'dashboard' });
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
      name,
      email,
      password,
      birthday,
      gender,
      retirementAge,
      lifeExpectancy,
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
  background-image: radial-gradient(circle at 90% 20%, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0) 50%);
}

.auth-card {
  max-width: 500px;
}

.fs-7 {
  font-size: 0.9rem;
}
</style>
