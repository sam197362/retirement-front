<template>
  <div>
    <!-- Header -->
    <div class="row align-items-center mb-4">
      <div class="col-md-7">
        <h2 class="fw-bold m-0 text-light">管理員帳號維護 Admin Management</h2>
        <p class="text-secondary mb-0">管理後台登入帳號、權限角色與啟用狀態</p>
      </div>
      <div class="col-md-5 text-md-end mt-3 mt-md-0 d-flex gap-2 justify-content-md-end">
        <button @click="fetchAdmins" class="btn btn-outline-secondary" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i> 重新整理
        </button>
        <button @click="openCreateModal" class="btn btn-warning-custom">
          <i class="bi bi-person-plus-fill me-1"></i> 新增管理員
        </button>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="glass-card mb-4 p-3">
      <div class="row g-3 align-items-center">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text bg-dark-primary border-color text-secondary">
              <i class="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              v-model="searchQuery" 
              class="form-control bg-dark-primary border-color text-light" 
              placeholder="搜尋姓名、帳號或 Email..."
            >
          </div>
        </div>
        <div class="col-md-4">
          <select v-model="roleFilter" class="form-select bg-dark-primary border-color text-light">
            <option value="">全部權限角色</option>
            <option value="super_admin">超級管理員 (Super Admin)</option>
            <option value="admin">一般管理員 (Admin)</option>
          </select>
        </div>
        <div class="col-md-2 text-end text-secondary fs-7">
          共 {{ filteredAdmins.length }} 位管理員
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status"></div>
      <p class="text-secondary mt-2">載入管理員列表中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAdmins.length === 0" class="glass-card text-center py-5 text-secondary">
      <i class="bi bi-person-x display-3 opacity-25"></i>
      <p class="mt-3 fs-5">尚無符合條件的管理員帳號</p>
    </div>

    <!-- Admins Table -->
    <div v-else class="glass-card p-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-custom align-middle mb-0">
          <thead>
            <tr>
              <th>管理員姓名</th>
              <th>登入帳號</th>
              <th>電子郵件</th>
              <th>權限角色</th>
              <th>帳號狀態</th>
              <th>建立日期</th>
              <th class="text-end px-4">操作維護</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredAdmins" :key="item._id">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="avatar-circle">
                    {{ item.name ? item.name.charAt(0).toUpperCase() : 'A' }}
                  </div>
                  <div>
                    <span class="fw-bold text-light d-block">{{ item.name }}</span>
                    <span v-if="item._id === currentAdminId" class="badge bg-warning-light text-warning fs-8">本人目前登入</span>
                  </div>
                </div>
              </td>
              <td><code>{{ item.account }}</code></td>
              <td class="text-secondary">{{ item.email }}</td>
              <td>
                <span v-if="item.role === 'super_admin'" class="badge bg-danger-light text-danger px-3 py-1.5 rounded-pill">
                  <i class="bi bi-shield-fill-check me-1"></i> 超級管理員
                </span>
                <span v-else class="badge bg-info-light text-info px-3 py-1.5 rounded-pill">
                  <i class="bi bi-shield me-1"></i> 一般管理員
                </span>
              </td>
              <td>
                <button 
                  @click="toggleStatus(item)" 
                  class="btn btn-sm border-0 p-0"
                  :disabled="item._id === currentAdminId"
                  :title="item._id === currentAdminId ? '無法停用自身帳號' : '點擊切換狀態'"
                >
                  <span v-if="item.status" class="badge bg-success-light text-success px-3 py-1.5 rounded-pill cursor-pointer">
                    <i class="bi bi-check-circle-fill me-1"></i> 啟用中
                  </span>
                  <span v-else class="badge bg-secondary-light text-secondary px-3 py-1.5 rounded-pill cursor-pointer">
                    <i class="bi bi-x-circle-fill me-1"></i> 已停用
                  </span>
                </button>
              </td>
              <td class="text-secondary fs-7">{{ formatDate(item.createdAt) }}</td>
              <td class="text-end px-4">
                <div class="btn-group">
                  <button @click="openEditModal(item)" class="btn btn-sm btn-outline-warning" title="編輯管理員">
                    <i class="bi bi-pencil-square"></i> 編輯
                  </button>
                  <button 
                    @click="confirmDelete(item)" 
                    class="btn btn-sm btn-outline-danger" 
                    :disabled="item._id === currentAdminId"
                    title="刪除管理員"
                  >
                    <i class="bi bi-trash"></i> 刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Admin Modal -->
    <div class="modal fade" id="adminModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark-secondary text-light border-color">
          <div class="modal-header border-color">
            <h5 class="modal-title fw-bold">
              <i :class="isEditMode ? 'bi bi-pencil-square text-warning' : 'bi bi-person-plus-fill text-warning'" class="me-2"></i>
              {{ isEditMode ? '編輯管理員帳號' : '新增管理員帳號' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveAdmin">
            <div class="modal-body">
              <div v-if="modalError" class="alert alert-danger fs-7 py-2 mb-3">
                <i class="bi bi-exclamation-octagon me-1"></i> {{ modalError }}
              </div>

              <!-- Name -->
              <div class="mb-3">
                <label for="admin-name" class="form-label text-secondary">姓名 Name <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  id="admin-name" 
                  v-model="form.name" 
                  class="form-control bg-dark-primary border-color text-light" 
                  placeholder="請輸入姓名 (如：張系統)" 
                  required
                >
              </div>

              <!-- Account -->
              <div class="mb-3">
                <label for="admin-account" class="form-label text-secondary">登入帳號 Username <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  id="admin-account" 
                  v-model="form.account" 
                  class="form-control bg-dark-primary border-color text-light" 
                  placeholder="請輸入登入帳號 (如：admin02)" 
                  required
                >
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="admin-email" class="form-label text-secondary">電子郵件 Email <span class="text-danger">*</span></label>
                <input 
                  type="email" 
                  id="admin-email" 
                  v-model="form.email" 
                  class="form-control bg-dark-primary border-color text-light" 
                  placeholder="admin@example.com" 
                  required
                >
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label for="admin-password" class="form-label text-secondary">
                  安全密碼 Password 
                  <span v-if="!isEditMode" class="text-danger">*</span>
                  <span v-else class="text-dim fs-8 ms-1">(如不修改請留空)</span>
                </label>
                <input 
                  type="password" 
                  id="admin-password" 
                  v-model="form.password" 
                  class="form-control bg-dark-primary border-color text-light" 
                  :placeholder="isEditMode ? '不修改請保持空白' : '最少 6 個字元'" 
                  :required="!isEditMode"
                  minlength="6"
                >
              </div>

              <!-- Role -->
              <div class="mb-3">
                <label for="admin-role" class="form-label text-secondary">權限角色 Role <span class="text-danger">*</span></label>
                <select id="admin-role" v-model="form.role" class="form-select bg-dark-primary border-color text-light" required>
                  <option value="admin">一般管理員 (Admin)</option>
                  <option value="super_admin">超級管理員 (Super Admin)</option>
                </select>
              </div>

              <!-- Status -->
              <div class="mb-3">
                <label class="form-label text-secondary d-block">帳號狀態 Status</label>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" id="status-active" :value="true" v-model="form.status">
                  <label class="form-check-label text-success" for="status-active">啟用</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" id="status-inactive" :value="false" v-model="form.status">
                  <label class="form-check-label text-secondary" for="status-inactive">停用</label>
                </div>
              </div>
            </div>

            <div class="modal-footer border-color">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
              <button type="submit" class="btn btn-warning-custom" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ isEditMode ? '儲存變更' : '確認新增' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminManagementView',
  setup() {
    const authStore = useAuthStore();
    const admins = ref([]);
    const loading = ref(true);
    const submitting = ref(false);
    const searchQuery = ref('');
    const roleFilter = ref('');

    const isEditMode = ref(false);
    const editId = ref(null);
    const modalError = ref('');
    let bootstrapModal = null;

    const form = ref({
      name: '',
      account: '',
      email: '',
      password: '',
      role: 'admin',
      status: true
    });

    const currentAdminId = computed(() => authStore.currentAdmin?.id);

    const filteredAdmins = computed(() => {
      return admins.value.filter(item => {
        const matchesQuery = 
          !searchQuery.value ||
          item.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.account?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchQuery.value.toLowerCase());

        const matchesRole = !roleFilter.value || item.role === roleFilter.value;

        return matchesQuery && matchesRole;
      });
    });

    const fetchAdmins = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/api/admin/admins');
        if (res.data.success) {
          admins.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to load admin list', err);
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      form.value = {
        name: '',
        account: '',
        email: '',
        password: '',
        role: 'admin',
        status: true
      };
      modalError.value = '';
    };

    const openCreateModal = () => {
      isEditMode.value = false;
      editId.value = null;
      resetForm();
      if (!bootstrapModal) {
        bootstrapModal = new Modal(document.getElementById('adminModal'));
      }
      bootstrapModal.show();
    };

    const openEditModal = (item) => {
      isEditMode.value = true;
      editId.value = item._id;
      modalError.value = '';
      form.value = {
        name: item.name,
        account: item.account,
        email: item.email,
        password: '', // blank by default
        role: item.role || 'admin',
        status: item.status !== undefined ? item.status : true
      };
      if (!bootstrapModal) {
        bootstrapModal = new Modal(document.getElementById('adminModal'));
      }
      bootstrapModal.show();
    };

    const saveAdmin = async () => {
      submitting.value = true;
      modalError.value = '';
      try {
        let res;
        if (isEditMode.value) {
          res = await axios.put(`/api/admin/admins/${editId.value}`, form.value);
        } else {
          res = await axios.post('/api/admin/admins', form.value);
        }

        if (res.data.success) {
          if (bootstrapModal) {
            bootstrapModal.hide();
          }
          await fetchAdmins();
        }
      } catch (err) {
        modalError.value = err.response?.data?.message || '儲存管理員失敗，請再試一次';
      } finally {
        submitting.value = false;
      }
    };

    const toggleStatus = async (item) => {
      if (item._id === currentAdminId.value) return;
      try {
        const updatedStatus = !item.status;
        const res = await axios.put(`/api/admin/admins/${item._id}`, { status: updatedStatus });
        if (res.data.success) {
          item.status = updatedStatus;
        }
      } catch (err) {
        alert(err.response?.data?.message || '更新狀態失敗');
      }
    };

    const confirmDelete = async (item) => {
      if (item._id === currentAdminId.value) {
        alert('無法刪除目前登入中的管理員帳號');
        return;
      }

      if (!confirm(`確定要刪除管理員帳號「${item.name} (${item.account})」嗎？此操作無法復原。`)) {
        return;
      }

      try {
        const res = await axios.delete(`/api/admin/admins/${item._id}`);
        if (res.data.success) {
          await fetchAdmins();
        }
      } catch (err) {
        alert(err.response?.data?.message || '刪除管理員失敗');
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    onMounted(() => {
      fetchAdmins();
    });

    return {
      admins,
      loading,
      submitting,
      searchQuery,
      roleFilter,
      filteredAdmins,
      currentAdminId,
      isEditMode,
      form,
      modalError,
      fetchAdmins,
      openCreateModal,
      openEditModal,
      saveAdmin,
      toggleStatus,
      confirmDelete,
      formatDate
    };
  }
};
</script>

<style scoped>
.btn-warning-custom {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border: none;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.btn-warning-custom:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.bg-info-light {
  background-color: rgba(6, 182, 212, 0.15);
}

.bg-danger-light {
  background-color: rgba(244, 63, 94, 0.15);
}

.bg-secondary-light {
  background-color: rgba(148, 163, 184, 0.15);
}

.bg-success-light {
  background-color: rgba(16, 185, 129, 0.15);
}

.fs-8 {
  font-size: 0.78rem;
}

.cursor-pointer {
  cursor: pointer;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
