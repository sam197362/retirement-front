<template>
  <div>
    <div class="row align-items-center mb-4">
      <div class="col-sm-6">
        <h2 class="fw-bold m-0 text-light"><i class="bi bi-wallet2 text-success me-2"></i> 收入來源管理</h2>
        <p class="text-secondary mb-0">維護您在工作期或退休後持續的各項收入來源</p>
      </div>
      <div class="col-sm-6 text-sm-end mt-3 mt-sm-0">
        <button @click="openCreateModal" class="btn btn-primary-green">
          <i class="bi bi-plus-lg"></i> 新增收入項目
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

    <!-- Incomes List Card -->
    <div class="glass-card">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status"></div>
        <p class="text-secondary mt-2">載入中...</p>
      </div>

      <div v-else-if="incomes.length === 0" class="text-center py-5">
        <i class="bi bi-wallet2 display-1 text-secondary opacity-25"></i>
        <p class="text-secondary mt-3 fs-5">目前尚無任何收入來源，請點擊右上角新增項目。</p>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-custom align-middle">
          <thead>
            <tr>
              <th>名稱</th>
              <th>分類</th>
              <th>金額 (NTD)</th>
              <th>週期</th>
              <th>每月換算 (NTD)</th>
              <th>開始日期</th>
              <th>到期日期</th>
              <th>退休後是否持續</th>
              <th>備註</th>
              <th class="text-end">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="income in incomes" :key="income._id">
              <td class="fw-semibold text-light">{{ income.name }}</td>
              <td>
                <span class="badge bg-secondary px-2.5 py-1.5 rounded">{{ income.incomeTypeId?.name || '未分類' }}</span>
              </td>
              <td class="text-success fw-bold">${{ formatCurrency(income.amount) }}</td>
              <td>{{ translateFrequency(income.frequency) }}</td>
              <td class="text-info fw-bold">${{ formatCurrency(calculateMonthlyEquivalent(income)) }}</td>
              <td>{{ formatDate(income.startDate) }}</td>
              <td>{{ formatDate(income.endDate) || '-' }}</td>
              <td>
                <span v-if="income.continueAfterRetirement" class="badge bg-success-light text-success px-2 py-1.5 rounded-pill">
                  <i class="bi bi-check-circle"></i> 持續
                </span>
                <span v-else class="badge bg-dark-tertiary text-secondary px-2 py-1.5 rounded-pill">
                  <i class="bi bi-slash-circle"></i> 停止
                </span>
              </td>
              <td class="text-secondary text-truncate" style="max-width: 150px;" :title="income.remark">
                {{ income.remark || '-' }}
              </td>
              <td class="text-end">
                <div class="btn-group gap-1">
                  <button @click="openEditModal(income)" class="btn btn-sm btn-outline-light" title="編輯">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button @click="handleDelete(income._id)" class="btn btn-sm btn-outline-danger" title="刪除">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr class="fw-bold bg-dark-secondary" v-if="incomes.length > 0">
              <td colspan="4" class="text-light text-end">每月換算總計：</td>
              <td class="text-info fw-bold">${{ formatCurrency(totalMonthlyIncome) }}</td>
              <td colspan="5"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Save Modal -->
    <div class="modal fade" id="incomeModal" tabindex="-1" ref="incomeModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark-secondary border border-color rounded-3 text-light">
          <div class="modal-header border-bottom border-color">
            <h5 class="modal-title fw-bold">{{ isEditMode ? '編輯收入來源' : '新增收入來源' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label for="incomeType" class="form-label">收入分類</label>
                <select id="incomeType" v-model="form.incomeTypeId" @change="handleTypeChange" class="form-select" required>
                  <option value="">請選擇</option>
                  <option v-for="type in activeIncomeTypes" :key="type._id" :value="type._id">
                    {{ type.name }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label for="name" class="form-label">項目名稱</label>
                <input type="text" id="name" v-model="form.name" class="form-control" placeholder="例如：本職薪資、副業收入" required>
              </div>

              <div class="row mb-3">
                <div class="col-6">
                  <label for="amount" class="form-label">金額 (元)</label>
                  <input type="number" id="amount" v-model.number="form.amount" class="form-control" min="0" required>
                </div>
                <div class="col-6">
                  <label for="frequency" class="form-label">週期</label>
                  <select id="frequency" v-model="form.frequency" class="form-select" required>
                    <option value="monthly">每月</option>
                    <option value="quarterly">每季</option>
                    <option value="semi-annually">每半年</option>
                    <option value="annually">每年</option>
                    <option value="one-time">一次性</option>
                  </select>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-6">
                  <label for="startDate" class="form-label">開始日期</label>
                  <input type="date" id="startDate" v-model="form.startDate" class="form-control" required>
                </div>
                <div class="col-6">
                  <label for="endDate" class="form-label">到期日期 <span class="text-secondary fs-8">(選填)</span></label>
                  <input type="date" id="endDate" v-model="form.endDate" class="form-control">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label d-flex justify-content-between align-items-center">
                  <span>退休後持續</span>
                  <span :class="form.continueAfterRetirement ? 'badge bg-success-light text-success' : 'badge bg-secondary-light text-secondary'">
                    {{ form.continueAfterRetirement ? '持續收入 (ON)' : '退休終止 (OFF)' }}
                  </span>
                </label>
                <div class="form-check form-switch py-1 d-flex align-items-center gap-2">
                  <input class="form-check-input cursor-pointer" type="checkbox" id="continueAfterRetirement" v-model="form.continueAfterRetirement">
                  <label class="form-check-label cursor-pointer" :class="form.continueAfterRetirement ? 'text-success fw-bold' : 'text-secondary'" for="continueAfterRetirement">
                    退休年齡後，此項目收入仍持續 (如：股息、租金)
                  </label>
                </div>
                <div class="form-text text-info mt-1" v-if="!form.continueAfterRetirement">
                  <i class="bi bi-info-circle me-1"></i>已選擇退休後不持續，自動帶入預估退休日期 ({{ getEstimatedRetirementDate() }})
                </div>
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
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { Modal } from 'bootstrap';
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'IncomeView',
  setup() {
    const authStore = useAuthStore();
    const incomes = ref([]);
    const activeIncomeTypes = ref([]);
    const loading = ref(true);
    const saving = ref(false);
    const successMsg = ref('');
    const errorMsg = ref('');

    const isEditMode = ref(false);
    const editId = ref(null);
    const incomeModalRef = ref(null);
    let modalInstance = null;

    const form = ref({
      name: '',
      incomeTypeId: '',
      amount: 0,
      frequency: 'monthly',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
      continueAfterRetirement: false,
      remark: ''
    });

    const getEstimatedRetirementDate = () => {
      const user = authStore.user;
      const retirementAge = user?.retirementAge || 65;
      if (user?.birthday) {
        const birthDate = new Date(user.birthday);
        if (!isNaN(birthDate.getTime())) {
          const retYear = birthDate.getFullYear() + Number(retirementAge);
          const month = String(birthDate.getMonth() + 1).padStart(2, '0');
          const day = String(birthDate.getDate()).padStart(2, '0');
          return `${retYear}-${month}-${day}`;
        }
      }
      const currentYear = new Date().getFullYear();
      const retYear = currentYear + (Number(retirementAge) - 30);
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      return `${retYear}-${month}-${day}`;
    };

    watch(() => form.value.continueAfterRetirement, (newVal) => {
      if (newVal === false) {
        if (!form.value.endDate || form.value.endDate === '') {
          form.value.endDate = getEstimatedRetirementDate();
        }
      } else if (newVal === true) {
        if (form.value.endDate === getEstimatedRetirementDate()) {
          form.value.endDate = '';
        }
      }
    });

    const formatCurrency = (val) => val?.toLocaleString() || '0';
    
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        if (typeof dateStr !== 'string') {
          dateStr = new Date(dateStr).toISOString();
        }
        return dateStr.substring(0, 10);
      } catch (e) {
        return String(dateStr).substring(0, 10);
      }
    };

    const translateFrequency = (freq) => {
      const map = {
        'monthly': '每月',
        'quarterly': '每季',
        'semi-annually': '每半年',
        'annually': '每年',
        'one-time': '一次性'
      };
      return map[freq] || freq;
    };

    const calculateMonthlyEquivalent = (income) => {
      const multiplier = {
        'monthly': 1,
        'quarterly': 1/3,
        'semi-annually': 1/6,
        'annually': 1/12,
        'one-time': 0
      };
      return Math.round((income.amount || 0) * (multiplier[income.frequency] || 0));
    };

    const totalMonthlyIncome = computed(() => {
      return incomes.value.reduce((sum, income) => sum + calculateMonthlyEquivalent(income), 0);
    });

    const fetchIncomes = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/api/incomes');
        if (res.data.success) {
          incomes.value = res.data.data;
        }
      } catch (err) {
        errorMsg.value = '無法載入收入清單';
      } finally {
        loading.value = false;
      }
    };

    const fetchActiveTypes = async () => {
      try {
        const res = await axios.get('/api/incomes/types');
        if (res.data.success) {
          activeIncomeTypes.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch income types', err);
      }
    };

    const handleTypeChange = () => {
      const selectedType = activeIncomeTypes.value.find(t => t._id === form.value.incomeTypeId);
      if (selectedType) {
        form.value.name = selectedType.name;
      }
    };

    const openCreateModal = () => {
      isEditMode.value = false;
      editId.value = null;
      form.value = {
        name: '',
        incomeTypeId: '',
        amount: 0,
        frequency: 'monthly',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: getEstimatedRetirementDate(),
        continueAfterRetirement: false,
        remark: ''
      };
      showModal();
    };

    const openEditModal = (income) => {
      isEditMode.value = true;
      editId.value = income._id;
      const continueRet = income.continueAfterRetirement;
      let endDateVal = income.endDate ? formatDate(income.endDate) : '';
      if (!continueRet && !endDateVal) {
        endDateVal = getEstimatedRetirementDate();
      }
      form.value = {
        name: income.name || '',
        incomeTypeId: income.incomeTypeId?._id || income.incomeTypeId || '',
        amount: income.amount || 0,
        frequency: income.frequency || 'monthly',
        startDate: income.startDate ? formatDate(income.startDate) : new Date().toISOString().substring(0, 10),
        endDate: endDateVal,
        continueAfterRetirement: continueRet ?? false,
        remark: income.remark || ''
      };
      showModal();
    };

    const showModal = () => {
      if (!modalInstance) {
        modalInstance = new Modal(incomeModalRef.value);
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
        const payload = {
          ...form.value,
          endDate: form.value.endDate ? form.value.endDate : null
        };
        if (isEditMode.value) {
          const res = await axios.put(`/api/incomes/${editId.value}`, payload);
          if (res.data.success) {
            successMsg.value = res.data.message;
            await fetchIncomes();
            hideModal();
          }
        } else {
          const res = await axios.post('/api/incomes', payload);
          if (res.data.success) {
            successMsg.value = res.data.message;
            await fetchIncomes();
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
        const res = await axios.delete(`/api/incomes/${id}`);
        if (res.data.success) {
          successMsg.value = res.data.message;
          await fetchIncomes();
        }
      } catch (err) {
        errorMsg.value = '刪除項目失敗';
      }
    };

    onMounted(async () => {
      try {
        await authStore.getProfile();
      } catch (err) {
        console.warn('Failed to load profile in onMounted:', err);
      }
      await fetchActiveTypes();
      await fetchIncomes();
    });

    return {
      incomes,
      activeIncomeTypes,
      loading,
      saving,
      successMsg,
      errorMsg,
      isEditMode,
      form,
      incomeModalRef,
      formatCurrency,
      formatDate,
      calculateMonthlyEquivalent,
      totalMonthlyIncome,
      translateFrequency,
      openCreateModal,
      openEditModal,
      handleSubmit,
      handleDelete,
      handleTypeChange,
      getEstimatedRetirementDate
    };
  }
};
</script>

<style scoped>
.bg-success-light {
  background-color: rgba(25, 135, 84, 0.15);
}
.fs-7 {
  font-size: 0.9rem;
}
</style>
