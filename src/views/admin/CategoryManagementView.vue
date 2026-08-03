<template>
  <div>
    <h2 class="fw-bold text-light mb-1"><i class="bi bi-tags text-warning me-2"></i> 預設項目分類管理</h2>
    <p class="text-secondary mb-4">維護系統預設提供給會員選擇的收入、支出及資產分類項目</p>

    <!-- Nav tabs -->
    <ul class="nav nav-pills mb-4 gap-2" id="category-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button @click="currentTab = 'income'" class="nav-link nav-pill-custom" :class="{ 'active': currentTab === 'income' }">
          收入分類 (Income Types)
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button @click="currentTab = 'expense'" class="nav-link nav-pill-custom" :class="{ 'active': currentTab === 'expense' }">
          支出分類 (Expense Types)
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button @click="currentTab = 'asset'" class="nav-link nav-pill-custom" :class="{ 'active': currentTab === 'asset' }">
          資產分類 (Asset Types)
        </button>
      </li>
    </ul>

    <!-- Actions block -->
    <div class="row align-items-center mb-3">
      <div class="col-6">
        <h5 class="fw-bold text-light m-0">當前項目列表</h5>
      </div>
      <div class="col-6 text-end">
        <button @click="openCreateModal" class="btn btn-warning text-dark fw-bold btn-sm px-3">
          <i class="bi bi-plus-lg"></i> 新增分類項目
        </button>
      </div>
    </div>

    <!-- Feedback Message -->
    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMsg }}
      <button type="button" class="btn-close btn-close-white" @click="successMsg = ''"></button>
    </div>

    <!-- Category List Card -->
    <div class="glass-card">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-custom align-middle">
          <thead>
            <tr>
              <th>分類名稱</th>
              <th>排序權重 (Sort)</th>
              <th>狀態</th>
              <th class="text-end">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentCategories" :key="item._id">
              <td class="fw-bold text-light">{{ item.name }}</td>
              <td>{{ item.sort || 0 }}</td>
              <td>
                <span v-if="item.status" class="badge bg-success-light text-success px-2 py-1">啟用中</span>
                <span v-else class="badge bg-danger-light text-danger px-2 py-1">停用中</span>
              </td>
              <td class="text-end">
                <div class="btn-group gap-1">
                  <button @click="openEditModal(item)" class="btn btn-sm btn-outline-light" title="編輯">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button @click="handleDelete(item._id)" class="btn btn-sm btn-outline-danger" title="刪除">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Save Modal -->
    <div class="modal fade" id="categoryModal" tabindex="-1" ref="categoryModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark-secondary border border-color rounded-3 text-light">
          <div class="modal-header border-bottom border-color">
            <h5 class="modal-title fw-bold">{{ isEditMode ? '編輯分類項目' : '新增分類項目' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label for="catName" class="form-label">分類名稱</label>
                <input type="text" id="catName" v-model="form.name" class="form-control" placeholder="請輸入分類名稱" required>
              </div>

              <div class="mb-3">
                <label for="catSort" class="form-label">排序權重</label>
                <input type="number" id="catSort" v-model.number="form.sort" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">狀態</label>
                <div class="form-check form-switch py-1">
                  <input class="form-check-input" type="checkbox" id="catStatus" v-model="form.status">
                  <label class="form-check-label text-light" for="catStatus">啟用此項目 (未啟用項目在前台不會顯示)</label>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top border-color">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
              <button type="submit" class="btn btn-warning text-dark fw-bold px-4" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                <span v-else>確認儲存</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  name: 'CategoryManagementView',
  setup() {
    const currentTab = ref('income'); // income, expense, asset
    const categories = ref([]);
    const loading = ref(true);
    const saving = ref(false);
    const successMsg = ref('');

    const isEditMode = ref(false);
    const editId = ref(null);
    const categoryModalRef = ref(null);
    let modalInstance = null;

    const form = ref({
      name: '',
      sort: 0,
      status: true
    });

    const currentCategories = computed(() => categories.value);

    const fetchCategories = async () => {
      loading.value = true;
      try {
        const res = await axios.get(`/api/admin/${currentTab.value}-types`);
        if (res.data.success) {
          categories.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        loading.value = false;
      }
    };

    watch(currentTab, () => {
      fetchCategories();
    });

    const openCreateModal = () => {
      isEditMode.value = false;
      editId.value = null;
      form.value = {
        name: '',
        sort: categories.value.length + 1,
        status: true
      };
      showModal();
    };

    const openEditModal = (item) => {
      isEditMode.value = true;
      editId.value = item._id;
      form.value = {
        name: item.name,
        sort: item.sort || 0,
        status: item.status
      };
      showModal();
    };

    const showModal = () => {
      if (!modalInstance) {
        modalInstance = new Modal(categoryModalRef.value);
      }
      modalInstance.show();
    };

    const hideModal = () => {
      if (modalInstance) {
        modalInstance.hide();
      }
    };

    const handleSubmit = async () => {
      saving.value = true;
      successMsg.value = '';
      try {
        if (isEditMode.value) {
          const res = await axios.put(`/api/admin/${currentTab.value}-types/${editId.value}`, form.value);
          if (res.data.success) {
            successMsg.value = res.data.message;
            await fetchCategories();
            hideModal();
          }
        } else {
          const res = await axios.post(`/api/admin/${currentTab.value}-types`, form.value);
          if (res.data.success) {
            successMsg.value = res.data.message;
            await fetchCategories();
            hideModal();
          }
        }
      } catch (err) {
        alert('儲存失敗');
      } finally {
        saving.value = false;
      }
    };

    const handleDelete = async (id) => {
      if (!confirm('確認刪除此項目分類嗎？(這不會影響已套用此項目的現有會員財務資料)')) return;
      successMsg.value = '';
      try {
        const res = await axios.delete(`/api/admin/${currentTab.value}-types/${id}`);
        if (res.data.success) {
          successMsg.value = res.data.message;
          await fetchCategories();
        }
      } catch (err) {
        alert('刪除項目失敗');
      }
    };

    onMounted(() => {
      fetchCategories();
    });

    return {
      currentTab,
      currentCategories,
      loading,
      saving,
      successMsg,
      isEditMode,
      form,
      categoryModalRef,
      openCreateModal,
      openEditModal,
      handleSubmit,
      handleDelete
    };
  }
};
</script>

<style scoped>
.nav-pill-custom {
  background-color: var(--bg-dark-secondary) !important;
  color: var(--text-secondary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  padding: 0.6rem 1.2rem !important;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-pill-custom.active {
  background-color: var(--accent-orange) !important;
  color: #fff !important;
  border-color: var(--accent-orange) !important;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3) !important;
}

.bg-success-light {
  background-color: rgba(25, 135, 84, 0.15);
}
.bg-danger-light {
  background-color: rgba(220, 53, 69, 0.15);
}
</style>
