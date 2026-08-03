<template>
  <div class="d-flex" id="wrapper" :class="{ 'toggled': isSidebarToggled }">
    <!-- Mobile Backdrop Overlay -->
    <div 
      v-if="isSidebarToggled && isMobile" 
      class="sidebar-backdrop" 
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <div class="bg-dark-secondary border-end border-color" id="sidebar-wrapper">
      <div class="sidebar-heading text-center py-4 fs-4 fw-bold border-bottom border-color d-flex align-items-center justify-content-between px-3">
        <router-link to="/admin/dashboard" class="text-decoration-none">
          <span class="gradient-text-orange">管理員後台</span>
        </router-link>
        <button class="btn text-secondary d-lg-none p-0 border-0" @click="toggleSidebar">
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <div class="list-group list-group-flush p-3">
        <router-link to="/admin/dashboard" class="nav-link-custom mb-2" exact-active-class="active" @click="closeSidebarOnMobile">
          <i class="bi bi-shield-lock"></i> 後台 Dashboard
        </router-link>
        <router-link to="/admin/users" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-people"></i> 前台會員管理
        </router-link>
        <router-link to="/admin/manage-admins" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-person-badge"></i> 管理員帳號維護
        </router-link>
        <router-link to="/admin/categories" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-tags"></i> 預設項目分類
        </router-link>
        <router-link to="/admin/notices" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-megaphone"></i> 公告資訊管理
        </router-link>
        <router-link to="/admin/system-logs" class="nav-link-custom mb-4" @click="closeSidebarOnMobile">
          <i class="bi bi-terminal"></i> 系統操作日誌
        </router-link>
        <hr class="border-color">
        <button @click="handleLogout" class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 mt-2">
          <i class="bi bi-box-arrow-right"></i> 安全登出
        </button>
      </div>
    </div>
    <!-- /#sidebar-wrapper -->

    <!-- Page Content -->
    <div id="page-content-wrapper">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark-secondary border-bottom border-color py-3 px-3 px-lg-4">
        <div class="container-fluid p-0">
          <button class="btn btn-outline-secondary me-3 d-lg-none" @click="toggleSidebar" aria-label="Toggle Navigation">
            <i class="bi bi-list fs-5"></i>
          </button>
          
          <div class="d-none d-sm-block">
            <span class="text-secondary">您好，管理員 </span>
            <span class="fw-bold text-warning">{{ admin?.name || 'Admin' }}</span>
          </div>

          <div class="ms-auto d-flex align-items-center gap-2 gap-sm-3">
            <span class="badge bg-warning-light text-warning px-2 px-sm-3 py-2 rounded-pill fs-8">系統管理員</span>
            <router-link to="/" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
              <i class="bi bi-house"></i> <span class="d-none d-sm-inline">回前台首頁</span>
            </router-link>
          </div>
        </div>
      </nav>

      <div class="main-body-container p-3 p-md-4">
        <router-view></router-view>
      </div>
    </div>
    <!-- /#page-content-wrapper -->
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminLayout',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const isSidebarToggled = ref(false);
    const isMobile = ref(false);

    const admin = computed(() => authStore.currentAdmin);

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 992;
    };

    const handleLogout = () => {
      authStore.adminLogout();
      router.push({ name: 'admin-login' });
    };

    const toggleSidebar = () => {
      isSidebarToggled.value = !isSidebarToggled.value;
    };

    const closeSidebarOnMobile = () => {
      if (isMobile.value) {
        isSidebarToggled.value = false;
      }
    };

    onMounted(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile);
    });

    return {
      admin,
      isSidebarToggled,
      isMobile,
      handleLogout,
      toggleSidebar,
      closeSidebarOnMobile
    };
  }
};
</script>

<style scoped>
#wrapper {
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;
}

#sidebar-wrapper {
  min-height: 100vh;
  width: 260px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  z-index: 1050;
  background-color: var(--bg-dark-secondary, #1e293b);
}

#page-content-wrapper {
  width: 100%;
  flex-grow: 1;
  min-width: 0;
  transition: all 0.3s ease;
}

.main-body-container {
  background-color: var(--bg-dark-primary, #0f172a);
  min-height: calc(100vh - 73px);
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1040;
}

.gradient-text-orange {
  background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-warning-light {
  background-color: rgba(245, 158, 11, 0.15);
}

.fs-8 {
  font-size: 0.8rem;
}

/* Mobile RWD Styling */
@media (max-width: 991.98px) {
  #sidebar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
  }

  #wrapper.toggled #sidebar-wrapper {
    transform: translateX(0);
  }
}

@media (min-width: 992px) {
  #sidebar-wrapper {
    transform: translateX(0) !important;
  }
  #wrapper.toggled #sidebar-wrapper {
    margin-left: -260px;
  }
}
</style>
