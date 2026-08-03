<template>
  <div>
    <div class="row align-items-center mb-4">
      <div class="col-sm-8">
        <h2 class="fw-bold m-0 text-light"><i class="bi bi-terminal text-warning me-2"></i> 系統操作日誌</h2>
        <p class="text-secondary mb-0">安全審計追蹤：查看管理員與重要會員操作的記錄日誌</p>
      </div>
      <div class="col-sm-4 text-sm-end mt-3 mt-sm-0">
        <button @click="fetchLogs" class="btn btn-outline-warning btn-sm px-3" :disabled="loading">
          <i class="bi bi-arrow-clockwise"></i> 刷新日誌
        </button>
      </div>
    </div>

    <!-- Logs List Card -->
    <div class="glass-card">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
      </div>

      <div v-else-if="logs.length === 0" class="text-center py-5 text-secondary">
        目前無系統操作紀錄。
      </div>

      <div v-else class="table-responsive">
        <table class="table table-custom align-middle">
          <thead>
            <tr>
              <th>操作時間</th>
              <th>操作者姓名</th>
              <th>身份類型</th>
              <th>操作行為</th>
              <th>來源 IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log._id">
              <td class="text-light">{{ formatDateTime(log.createdAt) }}</td>
              <td>
                <span v-if="log.userId" class="fw-bold">
                  {{ log.userId.name }} 
                  <span class="text-secondary fs-8" v-if="log.userId.email">({{ log.userId.email }})</span>
                  <span class="text-secondary fs-8" v-else-if="log.userId.account">({{ log.userId.account }})</span>
                </span>
                <span v-else class="text-secondary italic">未知使用者</span>
              </td>
              <td>
                <span v-if="log.role === 'admin' || log.role === 'super_admin'" class="badge bg-warning-light text-warning px-2.5 py-1.5 rounded-pill">
                  <i class="bi bi-shield-lock"></i> 管理員
                </span>
                <span v-else class="badge bg-success-light text-success px-2.5 py-1.5 rounded-pill">
                  <i class="bi bi-person"></i> 會員
                </span>
              </td>
              <td class="fw-bold text-light">{{ log.action }}</td>
              <td><code>{{ log.ip || '-' }}</code></td>
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
  name: 'SystemLogView',
  setup() {
    const logs = ref([]);
    const loading = ref(true);

    const fetchLogs = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/api/admin/system-logs');
        if (res.data.success) {
          logs.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to load system logs', err);
      } finally {
        loading.value = false;
      }
    };

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };

    onMounted(() => {
      fetchLogs();
    });

    return {
      logs,
      loading,
      fetchLogs,
      formatDateTime
    };
  }
};
</script>

<style scoped>
.bg-success-light {
  background-color: rgba(25, 135, 84, 0.12);
}
.bg-warning-light {
  background-color: rgba(245, 158, 11, 0.12);
}
.fs-8 {
  font-size: 0.8rem;
}
code {
  color: var(--text-secondary);
}
</style>
