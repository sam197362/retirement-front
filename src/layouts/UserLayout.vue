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
      <div class="sidebar-heading text-center py-4 primary-color fs-4 fw-bold border-bottom border-color d-flex align-items-center justify-content-between px-3">
        <router-link to="/" class="text-decoration-none">
          <span class="gradient-text-green">退休理財規劃</span>
        </router-link>
        <button class="btn text-secondary d-lg-none p-0 border-0" @click="toggleSidebar">
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <div class="list-group list-group-flush p-3">
        <router-link to="/dashboard" class="nav-link-custom mb-2" exact-active-class="active" @click="closeSidebarOnMobile">
          <i class="bi bi-speedometer2"></i> 控制台 Dashboard
        </router-link>
        <router-link to="/dashboard/income" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-wallet2"></i> 收入來源管理
        </router-link>
        <router-link to="/dashboard/expense" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-cart3"></i> 支出費用管理
        </router-link>
        <router-link to="/dashboard/investment" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-graph-up-arrow"></i> 投資計畫管理
        </router-link>
        <router-link to="/dashboard/asset" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-bank"></i> 資產配置管理
        </router-link>
        <router-link to="/dashboard/simulators" class="nav-link-custom mb-2" @click="closeSidebarOnMobile">
          <i class="bi bi-calculator"></i> 退休年金與成長試算
        </router-link>
        <router-link to="/dashboard/profile" class="nav-link-custom mb-4" @click="closeSidebarOnMobile">
          <i class="bi bi-person-gear"></i> 個人退休參數設定
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
            <span class="text-secondary">歡迎回來，</span>
            <span class="fw-bold text-light">{{ user?.name || '尊榮會員' }}</span>
          </div>

          <div class="ms-auto d-flex align-items-center gap-2 gap-sm-3">
            <span class="badge bg-success-light text-success px-2 px-sm-3 py-2 rounded-pill fs-8">一般會員</span>
            <router-link to="/" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
              <i class="bi bi-house"></i> <span class="d-none d-sm-inline">回首頁</span>
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
  name: 'UserLayout',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const isSidebarToggled = ref(false);
    const isMobile = ref(false);

    const user = computed(() => authStore.currentUser);

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 992;
    };

    const handleLogout = () => {
      authStore.logout();
      router.push({ name: 'login' });
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
      user,
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

.bg-success-light {
  background-color: rgba(25, 135, 84, 0.15);
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
