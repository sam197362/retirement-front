<template>
  <div>
    <h2 class="fw-bold text-light mb-1"><i class="bi bi-person-gear text-success me-2"></i> 個人退休參數設定</h2>
    <p class="text-secondary mb-4">設定您的退休期望指標與個人基本資料，以進行精準分析</p>

    <!-- Feedback Message -->
    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill"></i> {{ successMsg }}
      <button type="button" class="btn-close btn-close-white" @click="successMsg = ''"></button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMsg }}
      <button type="button" class="btn-close btn-close-white" @click="errorMsg = ''"></button>
    </div>

    <div class="row g-4" v-if="!loading">
      <!-- 1. Profile & Retirement Parameters Form -->
      <div class="col-lg-7">
        <div class="glass-card">
          <h5 class="fw-bold text-light mb-4"><i class="bi bi-pencil-square text-success me-2"></i> 編輯基本資料與規劃參數</h5>
          <form @submit.prevent="handleUpdateProfile">
            <div class="row mb-3">
              <div class="col-sm-6">
                <label for="name" class="form-label">姓名</label>
                <input type="text" id="name" v-model="profileForm.name" class="form-control" required>
              </div>
              <div class="col-sm-6">
                <label for="email" class="form-label">電子郵件 (不可修改)</label>
                <input type="email" id="email" :value="profileForm.email" class="form-control text-secondary" disabled>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-sm-6">
                <label for="birthday" class="form-label">出生日期</label>
                <input type="date" id="birthday" v-model="profileForm.birthday" class="form-control">
              </div>
              <div class="col-sm-6">
                <label for="gender" class="form-label">性別</label>
                <select id="gender" v-model="profileForm.gender" class="form-select">
                  <option value="">請選擇</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>

            <div class="row mb-4 border-bottom border-color pb-3">
              <div class="col-sm-6">
                <label for="retAge" class="form-label">預估退休年齡</label>
                <input type="number" id="retAge" v-model.number="profileForm.retirementAge" class="form-control" min="30" max="100" required>
              </div>
              <div class="col-sm-6">
                <label for="lifeAge" class="form-label">預估平均壽命</label>
                <input type="number" id="lifeAge" v-model.number="profileForm.lifeExpectancy" class="form-control" min="50" max="120" required>
              </div>
            </div>

            <h5 class="fw-bold text-light mb-3 mt-4"><i class="bi bi-sliders text-success me-2"></i> 退休期望指標設定</h5>
            


            <div class="row mb-4">
              <div class="col-sm-6">
                <label for="pensionLi" class="form-label">已設定勞保老年月年金 (元)</label>
                <input type="number" id="pensionLi" v-model.number="profileForm.laborInsurance" class="form-control" min="0">
                <div class="form-text text-secondary">可手動修改或從試算頁儲存</div>
              </div>
              <div class="col-sm-6">
                <label for="pensionLp" class="form-label">已設定勞退專戶月退休金 (元)</label>
                <input type="number" id="pensionLp" v-model.number="profileForm.laborPension" class="form-control" min="0">
                <div class="form-text text-secondary">可手動修改或從試算頁儲存</div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary-green w-100 py-2.5" :disabled="updatingProfile">
              <span v-if="updatingProfile" class="spinner-border spinner-border-sm"></span>
              <span v-else><i class="bi bi-save"></i> 儲存退休參數與基本資料</span>
            </button>
          </form>
        </div>
      </div>

      <!-- 2. Change Password Form -->
      <div class="col-lg-5">
        <div class="glass-card">
          <h5 class="fw-bold text-light mb-4"><i class="bi bi-lock text-success me-2"></i> 修改密碼</h5>
          <form @submit.prevent="handleChangePassword">
            <div class="mb-3">
              <label for="curPassword" class="form-label">目前密碼 Current Password</label>
              <input type="password" id="curPassword" v-model="passForm.currentPassword" class="form-control" required placeholder="請輸入目前密碼">
            </div>
            <div class="mb-3">
              <label for="newPassword" class="form-label">設定新密碼 New Password</label>
              <input type="password" id="newPassword" v-model="passForm.newPassword" class="form-control" required minlength="6" placeholder="密碼長度最少 6 碼">
            </div>
            <div class="mb-4">
              <label for="confirmNewPassword" class="form-label">確認新密碼 Confirm Password</label>
              <input type="password" id="confirmNewPassword" v-model="passForm.confirmPassword" class="form-control" required placeholder="再次確認新密碼">
            </div>

            <button type="submit" class="btn btn-outline-danger w-100 py-2.5" :disabled="changingPassword">
              <span v-if="changingPassword" class="spinner-border spinner-border-sm"></span>
              <span v-else><i class="bi bi-key"></i> 確認變更密碼</span>
            </button>
          </form>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'ProfileView',
  setup() {
    const authStore = useAuthStore();
    const loading = ref(true);
    const updatingProfile = ref(false);
    const changingPassword = ref(false);
    const successMsg = ref('');
    const errorMsg = ref('');

    const profileForm = ref({
      name: '',
      email: '',
      birthday: '',
      gender: '',
      retirementAge: 65,
      lifeExpectancy: 85,
      laborInsurance: 0,
      laborPension: 0
    });

    const passForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const fetchProfile = async () => {
      loading.value = true;
      try {
        const data = await authStore.getProfile();
        const user = data.user;
        const plan = data.retirementPlan;

        profileForm.value = {
          name: user.name,
          email: user.email,
          birthday: user.birthday ? user.birthday.substring(0, 10) : '',
          gender: user.gender || '',
          retirementAge: user.retirementAge,
          lifeExpectancy: user.lifeExpectancy,
          laborInsurance: plan ? plan.laborInsurance : 0,
          laborPension: plan ? plan.laborPension : 0
        };
      } catch (err) {
        errorMsg.value = '加載個人檔案失敗';
      } finally {
        loading.value = false;
      }
    };

    const handleUpdateProfile = async () => {
      if (profileForm.value.retirementAge >= profileForm.value.lifeExpectancy) {
        errorMsg.value = '預期壽命必須大於退休年齡';
        return;
      }

      updatingProfile.value = true;
      successMsg.value = '';
      errorMsg.value = '';
      try {
        const payload = {
          name: profileForm.value.name,
          birthday: profileForm.value.birthday ? new Date(profileForm.value.birthday) : null,
          gender: profileForm.value.gender,
          retirementAge: profileForm.value.retirementAge,
          lifeExpectancy: profileForm.value.lifeExpectancy,
          laborInsurance: profileForm.value.laborInsurance,
          laborPension: profileForm.value.laborPension
        };

        const res = await authStore.updateProfile(payload);
        if (res.success) {
          successMsg.value = res.message;
          await fetchProfile();
        } else {
          errorMsg.value = res.message;
        }
      } catch (err) {
        errorMsg.value = '保存資料失敗';
      } finally {
        updatingProfile.value = false;
      }
    };

    const handleChangePassword = async () => {
      successMsg.value = '';
      errorMsg.value = '';

      if (passForm.value.newPassword !== passForm.value.confirmPassword) {
        errorMsg.value = '兩次輸入的新密碼不一致';
        return;
      }

      changingPassword.value = true;
      try {
        const res = await authStore.changePassword({
          currentPassword: passForm.value.currentPassword,
          newPassword: passForm.value.newPassword
        });
        if (res.success) {
          successMsg.value = res.message;
          passForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
        } else {
          errorMsg.value = res.message;
        }
      } catch (err) {
        errorMsg.value = '更變密碼失敗';
      } finally {
        changingPassword.value = false;
      }
    };

    onMounted(() => {
      fetchProfile();
    });

    return {
      loading,
      updatingProfile,
      changingPassword,
      successMsg,
      errorMsg,
      profileForm,
      passForm,
      handleUpdateProfile,
      handleChangePassword
    };
  }
};
</script>

<style scoped>
.fs-7 {
  font-size: 0.9rem;
}
</style>
