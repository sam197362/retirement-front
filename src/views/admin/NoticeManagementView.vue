<template>
  <div>
    <div class="row align-items-center mb-4">
      <div class="col-sm-6">
        <h2 class="fw-bold m-0 text-light"><i class="bi bi-megaphone text-warning me-2"></i> 公告公告管理</h2>
        <p class="text-secondary mb-0">管理並發布首頁顯示的最新公告訊息</p>
      </div>
      <div class="col-sm-6 text-sm-end mt-3 mt-sm-0">
        <button @click="openCreateModal" class="btn btn-warning text-dark fw-bold px-3">
          <i class="bi bi-plus-lg"></i> 新增公告
        </button>
      </div>
    </div>

    <!-- Feedback Message -->
    <div v-if="successMsg" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ successMsg }}
      <button type="button" class="btn-close btn-close-white" @click="successMsg = ''"></button>
    </div>

    <!-- Notice List Card -->
    <div class="glass-card">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
      </div>

      <div v-else-if="notices.length === 0" class="text-center py-5 text-secondary">
        目前無系統公告，請點擊右上角新增公告項目。
      </div>

      <div v-else class="table-responsive">
        <table class="table table-custom align-middle">
          <thead>
            <tr>
              <th>標題</th>
              <th>發布日期</th>
              <th>下架日期</th>
              <th>狀態</th>
              <th>建立時間</th>
              <th class="text-end">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice._id">
              <td class="fw-bold text-light">{{ notice.title }}</td>
              <td>{{ formatDate(notice.publishDate) }}</td>
              <td>{{ formatDate(notice.expireDate) || '永久顯示' }}</td>
              <td>
                <span v-if="notice.status" class="badge bg-success-light text-success px-2.5 py-1.5 rounded-pill">顯示中</span>
                <span v-else class="badge bg-danger-light text-danger px-2.5 py-1.5 rounded-pill">已下架</span>
              </td>
              <td>{{ formatDateTime(notice.createdAt) }}</td>
              <td class="text-end">
                <div class="btn-group gap-1">
                  <button @click="openEditModal(notice)" class="btn btn-sm btn-outline-light" title="編輯">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button @click="handleDelete(notice._id)" class="btn btn-sm btn-outline-danger" title="刪除">
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
    <div class="modal fade" id="noticeModal" tabindex="-1" ref="noticeModalRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content bg-dark-secondary border border-color rounded-3 text-light">
          <div class="modal-header border-bottom border-color">
            <h5 class="modal-title fw-bold">{{ isEditMode ? '編輯公告內容' : '新增公告內容' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label for="noticeTitle" class="form-label">公告標題</label>
                <input type="text" id="noticeTitle" v-model="form.title" class="form-control" placeholder="請輸入公告標題" required>
              </div>

              <div class="mb-3">
                <label for="noticeContent" class="form-label">公告內容</label>
                <textarea id="noticeContent" v-model="form.content" class="form-control" rows="6" placeholder="請輸入公告內容描述..." required></textarea>
              </div>

              <div class="row mb-3">
                <div class="col-6">
                  <label for="noticePub" class="form-label">發布生效日期</label>
                  <input type="date" id="noticePub" v-model="form.publishDate" class="form-control" required>
                </div>
                <div class="col-6">
                  <label for="noticeExp" class="form-label">下架過期日期 (選填)</label>
                  <input type="date" id="noticeExp" v-model="form.expireDate" class="form-control">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">狀態</label>
                <div class="form-check form-switch py-1">
                  <input class="form-check-input" type="checkbox" id="noticeStatus" v-model="form.status">
                  <label class="form-check-label text-light" for="noticeStatus">發布啟用此公告 (下架前正常顯示於前台首頁)</label>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top border-color">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
              <button type="submit" class="btn btn-warning text-dark fw-bold px-4" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                <span v-else>確認發布</span>
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
  name: 'NoticeManagementView',
  setup() {
    const notices = ref([]);
    const loading = ref(true);
    const saving = ref(false);
    const successMsg = ref('');

    const isEditMode = ref(false);
    const editId = ref(null);
    const noticeModalRef = ref(null);
    let modalInstance = null;

    const form = ref({
      title: '',
      content: '',
      publishDate: new Date().toISOString().substring(0, 10),
      expireDate: '',
      status: true
    });

    const fetchNotices = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/api/admin/notices');
        if (res.data.success) {
          notices.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to load notices', err);
      } finally {
        loading.value = false;
      }
    };

    const openCreateModal = () => {
      isEditMode.value = false;
      editId.value = null;
      form.value = {
        title: '',
        content: '',
        publishDate: new Date().toISOString().substring(0, 10),
        expireDate: '',
        status: true
      };
      showModal();
    };

    const openEditModal = (notice) => {
      isEditMode.value = true;
      editId.value = notice._id;
      form.value = {
        title: notice.title,
        content: notice.content,
        publishDate: notice.publishDate.substring(0, 10),
        expireDate: notice.expireDate ? notice.expireDate.substring(0, 10) : '',
        status: notice.status
      };
      showModal();
    };

    const showModal = () => {
      if (!modalInstance) {
        modalInstance = new Modal(noticeModalRef.value);
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
        // Parse dates
        const payload = {
          title: form.value.title,
          content: form.value.content,
          publishDate: new Date(form.value.publishDate),
          expireDate: form.value.expireDate ? new Date(form.value.expireDate) : null,
          status: form.value.status
        };

        if (isEditMode.value) {
          const res = await axios.put(`/api/admin/notices/${editId.value}`, payload);
          if (res.data.success) {
            successMsg.value = res.data.message;
            await fetchNotices();
            hideModal();
          }
        } else {
          const res = await axios.post('/api/admin/notices', payload);
          if (res.data.success) {
            successMsg.value = res.data.message;
            await fetchNotices();
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
      if (!confirm('確認刪除此公告項目嗎？')) return;
      successMsg.value = '';
      try {
        const res = await axios.delete(`/api/admin/notices/${id}`);
        if (res.data.success) {
          successMsg.value = res.data.message;
          await fetchNotices();
        }
      } catch (err) {
        alert('刪除失敗');
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    onMounted(() => {
      fetchNotices();
    });

    return {
      notices,
      loading,
      saving,
      successMsg,
      isEditMode,
      form,
      noticeModalRef,
      openCreateModal,
      openEditModal,
      handleSubmit,
      handleDelete,
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
