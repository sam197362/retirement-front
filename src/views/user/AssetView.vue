<template>
  <div>
    <div class="row align-items-center mb-4">
      <div class="col-sm-6">
        <h2 class="fw-bold m-0 text-light"><i class="bi bi-bank text-success me-2"></i> 資產配置管理</h2>
        <p class="text-secondary mb-0">管理您當前持有的全部資產與其預估年化報酬率</p>
      </div>
      <div class="col-sm-6 text-sm-end mt-3 mt-sm-0">
        <button @click="openCreateModal" class="btn btn-primary-green">
          <i class="bi bi-plus-lg"></i> 新增資產項目
        </button>
      </div>
    </div>

    <!-- Feedback Message -->
    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="bi bi-check-circle-fill"></i> {{ successMsg }}
      <button type="button" class="btn-close btn-close-white" @click="successMsg = ''"></button>
    </div>
    <div v-if="errorMsg" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ errorMsg }}
      <button type="button" class="btn-close btn-close-white" @click="errorMsg = ''"></button>
    </div>

    <!-- Assets List Card -->
    <div class="glass-card">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status"></div>
        <p class="text-secondary mt-2">載入中...</p>
      </div>

      <div v-else-if="assets.length === 0" class="text-center py-5">
        <i class="bi bi-bank2 display-1 text-secondary opacity-25"></i>
        <p class="text-secondary mt-3 fs-5">目前尚無任何資產項目，請點擊右上角新增項目。</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-custom align-middle">
          <thead>
            <tr>
              <th>資產名稱</th>
              <th>分類</th>
              <th>持有金額 (NTD)</th>
              <th>年化報酬率</th>
              <th>估計年收益 (NTD)</th>
              <th>備註說明</th>
              <th class="text-end">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asset in assets" :key="asset._id">
              <td class="fw-semibold text-light">{{ asset.name }}</td>
              <td>
                <span class="badge bg-secondary px-2.5 py-1.5 rounded">{{ asset.assetTypeId?.name || '未分類' }}</span>
              </td>
              <td class="text-success fw-bold">${{ formatCurrency(asset.amount) }}</td>
              <td class="fw-bold text-info">{{ asset.annualReturn }}%</td>
              <td class="text-warning fw-bold">${{ formatCurrency(asset.amount * (asset.annualReturn / 100)) }}</td>
              <td class="text-secondary text-truncate" style="max-width: 200px;" :title="asset.remark">
                {{ asset.remark || '-' }}
              </td>
              <td class="text-end">
                <div class="btn-group gap-1">
                  <button @click="openEditModal(asset)" class="btn btn-sm btn-outline-light" title="編輯">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button @click="handleDelete(asset._id)" class="btn btn-sm btn-outline-danger" title="刪除">
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
    <div class="modal fade" id="assetModal" tabindex="-1" ref="assetModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark-secondary border border-color rounded-3 text-light">
          <div class="modal-header border-bottom border-color">
            <h5 class="modal-title fw-bold">{{ isEditMode ? '編輯資產項目' : '新增資產項目' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label for="assetType" class="form-label">資產分類</label>
                <select id="assetType" v-model="form.assetTypeId" @change="handleTypeChange" class="form-select" required>
                  <option value="">請選擇</option>
                  <option v-for="type in activeAssetTypes" :key="type._id" :value="type._id">
                    {{ type.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label for="name" class="form-label">資產名稱</label>
                <input type="text" id="name" v-model="form.name" class="form-control" placeholder="例如：台股個人帳戶、郵局活存、美債" required>
              </div>

              <div class="row mb-3">
                <div class="col-12">
                  <label for="amount" class="form-label">持有金額 (元)</label>
                  <input type="number" id="amount" v-model.number="form.amount" class="form-control" min="0" required>
                </div>
              </div>

              <div class="mb-3">
                <label for="annualReturn" class="form-label">預估年化報酬率 (%)</label>
                <input type="number" id="annualReturn" v-model.number="form.annualReturn" class="form-control" min="-100" max="100" step="0.1" required>
                <div class="form-text text-secondary">定存約 1.5%，全球股票大盤長期約 5% - 8%</div>
              </div>

              <div class="mb-2">
                <label for="remark" class="form-label">備註欄位</label>
                <textarea id="remark" v-model="form.remark" class="form-control" rows="2" placeholder="備註說明"></textarea>
              </div>
            </div>
            <div class="modal-footer border-top border-color">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
              <button type="submit" class="btn btn-primary-green px-4" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm" role="status"></span>
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  name: 'AssetView',
  setup() {
    const assets = ref([]);
    const activeAssetTypes = ref([]);
    const loading = ref(true);
    const saving = ref(false);
    const successMsg = ref('');
    const errorMsg = ref('');

    const isEditMode = ref(false);
    const editId = ref(null);
    const assetModalRef = ref(null);
    let modalInstance = null;

    const form = ref({
      name: '',
      assetTypeId: '',
      amount: 0,
      annualReturn: 0,
      remark: ''
    });

    const formatCurrency = (val) => val?.toLocaleString() || '0';

    const fetchAssets = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/api/assets');
        if (res.data.success) {
          assets.value = res.data.data;
        }
      } catch (err) {
        errorMsg.value = '無法載入資產清單';
      } finally {
        loading.value = false;
      }
    };

    const fetchActiveTypes = async () => {
      try {
        const res = await axios.get('/api/assets/types');
        if (res.data.success) {
          activeAssetTypes.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch asset types', err);
      }
    };

    const handleTypeChange = () => {
      const selectedType = activeAssetTypes.value.find(t => t._id === form.value.assetTypeId);
      if (selectedType) {
        form.value.name = selectedType.name;
      }
    };

    const openCreateModal = () => {
      isEditMode.value = false;
      editId.value = null;
      form.value = {
        name: '',
        assetTypeId: '',
        amount: 0,
        annualReturn: 0,
        remark: ''
      };
      showModal();
    };

    const openEditModal = (asset) => {
      isEditMode.value = true;
      editId.value = asset._id;
      form.value = {
        name: asset.name,
        assetTypeId: asset.assetTypeId?._id || '',
        amount: asset.amount,
        annualReturn: asset.annualReturn,
        remark: asset.remark || ''
      };
      showModal();
    };

    const showModal = () => {
      if (!modalInstance) {
        modalInstance = new Modal(assetModalRef.value);
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
      errorMsg.value = '';
      try {
        if (isEditMode.value) {
          const res = await axios.put(`/api/assets/${editId.value}`, form.value);
          if (res.data.success) {
            successMsg.value = res.data.message;
            await fetchAssets();
            hideModal();
          }
        } else {
          const res = await axios.post('/api/assets', form.value);
          if (res.data.success) {
            successMsg.value = res.data.message;
            await fetchAssets();
            hideModal();
          }
        }
      } catch (err) {
        errorMsg.value = err.response?.data?.message || '儲存失敗，請檢查欄位格式';
      } finally {
        saving.value = false;
      }
    };

    const handleDelete = async (id) => {
      if (!confirm('確認刪除此項目嗎？')) return;
      errorMsg.value = '';
      successMsg.value = '';
      try {
        const res = await axios.delete(`/api/assets/${id}`);
        if (res.data.success) {
          successMsg.value = res.data.message;
          await fetchAssets();
        }
      } catch (err) {
        errorMsg.value = '刪除項目失敗';
      }
    };

    onMounted(async () => {
      await fetchActiveTypes();
      await fetchAssets();
    });

    return {
      assets,
      activeAssetTypes,
      loading,
      saving,
      successMsg,
      errorMsg,
      isEditMode,
      form,
      assetModalRef,
      formatCurrency,
      openCreateModal,
      openEditModal,
      handleSubmit,
      handleDelete,
      handleTypeChange
    };
  }
};
</script>

<style scoped>
.fs-7 {
  font-size: 0.9rem;
}
</style>
