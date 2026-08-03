<template>
  <div>
    <div class="row align-items-center mb-4">
      <div class="col-sm-8">
        <h2 class="fw-bold m-0 text-light"><i class="bi bi-people text-warning me-2"></i> 前台會員管理</h2>
        <p class="text-secondary mb-0">審查全站註冊會員基本檔案與其帳號使用狀態 (停權/啟用)</p>
      </div>
    </div>

    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill"></i> {{ successMsg }}
      <button type="button" class="btn-close btn-close-white" @click="successMsg = ''"></button>
    </div>

    <!-- Users List Card -->
    <div class="glass-card">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
      </div>

      <div v-else-if="users.length === 0" class="text-center py-5 text-secondary">
        目前無註冊會員。
      </div>

      <div v-else class="table-responsive">
        <table class="table table-custom align-middle">
          <thead>
            <tr>
              <th>會員姓名</th>
              <th>電子郵件</th>
              <th>出生年月</th>
              <th>退休年齡/預估壽命</th>
              <th>狀態</th>
              <th>註冊日期</th>
              <th class="text-end">狀態切換</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td class="fw-bold text-light">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ formatDate(user.birthday) }}</td>
              <td>{{ user.retirementAge }} 歲 / {{ user.lifeExpectancy }} 歲</td>
              <td>
                <span v-if="user.status" class="badge bg-success-light text-success px-2 py-1.5 rounded-pill">
                  使用中
                </span>
                <span v-else class="badge bg-danger-light text-danger px-2 py-1.5 rounded-pill">
                  停權中
                </span>
              </td>
              <td>{{ formatDateTime(user.createdAt) }}</td>
              <td class="text-end">
                <button 
                  v-if="user.status" 
                  @click="toggleUserStatus(user._id, false)" 
                  class="btn btn-sm btn-outline-danger"
                >
                  <i class="bi bi-slash-circle"></i> 停權此帳號
                </button>
                <button 
                  v-else 
                  @click="toggleUserStatus(user._id, true)" 
                  class="btn btn-sm btn-outline-success"
                >
                  <i class="bi bi-check-circle"></i> 重新啟用
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'UserManagementView',
  setup() {
    const users = ref([]);
    const loading = ref(true);
    const successMsg = ref('');

    const fetchUsers = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/api/admin/users');
        if (res.data.success) {
          users.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        loading.value = false;
      }
    };

    const toggleUserStatus = async (id, status) => {
      const confirmText = status ? '確認重新啟用此會員帳號嗎？' : '確認要停權此會員帳號嗎？(停權後該會員將無法登入)';
      if (!confirm(confirmText)) return;

      try {
        const res = await axios.put(`/api/admin/users/${id}/status`, { status });
        if (res.data.success) {
          successMsg.value = res.data.message;
          await fetchUsers();
        }
      } catch (err) {
        alert('操作失敗');
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      successMsg,
      toggleUserStatus,
      formatDate,
      formatDateTime
    };
  }
};
</script>

<style scoped>
.bg-success-light {
  background-color: rgba(25, 135, 84, 0.15);
}
.bg-danger-light {
  background-color: rgba(220, 53, 69, 0.15);
}
</style>
