<template>
  <div>
    <div class="row align-items-center mb-4">
      <div class="col-sm-8">
        <h2 class="fw-bold m-0 text-light">後台管理控制台 Admin Dashboard</h2>
        <p class="text-secondary mb-0">維護全站基本運作狀態、審查會員帳號及發布公告</p>
      </div>
      <div class="col-sm-4 text-sm-end mt-3 mt-sm-0">
        <button @click="fetchStats" class="btn btn-outline-warning" :disabled="loading">
          <i class="bi bi-arrow-clockwise"></i> 重新整理
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status"></div>
    </div>

    <div v-else class="row g-4">
      <!-- Stats Cards -->
      <div class="col-md-6 col-lg-3">
        <div class="glass-card border-warning-left text-start">
          <div class="text-secondary fs-7 mb-1">會員總人數</div>
          <div class="fs-2 fw-bold text-warning">{{ stats.userCount }} 人</div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-3">
        <div class="glass-card border-warning-left text-start">
          <div class="text-secondary fs-7 mb-1">管理員人數</div>
          <div class="fs-2 fw-bold text-warning">{{ stats.adminCount }} 人</div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="glass-card border-warning-left text-start">
          <div class="text-secondary fs-7 mb-1">今日系統登入次數</div>
          <div class="fs-2 fw-bold text-warning">{{ stats.todayLogins }} 次</div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="glass-card border-warning-left text-start">
          <div class="text-secondary fs-7 mb-1">系統核心版本</div>
          <div class="fs-2 fw-bold text-warning">{{ stats.systemVersion }}</div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="col-lg-6">
        <div class="glass-card h-100">
          <h5 class="fw-bold text-light mb-4"><i class="bi bi-gear text-warning"></i> 快捷管理功能</h5>
          <div class="row g-3">
            <div class="col-6">
              <router-link to="/admin/users" class="btn btn-dark border border-color w-100 py-3 text-start d-flex align-items-center gap-3">
                <span class="fs-3 text-warning"><i class="bi bi-people"></i></span>
                <div>
                  <div class="fw-bold text-light">會員管理</div>
                  <div class="fs-8 text-secondary">審查與啟停用</div>
                </div>
              </router-link>
            </div>
            <div class="col-6">
              <router-link to="/admin/categories" class="btn btn-dark border border-color w-100 py-3 text-start d-flex align-items-center gap-3">
                <span class="fs-3 text-warning"><i class="bi bi-tags"></i></span>
                <div>
                  <div class="fw-bold text-light">項目分類</div>
                  <div class="fs-8 text-secondary">維護預設項目</div>
                </div>
              </router-link>
            </div>
            <div class="col-6">
              <router-link to="/admin/notices" class="btn btn-dark border border-color w-100 py-3 text-start d-flex align-items-center gap-3">
                <span class="fs-3 text-warning"><i class="bi bi-megaphone"></i></span>
                <div>
                  <div class="fw-bold text-light">公告管理</div>
                  <div class="fs-8 text-secondary">發布全站最新公告</div>
                </div>
              </router-link>
            </div>
            <div class="col-6">
              <router-link to="/admin/system-logs" class="btn btn-dark border border-color w-100 py-3 text-start d-flex align-items-center gap-3">
                <span class="fs-3 text-warning"><i class="bi bi-terminal"></i></span>
                <div>
                  <div class="fw-bold text-light">操作日誌</div>
                  <div class="fs-8 text-secondary">安全審計追蹤</div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- System Notice Summary -->
      <div class="col-lg-6">
        <div class="glass-card h-100">
          <h5 class="fw-bold text-light mb-3"><i class="bi bi-info-circle text-warning"></i> 後台守則與說明</h5>
          <p class="text-secondary fs-7">
            作為系統管理員，您負責維護平台正常運作，包含設定基本的「收入、支出、資產分類」、發布系統公告，以及在前台會員違反規則時將其帳號停權。
          </p>
          <div class="alert alert-warning bg-warning-light text-warning border-0 p-3 fs-8">
            <i class="bi bi-shield-exclamation"></i> <strong>重要安全性限制：</strong><br>
            依據系統設計架構，管理員帳號<strong>「不具備」</strong>修改或檢視個別會員財務隱私資料（如收入明細、投資明細及資產池金額）的權限，亦不得干涉會員進行的退休缺口分析結果。所有隱私權限均實施嚴格的角色隔離(RBAC)。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'AdminDashboardView',
  setup() {
    const stats = ref({});
    const loading = ref(true);

    const fetchStats = async () => {
      loading.value = true;
      try {
        const res = await axios.get('/api/admin/dashboard');
        if (res.data.success) {
          stats.value = res.data.data;
        }
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchStats();
    });

    return {
      stats,
      loading,
      fetchStats
    };
  }
};
</script>

<style scoped>
.border-warning-left {
  border-left: 5px solid var(--accent-orange);
}
.bg-warning-light {
  background-color: rgba(245, 158, 11, 0.08);
}
.fs-7 {
  font-size: 0.9rem;
}
.fs-8 {
  font-size: 0.8rem;
}
</style>
